import { useState, useEffect, useCallback } from 'react'

const DOWNLOAD_BASE = 'https://download.moryflow.com'

type Platform = 'mac' | 'win' | 'linux'

interface DownloadInfo {
  filename: string
  url: string
}

interface Manifest {
  version: string
  releaseDate: string
  downloads: {
    'mac-arm64': { filename: string; cloudflare: string }
    'win-x64': { filename: string; cloudflare: string }
    'linux-x64': { filename: string; cloudflare: string }
  }
}

interface UseDownloadReturn {
  /** 当前版本 */
  version: string | null
  /** 是否正在加载 manifest */
  isLoading: boolean
  /** 获取平台下载信息 */
  getDownloadInfo: (platform: Platform) => DownloadInfo | null
  /** 触发下载，返回 Promise 用于追踪状态 */
  startDownload: (platform: Platform) => Promise<boolean>
}

const PLATFORM_MAP: Record<Platform, keyof Manifest['downloads']> = {
  mac: 'mac-arm64',
  win: 'win-x64',
  linux: 'linux-x64',
}

export function useDownload(): UseDownloadReturn {
  const [manifest, setManifest] = useState<Manifest | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // 获取 manifest
  useEffect(() => {
    const fetchManifest = async () => {
      try {
        const res = await fetch(`${DOWNLOAD_BASE}/manifest.json?_t=${Date.now()}`)
        if (!res.ok) throw new Error('Failed to fetch')
        const data = await res.json()
        setManifest(data)
      } catch (err) {
        console.error('Failed to fetch manifest:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchManifest()
  }, [])

  // 获取下载信息
  const getDownloadInfo = useCallback((platform: Platform): DownloadInfo | null => {
    if (!manifest) return null

    const key = PLATFORM_MAP[platform]
    const info = manifest.downloads[key]

    if (!info?.filename || !info?.cloudflare) return null

    return {
      filename: info.filename,
      url: info.cloudflare,
    }
  }, [manifest])

  // 触发下载
  const startDownload = useCallback(async (platform: Platform): Promise<boolean> => {
    const info = getDownloadInfo(platform)
    if (!info) return false

    // 创建隐藏的 a 标签触发下载
    const link = document.createElement('a')
    link.href = info.url
    link.download = info.filename
    link.style.display = 'none'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    return true
  }, [getDownloadInfo])

  return {
    version: manifest?.version ?? null,
    isLoading,
    getDownloadInfo,
    startDownload,
  }
}
