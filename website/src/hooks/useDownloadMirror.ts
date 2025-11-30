import { useState, useEffect, useCallback, useRef } from 'react'

// 镜像配置
const MIRRORS = {
  cloudflare: 'https://download.moryflow.com',
  github: 'https://github.com/dvlin-dev/moryflow/releases/download',
} as const

type MirrorType = keyof typeof MIRRORS

interface DownloadManifest {
  version: string
  releaseDate: string
  downloads: {
    'mac-arm64': { filename: string; cloudflare: string; github: string }
    'win-x64': { filename: string; cloudflare: string; github: string }
    'linux-x64': { filename: string; cloudflare: string; github: string }
  }
}

interface MirrorState {
  preferred: MirrorType
  latency: Record<MirrorType, number | null>
  isDetecting: boolean
}

interface UseDownloadMirrorReturn {
  /** 当前版本信息 */
  version: string | null
  /** 是否正在加载 manifest */
  isLoading: boolean
  /** 错误信息 */
  error: string | null
  /** 首选镜像 */
  preferredMirror: MirrorType
  /** 各镜像延迟（ms） */
  mirrorLatency: Record<MirrorType, number | null>
  /** 是否正在检测镜像 */
  isDetecting: boolean
  /** 获取下载 URL */
  getDownloadUrl: (platform: 'mac' | 'win' | 'linux') => string | null
  /** 触发下载 */
  download: (platform: 'mac' | 'win' | 'linux') => void
}

// 检测单个镜像延迟
async function measureLatency(url: string, timeout = 5000): Promise<number> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  const start = performance.now()
  try {
    // 使用 HEAD 请求测试连通性，添加 cache-busting 参数
    const response = await fetch(`${url}?_t=${Date.now()}`, {
      method: 'HEAD',
      signal: controller.signal,
      cache: 'no-store',
    })
    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    return performance.now() - start
  } catch (error) {
    clearTimeout(timeoutId)
    throw error
  }
}

// 并行检测所有镜像，返回最快的
async function detectFastestMirror(): Promise<{
  preferred: MirrorType
  latency: Record<MirrorType, number | null>
}> {
  const results: Record<MirrorType, number | null> = {
    cloudflare: null,
    github: null,
  }

  // 测试 URL
  const testUrls: Record<MirrorType, string> = {
    cloudflare: `${MIRRORS.cloudflare}/manifest.json`,
    // GitHub releases 不支持 HEAD，用 API 测试连通性
    github: 'https://api.github.com/repos/dvlin-dev/moryflow/releases/latest',
  }

  // 并行测试所有镜像
  const tests = Object.entries(testUrls).map(async ([mirror, url]) => {
    try {
      const latency = await measureLatency(url)
      results[mirror as MirrorType] = Math.round(latency)
      return { mirror: mirror as MirrorType, latency }
    } catch {
      results[mirror as MirrorType] = null
      return { mirror: mirror as MirrorType, latency: Infinity }
    }
  })

  // 等待所有测试完成（最多等 5 秒）
  await Promise.race([
    Promise.all(tests),
    new Promise(resolve => setTimeout(resolve, 5000)),
  ])

  // 选择延迟最低的可用镜像
  let preferred: MirrorType = 'cloudflare' // 默认国内
  let minLatency = Infinity

  for (const [mirror, latency] of Object.entries(results)) {
    if (latency !== null && latency < minLatency) {
      minLatency = latency
      preferred = mirror as MirrorType
    }
  }

  return { preferred, latency: results }
}

export function useDownloadMirror(): UseDownloadMirrorReturn {
  const [manifest, setManifest] = useState<DownloadManifest | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mirrorState, setMirrorState] = useState<MirrorState>({
    preferred: 'cloudflare',
    latency: { cloudflare: null, github: null },
    isDetecting: true,
  })

  const hasDetected = useRef(false)

  // 获取 manifest 和检测镜像（并行）
  useEffect(() => {
    if (hasDetected.current) return
    hasDetected.current = true

    const init = async () => {
      // 并行执行：获取 manifest + 检测镜像
      const [manifestResult, mirrorResult] = await Promise.allSettled([
        // 获取 manifest
        fetch(`${MIRRORS.cloudflare}/manifest.json?_t=${Date.now()}`)
          .then(res => {
            if (!res.ok) throw new Error('Failed to fetch manifest')
            return res.json() as Promise<DownloadManifest>
          }),
        // 检测镜像
        detectFastestMirror(),
      ])

      // 处理 manifest 结果
      if (manifestResult.status === 'fulfilled') {
        setManifest(manifestResult.value)
      } else {
        setError('无法获取版本信息')
        console.error('Failed to fetch manifest:', manifestResult.reason)
      }

      // 处理镜像检测结果
      if (mirrorResult.status === 'fulfilled') {
        setMirrorState({
          preferred: mirrorResult.value.preferred,
          latency: mirrorResult.value.latency,
          isDetecting: false,
        })
        console.log(
          `[Mirror] 首选: ${mirrorResult.value.preferred}`,
          `| CF: ${mirrorResult.value.latency.cloudflare ?? 'N/A'}ms`,
          `| GH: ${mirrorResult.value.latency.github ?? 'N/A'}ms`
        )
      } else {
        setMirrorState(prev => ({ ...prev, isDetecting: false }))
      }

      setIsLoading(false)
    }

    init()
  }, [])

  // 获取下载 URL
  const getDownloadUrl = useCallback((platform: 'mac' | 'win' | 'linux'): string | null => {
    if (!manifest) return null

    const platformKey = {
      mac: 'mac-arm64',
      win: 'win-x64',
      linux: 'linux-x64',
    }[platform] as keyof DownloadManifest['downloads']

    const download = manifest.downloads[platformKey]
    if (!download?.filename) return null

    // 根据首选镜像返回 URL
    return mirrorState.preferred === 'cloudflare'
      ? download.cloudflare
      : download.github
  }, [manifest, mirrorState.preferred])

  // 触发下载
  const download = useCallback((platform: 'mac' | 'win' | 'linux') => {
    const url = getDownloadUrl(platform)
    if (url) {
      // 使用 a 标签触发下载，避免被浏览器拦截
      const a = document.createElement('a')
      a.href = url
      a.download = ''
      a.rel = 'noopener noreferrer'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    }
  }, [getDownloadUrl])

  return {
    version: manifest?.version ?? null,
    isLoading,
    error,
    preferredMirror: mirrorState.preferred,
    mirrorLatency: mirrorState.latency,
    isDetecting: mirrorState.isDetecting,
    getDownloadUrl,
    download,
  }
}
