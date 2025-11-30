
import { motion } from 'framer-motion';
import { FolderTree, PenTool, Bot, Check } from 'lucide-react';

const features = [
  {
    id: 'vault',
    icon: FolderTree,
    title: "Mory 看得到的地方",
    subtitle: "你的笔记库",
    desc: "Mory 能看到你所有的笔记和文件。它知道你最近在关注什么，哪些内容之间有关联。就像一个了解你的朋友。",
    image: "https://aibuildcdn-dev.geesdev.com/assets/onepage/agent/images/1764356987670.jpg?imageMogr2/format/webp",
    highlights: [
      "能主动搜索相关笔记",
      "理解你的文件结构",
      "找到内容之间的关联",
      "所有数据都在本地"
    ],
    bgColor: "from-orange-50 to-orange-100"
  },
  {
    id: 'editor',
    icon: PenTool,
    title: "Mory 帮得上忙的地方",
    subtitle: "你的写作空间",
    desc: "Mory 能直接帮你改文档、补充内容、调整格式。不用你开口，它就知道你需要什么。",
    image: "https://aibuildcdn-dev.geesdev.com/assets/onepage/agent/images/1764356996177.jpg?imageMogr2/format/webp",
    highlights: [
      "能直接修改你的文档",
      "自动补全你的想法",
      "帮你理顺结构",
      "像 Notion 一样流畅"
    ],
    bgColor: "from-green-50 to-green-100"
  },
  {
    id: 'agent',
    icon: Bot,
    title: "Mory 自己",
    subtitle: "你的工作伙伴",
    desc: "你说帮我整理笔记，它会自己想：该搜哪些文件？提取什么内容？怎么归类？然后一步步做完。",
    image: "https://aibuildcdn-dev.geesdev.com/assets/onepage/agent/images/1764356994377.jpg?imageMogr2/format/webp",
    highlights: [
      "会自己规划步骤",
      "能联网查资料",
      "管理复杂的多步任务",
      "越用越懂你的习惯"
    ],
    bgColor: "from-purple-50 to-purple-100"
  }
];

export default function FlowSectionNew() {
  return (
    <section id="features" className="py-32 px-4 sm:px-6 bg-gradient-to-b from-mory-bg to-white relative overflow-hidden scroll-mt-20">
      
      {/* Section Header */}
      <div className="container mx-auto mb-20 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="font-serif text-4xl md:text-6xl font-bold text-mory-text-primary mb-6"
        >
          Mory 不只是在右边等你
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-lg text-mory-text-secondary max-w-2xl mx-auto"
        >
          它能看到你的文件、理解你的想法、主动帮你完成。<br />
          <span className="font-medium text-mory-text-primary">就像一个真正的工作伙伴。</span>
        </motion.p>
      </div>

      {/* Three Column Cards */}
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {features.map((feature, index) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ 
                duration: 0.7, 
                delay: index * 0.2,
                ease: [0.25, 0.4, 0.25, 1]
              }}
              className="group flex flex-col"
            >
              {/* Card Container */}
              <div className="flex-1 bg-white border border-gray-100 rounded-3xl p-2 hover:border-gray-200 transition-all duration-500 flex flex-col overflow-hidden">
                
                {/* Image Area with Icon Overlay */}
                <div className={`relative h-64 rounded-2xl bg-gradient-to-br ${feature.bgColor} overflow-hidden mb-6`}>
                  <img 
                    src={feature.image} 
                    alt={feature.title}
                    className="absolute inset-0 w-full h-full object-cover opacity-90 mix-blend-multiply group-hover:scale-105 transition-transform duration-700"
                  />
                  
                  {/* Floating Icon */}
                  <div className="absolute top-6 left-6 w-14 h-14 bg-white/90 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300">
                    <feature.icon size={28} className="text-mory-text-primary" />
                  </div>
                </div>

                {/* Content Area */}
                <div className="px-6 pb-8 flex-1 flex flex-col">
                  {/* Subtitle Badge */}
                  <div className="text-xs font-bold uppercase tracking-wider text-mory-text-muted mb-2">
                    {feature.subtitle}
                  </div>
                  
                  {/* Title */}
                  <h3 className="text-3xl font-serif font-bold text-mory-text-primary mb-4">
                    {feature.title}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-mory-text-secondary leading-relaxed mb-6 flex-grow">
                    {feature.desc}
                  </p>

                  {/* Feature Highlights */}
                  <ul className="space-y-2">
                    {feature.highlights.map((item, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-mory-text-secondary">
                        <div className="w-4 h-4 rounded-full bg-mory-orange/10 flex items-center justify-center flex-shrink-0">
                          <Check size={12} className="text-mory-orange" />
                        </div>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="container mx-auto mt-20 text-center"
      >
        <p className="text-mory-text-secondary mb-6">
          Mory 就在你身边，随时准备帮忙。
        </p>
        <button 
          onClick={() => {
            const downloadSection = document.getElementById('download');
            if (downloadSection) {
              downloadSection.scrollIntoView({ behavior: 'smooth' });
            }
          }}
          className="px-8 py-4 bg-mory-text-primary text-white rounded-2xl font-medium text-lg hover:bg-black transition-all hover:-translate-y-1 hover:shadow-lg"
        >
          下载体验智能协作
        </button>
      </motion.div>

    </section>
  );
}
