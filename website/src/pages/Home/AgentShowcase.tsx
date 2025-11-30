
import { motion } from 'framer-motion';
import { CheckCircle2, Sparkles } from 'lucide-react';

const scenarios = [
  {
    icon: "📝",
    title: "整理笔记",
    userRequest: "帮我把上周的会议记录整理成一份总结",
    plan: [
      "搜索上周创建的所有笔记文件",
      "读取包含会议关键词的内容",
      "提取关键决策和待办事项",
      "生成结构化总结文档"
    ],
    highlight: "自主规划 4 步流程，理解你的真实需求"
  },
  {
    icon: "🔍",
    title: "调研任务",
    userRequest: "帮我调研一下最近的 AI Agent 技术发展",
    plan: [
      "联网搜索最新的文章和论文",
      "抓取重点段落和观点",
      "在你的笔记库创建调研文档",
      "自动整理成 Markdown 格式"
    ],
    highlight: "跨越网络和本地，无缝整合信息"
  },
  {
    icon: "📅",
    title: "项目规划",
    userRequest: "帮我规划这个月的学习计划",
    plan: [
      "询问你的学习目标和可用时间",
      "拆解成每周的小任务",
      "创建带时间轴的待办清单",
      "定期提醒你进度和调整建议"
    ],
    highlight: "长期规划 + 持续跟进，不只是一次性任务"
  },
  {
    icon: "🗂️",
    title: "文件整理",
    userRequest: "帮我把散乱的笔记按主题分类",
    plan: [
      "读取所有笔记的内容",
      "分析主题和内在关联性",
      "创建合理的分类文件夹",
      "移动文件到对应目录"
    ],
    highlight: "理解内容语义，不只是看文件名"
  }
];

export default function AgentShowcase() {
  return (
    <section className="py-32 px-4 sm:px-6 bg-mory-bg relative overflow-hidden">
      
      {/* Background decoration */}
      <div className="absolute top-20 right-0 w-96 h-96 bg-mory-orange/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />

      <div className="container mx-auto max-w-7xl relative z-10">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-mory-orange/20 mb-6">
            <Sparkles size={16} className="text-mory-orange" />
            <span className="text-sm font-medium text-mory-text-primary">AI Agent</span>
          </div>
          
          <h2 className="font-serif text-4xl md:text-6xl font-bold text-mory-text-primary mb-6">
            不只是聊天，<br />
            Mory 会真正帮你干活
          </h2>
          <p className="text-lg md:text-xl text-mory-text-secondary max-w-3xl mx-auto leading-relaxed">
            给 Mory 一个模糊的需求，它会自己想办法完成。<br />
            <span className="font-medium text-mory-text-primary">这就是 AI Agent 的力量。</span>
          </p>
        </motion.div>

        {/* Scenarios Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-20">
          {scenarios.map((scenario, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ 
                duration: 0.6, 
                delay: index * 0.15,
                ease: [0.25, 0.4, 0.25, 1]
              }}
              className="group bg-white rounded-3xl p-8 border border-gray-100 hover:border-mory-orange/30 transition-all hover:-translate-y-1"
            >
              {/* Icon & Title */}
              <div className="flex items-center gap-4 mb-6">
                <div className="text-4xl">{scenario.icon}</div>
                <div>
                  <h3 className="text-2xl font-serif font-bold text-mory-text-primary">
                    {scenario.title}
                  </h3>
                </div>
              </div>

              {/* User Request */}
              <div className="mb-6 p-4 bg-mory-bg rounded-2xl border-l-4 border-mory-orange">
                <p className="text-sm text-mory-text-muted mb-1">你说：</p>
                <p className="text-base text-mory-text-primary font-medium italic">
                  "{scenario.userRequest}"
                </p>
              </div>

              {/* Mory's Plan */}
              <div className="mb-6">
                <p className="text-sm text-mory-text-muted mb-3 flex items-center gap-2">
                  <Sparkles size={14} className="text-mory-orange" />
                  Mory 的执行计划：
                </p>
                <ul className="space-y-2">
                  {scenario.plan.map((step, stepIndex) => (
                    <li key={stepIndex} className="flex items-start gap-2 text-sm text-mory-text-secondary">
                      <CheckCircle2 size={16} className="text-mory-orange mt-0.5 flex-shrink-0" />
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Highlight */}
              <div className="pt-4 border-t border-gray-100">
                <p className="text-sm text-mory-orange font-medium">
                  💡 {scenario.highlight}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom Explanation */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center"
        >
          <div className="p-8 bg-white rounded-3xl border border-gray-100">
            <p className="text-base text-mory-text-secondary leading-relaxed mb-4">
              Mory 拥有 <strong className="text-mory-text-primary">14+ 种基础能力</strong>（文件读写、网络搜索、命令执行...），<br />
              但真正厉害的是：<strong className="text-mory-orange">它知道什么时候用什么工具，怎么组合使用。</strong>
            </p>
            <p className="text-sm text-mory-text-muted">
              你不需要告诉它每一步怎么做，只需要说你想要什么结果。
            </p>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
