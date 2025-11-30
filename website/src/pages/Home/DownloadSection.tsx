
import { motion } from 'framer-motion';
import { Download, Apple, Monitor, Github } from 'lucide-react';

export default function DownloadSection() {
  return (
    <section id="download" className="py-32 px-4 sm:px-6 bg-mory-warm relative overflow-hidden scroll-mt-20">
      
      <div className="container mx-auto text-center">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <h2 className="font-serif text-4xl md:text-6xl font-bold text-mory-text-primary mb-6">
            开始使用 Moryflow
          </h2>
          <p className="text-lg text-mory-text-secondary max-w-2xl mx-auto">
            选择适合你的平台，数据永远属于你自己。<br />
            目前处于公开测试阶段，完全免费。
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
            className="group bg-white rounded-3xl p-8 border border-gray-100 hover:border-mory-orange/30 transition-all hover:-translate-y-2"
          >
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-mory-orange/10 transition-colors">
              <Apple size={32} className="text-mory-text-primary" />
            </div>
            <h3 className="text-2xl font-serif font-bold text-mory-text-primary mb-3">
              macOS
            </h3>
            <p className="text-mory-text-secondary mb-6">
              支持 macOS 11 Big Sur 及更高版本<br />
              Intel 和 Apple Silicon 芯片均可使用
            </p>
            <button className="w-full flex items-center justify-center gap-2 bg-mory-text-primary text-white px-6 py-4 rounded-2xl font-medium hover:bg-black transition-all group-hover:shadow-lg">
              <Download size={20} />
              下载 Mac 版 (v0.1.0 Beta)
            </button>
          </motion.div>

          {/* Windows */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="group bg-white rounded-3xl p-8 border border-gray-100 hover:border-mory-orange/30 transition-all hover:-translate-y-2"
          >
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-mory-orange/10 transition-colors">
              <Monitor size={32} className="text-mory-text-primary" />
            </div>
            <h3 className="text-2xl font-serif font-bold text-mory-text-primary mb-3">
              Windows
            </h3>
            <p className="text-mory-text-secondary mb-6">
              支持 Windows 10 及更高版本<br />
              64 位系统，建议 8GB 内存以上
            </p>
            <button className="w-full flex items-center justify-center gap-2 bg-mory-text-primary text-white px-6 py-4 rounded-2xl font-medium hover:bg-black transition-all group-hover:shadow-lg">
              <Download size={20} />
              下载 Windows 版 (v0.1.0 Beta)
            </button>
          </motion.div>

        </div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-mory-text-muted"
        >
          <a href="#" className="flex items-center gap-2 hover:text-mory-orange transition-colors">
            <Github size={16} />
            查看源代码
          </a>
          <span className="hidden sm:block w-1 h-1 rounded-full bg-gray-300" />
          <a href="#" className="hover:text-mory-orange transition-colors">
            查看更新日志
          </a>
          <span className="hidden sm:block w-1 h-1 rounded-full bg-gray-300" />
          <a href="#" className="hover:text-mory-orange transition-colors">
            使用文档
          </a>
        </motion.div>

      </div>
    </section>
  );
}
