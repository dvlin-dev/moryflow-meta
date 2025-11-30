
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const cards = [
  {
    title: "帮我搜搜",
    subtitle: "Web Search",
    desc: "Mory 实时连接互联网。无论是查找最新的 API 文档，还是调研竞品信息，无需切换浏览器，结果直接引用到笔记中。",
    image: "https://aibuildcdn-dev.geesdev.com/assets/onepage/agent/images/1764354279906.png?imageMogr2/format/webp",
    color: "from-orange-50 to-orange-100",
    textColor: "text-orange-600"
  },
  {
    title: "帮我整理",
    subtitle: "Vault Insight",
    desc: "你的私人图书管理员。Mory 可以阅读你的整个 Vault，找出相关联的笔记，甚至帮你自动打标签、生成目录。",
    image: "https://aibuildcdn-dev.geesdev.com/assets/onepage/agent/images/1764354278010.png?imageMogr2/format/webp",
    color: "from-green-50 to-green-100",
    textColor: "text-green-600"
  },
  {
    title: "帮我规划",
    subtitle: "Task Planning",
    desc: "给 Mory 一个模糊的目标，比如“写一份产品方案”。它会帮你拆解成具体的 To-do List，并一步步辅助你完成。",
    image: "https://aibuildcdn-dev.geesdev.com/assets/onepage/agent/images/1764354274571.png?imageMogr2/format/webp",
    color: "from-purple-50 to-purple-100",
    textColor: "text-purple-600"
  }
];

export default function MorySection() {
  return (
    <section id="mory" className="py-32 px-4 sm:px-6 bg-white relative overflow-hidden scroll-mt-20">
      
      {/* Decor Background */}
      <div className="absolute top-0 left-0 w-full h-full opacity-30 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]" />

      <div className="container mx-auto relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-mory-text-primary mb-6">
            Meet Mory. <br />
            <span className="text-mory-text-muted italic font-normal">你的全能数字队友。</span>
          </h2>
          <p className="text-lg text-mory-text-secondary">
            他不仅仅是一个聊天机器人。他拥有 14 种专业工具，能读写文件、执行命令、甚至浏览网页。
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {cards.map((card, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2, duration: 0.6 }}
              whileHover={{ y: -10 }}
              className="group bg-white border border-gray-100 rounded-3xl p-2 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full"
            >
              {/* Image Area */}
              <div className={`relative h-48 rounded-2xl bg-gradient-to-br ${card.color} overflow-hidden mb-6`}>
                <img 
                  src={card.image} 
                  alt={card.title}
                  className="absolute inset-0 w-full h-full object-contain p-4 transform group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              
              {/* Content */}
              <div className="px-4 pb-8 flex-grow flex flex-col">
                <div className={`text-xs font-bold uppercase tracking-wider mb-2 ${card.textColor}`}>
                  {card.subtitle}
                </div>
                <h3 className="text-2xl font-serif font-bold text-mory-text-primary mb-3">
                  {card.title}
                </h3>
                <p className="text-mory-text-secondary leading-relaxed mb-6 flex-grow">
                  {card.desc}
                </p>
                
                <div className="flex items-center gap-2 text-sm font-medium text-mory-text-primary group-hover:text-mory-orange transition-colors cursor-pointer">
                  了解更多 <ArrowRight size={16} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
