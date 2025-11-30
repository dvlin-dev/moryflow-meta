
import { motion } from 'framer-motion';

export default function HeroNew() {
  const scrollToDownload = () => {
    const downloadSection = document.getElementById('download');
    if (downloadSection) {
      downloadSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative w-full min-h-screen flex flex-col items-center justify-center pt-32 pb-20 px-4 sm:px-6 overflow-hidden">
      
      {/* Background Ambient Light (Arc Style) */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-orange-200/30 rounded-full blur-[120px] animate-float" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-200/20 rounded-full blur-[100px] animate-float" style={{ animationDelay: '2s' }} />
      
      <div className="container mx-auto relative z-10 flex flex-col items-center text-center max-w-6xl">
        
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/60 border border-white/60 backdrop-blur-md shadow-sm mb-8"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-mory-orange opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-mory-orange"></span>
          </span>
          <span className="text-xs font-medium text-mory-text-secondary tracking-wide">Beta</span>
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
          className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-mory-text-primary tracking-tight mb-8 text-balance leading-[1.1]"
        >
          一个真正懂你的<br />
          <span className="text-mory-orange">AI 笔记助手</span>
        </motion.h1>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="max-w-3xl text-lg sm:text-xl md:text-2xl text-mory-text-secondary mb-12 leading-relaxed text-balance"
        >
          Mory 不只是陪你聊天，它能帮你整理笔记、搜索资料、规划任务。<br />
          更重要的是，<span className="font-medium text-mory-text-primary">你的所有数据都安全地存在自己电脑里。</span>
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          className="flex flex-col sm:flex-row items-center gap-4 mb-16"
        >
          <button 
            onClick={scrollToDownload}
            className="group relative px-10 py-5 bg-mory-text-primary text-white rounded-2xl font-medium text-xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-gray-800 to-black opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="relative flex items-center gap-2">
              <DownloadIcon size={22} />
              免费下载试用
            </span>
          </button>
          <div className="text-sm text-mory-text-muted">
            支持 Mac 和 Windows · 完全免费
          </div>
        </motion.div>

        {/* App Preview */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5, ease: [0.25, 0.4, 0.25, 1] }}
          className="relative w-full max-w-6xl mx-auto"
        >
          {/* Glow behind image */}
          <div className="absolute -inset-4 bg-gradient-to-t from-mory-orange/20 via-purple-500/10 to-transparent blur-3xl -z-10 rounded-[3rem]" />
          
          <div className="rounded-3xl overflow-hidden border-[12px] border-white/90 shadow-2xl bg-white/50 backdrop-blur-sm">
            <img
              src="https://aibuildcdn-dev.geesdev.com/assets/onepage/agent/images/1764354288766.png?imageMogr2/format/webp"
              alt="Moryflow 应用界面 - 三栏布局"
              className="w-full h-auto block"
              loading="eager"
            />
          </div>
        </motion.div>

      </div>
      
      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-mory-text-muted"
      >
        <span className="text-[10px] uppercase tracking-widest font-medium">向下滚动了解更多</span>
        <div className="w-[1px] h-12 bg-gradient-to-b from-mory-text-muted/50 to-transparent" />
      </motion.div>
    </section>
  );
}

// Helper icon components
function DownloadIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" x2="12" y1="15" y2="3" />
    </svg>
  );
}


