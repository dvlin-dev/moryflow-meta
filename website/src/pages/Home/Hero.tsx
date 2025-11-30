
import { motion } from 'framer-motion';
import { Command } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative w-full min-h-screen flex flex-col items-center pt-32 pb-20 overflow-hidden">
      
      {/* Background Ambient Light (Arc Style) */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-orange-200/30 rounded-full blur-[120px] animate-float" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] bg-blue-200/20 rounded-full blur-[100px] animate-float" style={{ animationDelay: '2s' }} />
      
      <div className="container mx-auto px-4 sm:px-6 relative z-10 flex flex-col items-center text-center">
        
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
          <span className="text-xs font-medium text-mory-text-secondary tracking-wide uppercase">Public Beta Now Available</span>
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
          className="font-serif text-5xl md:text-7xl lg:text-8xl font-bold text-mory-text-primary tracking-tight mb-6 text-balance leading-[1.1]"
        >
          你的思维，<br className="hidden md:block" />
          安全着陆在本地。<br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-mory-orange to-mory-coral">AI</span> 随时待命。
        </motion.h1>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="max-w-2xl text-lg md:text-xl text-mory-text-secondary mb-10 leading-relaxed text-balance"
        >
          Moryflow 是一个本地优先的智能工作台。<br className="hidden sm:block" />
          左侧管理本地文件，中间流畅书写，右侧 AI 助手随叫随到。<br />
          没有云端焦虑，只有纯粹的心流。
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          className="flex flex-col sm:flex-row items-center gap-4 mb-20"
        >
          <button className="group relative px-8 py-4 bg-mory-text-primary text-white rounded-2xl font-medium text-lg shadow-xl shadow-black/5 hover:shadow-2xl hover:shadow-orange-500/20 transition-all hover:-translate-y-1 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-gray-800 to-black opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="relative flex items-center gap-2">
              <Download size={20} />
              免费下载 Mac 版
            </span>
          </button>
          <button className="px-8 py-4 bg-white text-mory-text-primary border border-gray-200 rounded-2xl font-medium text-lg shadow-sm hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center gap-2">
            <HardDrive size={20} />
            Windows 版本
          </button>
        </motion.div>

        {/* App Preview - Isometric Hero Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, rotateX: 10 }}
          animate={{ opacity: 1, scale: 1, rotateX: 0 }}
          transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
          className="relative w-full max-w-5xl mx-auto"
        >
          {/* Glow behind image */}
          <div className="absolute -inset-4 bg-gradient-to-t from-mory-orange/20 to-purple-500/20 blur-3xl -z-10 rounded-[3rem]" />
          
          <div className="rounded-[2rem] overflow-hidden border-[8px] border-white/80 shadow-2xl bg-mory-bg/50 backdrop-blur-sm">
             <img
              src="https://aibuildcdn-dev.geesdev.com/assets/onepage/agent/images/1764354288766.png?imageMogr2/format/webp"
              alt="Moryflow App Interface"
              className="w-full h-auto block rounded-[1.5rem]"
            />
            {/* Interactive overlay hint */}
            <div className="absolute bottom-8 right-8 bg-black/80 text-white text-xs px-3 py-1.5 rounded-lg backdrop-blur-md flex items-center gap-1.5">
              <Command size={12} /> <span>+ K</span> to ask Mory
            </div>
          </div>
        </motion.div>

      </div>
      
      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-mory-text-muted"
      >
        <span className="text-[10px] uppercase tracking-widest">Scroll to Explore</span>
        <div className="w-[1px] h-12 bg-gradient-to-b from-mory-text-muted/50 to-transparent" />
      </motion.div>
    </section>
  );
}

// Helper icon components
function Download({ size = 24, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" x2="12" y1="15" y2="3" />
    </svg>
  )
}

function HardDrive({ size = 24, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <line x1="22" y1="12" x2="2" y2="12" />
      <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
      <line x1="6" y1="16" x2="6.01" y2="16" />
      <line x1="10" y1="16" x2="10.01" y2="16" />
    </svg>
  )
}
