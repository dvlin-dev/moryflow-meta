
import { motion } from 'framer-motion';
import { 
  FileText, Edit, FilePlus, FolderOpen, Search, 
  SearchCode, FileSearch, Move, Trash2, 
  ListTodo, Terminal, Globe, Link as LinkIcon, Users 
} from 'lucide-react';

const toolCategories = [
  {
    category: "📝 管理你的笔记",
    desc: "帮你读取、编辑、整理所有笔记文件",
    tools: [
      { icon: FileText, name: "read", title: "阅读文件", desc: "帮你快速读取任何笔记内容" },
      { icon: Edit, name: "edit", title: "修改文件", desc: "直接帮你改笔记，自动保存" },
      { icon: FilePlus, name: "write", title: "创建文件", desc: "帮你新建笔记或更新内容" },
      { icon: FolderOpen, name: "ls", title: "查看目录", desc: "列出文件夹里的所有文件" },
      { icon: Search, name: "glob", title: "批量查找", desc: "一次性找到符合条件的所有文件" },
      { icon: SearchCode, name: "grep", title: "全局搜索", desc: "在所有笔记里搜索关键词" },
      { icon: FileSearch, name: "search_in_file", title: "文件内搜索", desc: "在某个笔记里找特定内容" },
      { icon: Move, name: "move", title: "移动文件", desc: "帮你整理文件到不同文件夹" },
      { icon: Trash2, name: "delete", title: "删除文件", desc: "清理不需要的笔记" },
    ]
  },
  {
    category: "🤖 帮你规划和执行",
    desc: "把复杂任务拆解成简单步骤",
    tools: [
      { icon: ListTodo, name: "manage_plan", title: "任务规划", desc: "帮你把大目标拆成待办清单" },
      { icon: Users, name: "task", title: "分工协作", desc: "遇到难题时，启动专门助手帮你" },
    ]
  },
  {
    category: "🌐 联网查资料",
    desc: "实时搜索最新信息",
    tools: [
      { icon: Globe, name: "web_search", title: "网络搜索", desc: "帮你在网上搜索最新资料" },
      { icon: LinkIcon, name: "web_fetch", title: "抓取网页", desc: "从网页上提取你需要的信息" },
      { icon: Terminal, name: "bash", title: "执行命令", desc: "帮你运行一些电脑操作" },
    ]
  }
];

export default function FeaturesComplete() {
  return (
    <section className="py-32 px-4 sm:px-6 bg-mory-bg relative overflow-hidden">
      
      <div className="container mx-auto max-w-7xl">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h2 className="font-serif text-4xl md:text-6xl font-bold text-mory-text-primary mb-6">
            Mory 能帮你做什么？
          </h2>
          <p className="text-lg md:text-xl text-mory-text-secondary max-w-3xl mx-auto">
            不只是陪你聊天，Mory 真的能帮你干活。<br />
            从整理文件到搜索资料，样样精通。
          </p>
        </motion.div>

        {/* Categories */}
        <div className="space-y-20">
          {toolCategories.map((category, catIndex) => (
            <motion.div
              key={catIndex}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: catIndex * 0.1 }}
            >
              {/* Category Header */}
              <div className="mb-8">
                <h3 className="text-2xl md:text-3xl font-serif font-bold text-mory-text-primary mb-2">
                  {category.category}
                </h3>
                <p className="text-mory-text-secondary">{category.desc}</p>
              </div>

              {/* Tools Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {category.tools.map((tool, toolIndex) => (
                  <motion.div
                    key={toolIndex}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ 
                      duration: 0.5, 
                      delay: toolIndex * 0.08,
                      ease: [0.25, 0.4, 0.25, 1]
                    }}
                    className="group bg-white rounded-2xl p-6 border border-gray-100 hover:border-mory-orange/30 transition-all hover:-translate-y-1"
                  >
                    {/* Icon */}
                    <div className="w-12 h-12 rounded-xl bg-mory-bg flex items-center justify-center mb-4 group-hover:bg-mory-orange/10 transition-colors">
                      <tool.icon size={24} className="text-mory-text-primary group-hover:text-mory-orange transition-colors" />
                    </div>

                    {/* Content */}
                    <div className="mb-2">
                      <h4 className="text-lg font-bold text-mory-text-primary">
                        {tool.title}
                      </h4>
                    </div>
                    <p className="text-sm text-mory-text-secondary leading-relaxed">
                      {tool.desc}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* MCP Extension Note */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-20 p-8 bg-white rounded-3xl border-2 border-mory-orange/20"
        >
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
            <div className="w-16 h-16 rounded-2xl bg-mory-orange/10 flex items-center justify-center flex-shrink-0">
              <Users size={32} className="text-mory-orange" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-mory-text-primary mb-2">
                还能无限扩展
              </h3>
              <p className="text-mory-text-secondary leading-relaxed">
                除了这些内置能力，Mory 还支持安装更多扩展功能。<br />
                就像给手机装 App 一样，让它变得更强大。
              </p>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
