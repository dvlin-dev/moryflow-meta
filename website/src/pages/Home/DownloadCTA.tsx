import { motion } from 'framer-motion'
import { Download, Apple, Monitor, Loader2, CheckCircle2, Globe } from 'lucide-react'
import { useDownloadMirror } from '../../hooks/useDownloadMirror'

export default function DownloadCTA() {
  const { version, isLoading, preferredMirror, mirrorLatency, isDetecting, download } =
    useDownloadMirror()

  // 镜像状态指示器
  const MirrorIndicator = () => {
    if (isDetecting) {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs text-mory-text-muted">
          <Loader2 size={12} className="animate-spin" />
          检测最佳线路...
        </span>
      )
    }

    const mirrorName = '全球加速'
    const latency = mirrorLatency[preferredMirror]

    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-mory-text-muted">
        <CheckCircle2 size={12} className="text-green-500" />
        {mirrorName}
        {latency !== null && <span className="text-green-600">({latency}ms)</span>}
      </span>
    )
  }

  return (
    <section
      id="download"
      className="py-32 px-4 sm:px-6 bg-gradient-to-b from-white to-mory-warm relative overflow-hidden scroll-mt-20"
    >
      {/* Decorative glows */}
      <div className="absolute top-20 left-1/4 w-96 h-96 bg-orange-300/20 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-purple-300/15 rounded-full blur-3xl" />

      <div className="container mx-auto text-center max-w-6xl relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <h2 className="font-serif text-4xl md:text-6xl font-bold text-mory-text-primary mb-6">
            准备好认识 Mory 了吗？
          </h2>
          <p className="text-lg md:text-xl text-mory-text-secondary max-w-2xl mx-auto">
            完全免费，下载就能用。
            <br />
            <span className="font-medium text-mory-text-primary">
              从今天开始，你就有一个会思考的伙伴了。
            </span>
          </p>
        </motion.div>

        {/* Download Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
          {/* macOS */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="group relative"
          >
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-orange-400/20 to-purple-400/20 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative glass-panel bg-gradient-to-br from-white/96 to-white/92 backdrop-blur-lg rounded-3xl p-10 border border-white/85 hover:border-white/90 transition-all hover:-translate-y-2 shadow-[0_4px_24px_0_rgba(0,0,0,0.04)] hover:shadow-[0_8px_32px_0_rgba(0,0,0,0.08)] shadow-gray-200/50 flex flex-col items-center text-center">
              <div className="w-20 h-20 glass-panel bg-white/95 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 group-hover:bg-orange-50/80 transition-colors border border-white/80 shadow-sm shadow-gray-200/30">
                <Apple size={40} className="text-mory-text-primary" />
              </div>
              <h3 className="text-3xl font-serif font-bold text-mory-text-primary mb-8">macOS</h3>
              <button
                onClick={() => download('mac')}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 bg-mory-text-primary text-white px-6 py-4 rounded-2xl font-medium text-lg hover:bg-black transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <Download size={20} />
                )}
                下载 Mac 版
              </button>
              <p className="mt-3 text-xs text-mory-text-muted">Apple Silicon (M1/M2/M3)</p>
            </div>
          </motion.div>

          {/* Windows */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="group relative"
          >
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-orange-400/20 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative glass-panel bg-white/70 backdrop-blur-xl rounded-3xl p-10 border-2 border-white/50 hover:border-white/70 transition-all hover:-translate-y-2 shadow-xl hover:shadow-2xl flex flex-col items-center text-center">
              <div className="w-20 h-20 glass-panel bg-white/60 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 group-hover:bg-orange-50/80 transition-colors border border-white/40">
                <Monitor size={40} className="text-mory-text-primary" />
              </div>
              <h3 className="text-3xl font-serif font-bold text-mory-text-primary mb-8">Windows</h3>
              <button
                onClick={() => download('win')}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 bg-mory-text-primary text-white px-6 py-4 rounded-2xl font-medium text-lg hover:bg-black transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <Download size={20} />
                )}
                下载 Windows 版
              </button>
              <p className="mt-3 text-xs text-mory-text-muted">Windows 10/11 (64-bit)</p>
            </div>
          </motion.div>
        </div>

        {/* Version & Mirror Info */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-12 flex flex-col items-center gap-2"
        >
          <div className="flex items-center gap-3 text-sm text-mory-text-muted">
            {version ? <span>v{version}</span> : <span>Beta</span>}
            <span className="w-px h-3 bg-mory-text-muted/30" />
            <MirrorIndicator />
          </div>

          {/* 镜像切换提示 */}
          {!isDetecting && (
            <p className="text-xs text-mory-text-muted/60 flex items-center gap-1">
              <Globe size={10} />
              自动选择最快下载线路
            </p>
          )}
        </motion.div>
      </div>
    </section>
  )
}
