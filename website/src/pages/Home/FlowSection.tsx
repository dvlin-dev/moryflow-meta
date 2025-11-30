
import { useRef, useState, useEffect } from 'react';
import { motion, useScroll } from 'framer-motion';
import { FolderTree, PenTool, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';

const features = [
  {
    id: 'vault',
    icon: FolderTree,
    title: "你的领地",
    subtitle: "Local Vault",
    desc: "所有文件都在本地文件系统中。你可以随意用其他编辑器打开，没有私有格式，没有云端绑架。这就是你的数据堡垒。",
    highlight: "left-[5%] w-[20%]" // Positioning for the highlight overlay
  },
  {
    id: 'editor',
    icon: PenTool,
    title: "你的画布",
    subtitle: "Notion-style Editor",
    desc: "流畅的 Markdown 编辑体验，支持 Slash 命令、数学公式和双向链接。专注于书写，而不是排版。",
    highlight: "left-[26%] w-[48%]"
  },
  {
    id: 'agent',
    icon: Bot,
    title: "你的搭档",
    subtitle: "Mory AI Agent",
    desc: "不只是聊天。Mory 可以读取你的 Vault，帮你重构代码、整理笔记、甚至联网搜索最新资讯。它是真正懂你的副驾驶。",
    highlight: "right-[1%] w-[24%]"
  }
];

export default function FlowSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeFeature, setActiveFeature] = useState(0);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Map scroll progress to active feature index (0, 1, 2)
  useEffect(() => {
    const unsubscribe = scrollYProgress.on("change", (latest) => {
      if (latest < 0.3) setActiveFeature(0);
      else if (latest < 0.7) setActiveFeature(1);
      else setActiveFeature(2);
    });
    return () => unsubscribe();
  }, [scrollYProgress]);

  return (
    <section ref={containerRef} className="relative lg:h-[300vh] h-auto bg-mory-bg">
      
      <div className="lg:sticky lg:top-0 lg:h-screen relative h-auto flex flex-col lg:flex-row items-center justify-center overflow-hidden px-6 py-20">
        
        {/* Left: Text Content */}
        <div className="w-full lg:w-1/3 flex flex-col justify-center z-20 lg:pr-12 mb-12 lg:mb-0">
          <div className="space-y-12">
            {features.map((feature, index) => (
              <motion.div
                key={feature.id}
                initial={false}
                animate={{
                  opacity: activeFeature === index ? 1 : 0.3,
                  x: activeFeature === index ? 0 : -20,
                  scale: activeFeature === index ? 1 : 0.95
                }}
                transition={{ duration: 0.5 }}
                className="cursor-pointer group"
                onClick={() => {
                  // Allow clicking to jump (would need scrollTo implementation)
                  setActiveFeature(index);
                }}
              >
                <div className="flex items-center gap-4 mb-2">
                  <div className={cn(
                    "p-3 rounded-xl transition-colors duration-300",
                    activeFeature === index ? "bg-mory-orange text-white" : "bg-gray-200 text-gray-500"
                  )}>
                    <feature.icon size={24} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-serif font-bold text-mory-text-primary">{feature.title}</h3>
                    <span className="text-xs font-medium uppercase tracking-wider text-mory-text-muted">{feature.subtitle}</span>
                  </div>
                </div>
                <p className="pl-[4.5rem] text-base text-mory-text-secondary leading-relaxed max-w-md">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right: Visual Representation */}
        <div className="w-full lg:w-2/3 relative flex items-center justify-center h-[50vh] lg:h-auto">
          <div className="relative w-full max-w-4xl aspect-[16/10] rounded-2xl border-8 border-white bg-white shadow-2xl overflow-hidden transform transition-transform duration-700 ease-out">
            {/* Base Image */}
            <img 
              src="https://aibuildcdn-dev.geesdev.com/assets/onepage/agent/images/1764354288766.png?imageMogr2/format/webp" 
              alt="App Interface" 
              className="absolute inset-0 w-full h-full object-cover"
            />

            {/* Dim Overlay */}
            <div className="absolute inset-0 bg-black/20 transition-opacity duration-500" />

            {/* Highlight Spotlights - Using CSS Layout to match the 3 columns approx */}
            {/* Left Col Highlight */}
            <motion.div 
              className="absolute top-4 bottom-4 left-4 w-[20%] bg-white/10 border-2 border-mory-orange/50 rounded-lg shadow-[0_0_30px_rgba(255,159,28,0.3)] backdrop-blur-[2px] z-10"
              animate={{ 
                opacity: activeFeature === 0 ? 1 : 0,
                scale: activeFeature === 0 ? 1.02 : 0.98
              }}
            />

             {/* Center Col Highlight */}
             <motion.div 
              className="absolute top-4 bottom-4 left-[23%] right-[28%] bg-white/10 border-2 border-mory-orange/50 rounded-lg shadow-[0_0_30px_rgba(255,159,28,0.3)] backdrop-blur-[2px] z-10"
              animate={{ 
                opacity: activeFeature === 1 ? 1 : 0,
                scale: activeFeature === 1 ? 1.02 : 0.98
              }}
            />

            {/* Right Col Highlight */}
            <motion.div 
              className="absolute top-4 bottom-4 right-4 w-[25%] bg-white/10 border-2 border-mory-orange/50 rounded-lg shadow-[0_0_30px_rgba(255,159,28,0.3)] backdrop-blur-[2px] z-10"
              animate={{ 
                opacity: activeFeature === 2 ? 1 : 0,
                scale: activeFeature === 2 ? 1.02 : 0.98
              }}
            />

          </div>
        </div>

      </div>
    </section>
  );
}
