# Mory 文档站方案

## 一、产品定位回顾

**Mory** 是一款本地优先的 AI Agent 笔记应用，核心价值：
- **长期记忆**：记住用户的笔记、习惯、偏好，用得越多越懂你
- **本地优先**：数据存储在本地，隐私安全
- **智能规划**：自主思考、规划、执行任务

目标用户：学生、职场人士、内容创作者、隐私意识强的用户

---

## 二、文档站定位与目标

### 定位
面向**已下载或准备下载 Mory 的用户**，帮助他们：
1. 快速上手使用
2. 深入了解功能
3. 解决使用中的问题
4. 发挥 Mory 的最大价值

### 目标
- **降低上手门槛**：5 分钟内完成首次使用
- **提升功能发现**：让用户知道 Mory 能做什么
- **减少支持压力**：常见问题自助解决

---

## 三、文档结构规划

```
docs/
├── index.md                    # 首页（产品介绍 + 快速导航）
├── getting-started/            # 快速开始
│   ├── _meta.json
│   ├── index.md               # 概述：什么是 Mory
│   ├── installation.md        # 下载与安装
│   ├── first-note.md          # 创建第一篇笔记
│   └── first-chat.md          # 与 Mory 的第一次对话
│
├── features/                   # 功能详解
│   ├── _meta.json
│   ├── index.md               # 功能概览
│   ├── vault.md               # Vault 文件库
│   ├── editor.md              # 笔记编辑器
│   ├── ai-assistant.md        # Mory 智能助手
│   ├── ai-tools.md            # AI 工具能力详解
│   └── mcp.md                 # MCP 扩展
│
├── guides/                     # 使用指南（场景化教程）
│   ├── _meta.json
│   ├── index.md               # 指南导航
│   ├── study-prep.md          # 用 Mory 准备考试
│   ├── event-planning.md      # 用 Mory 策划活动
│   ├── travel-planning.md     # 用 Mory 规划旅行
│   ├── work-summary.md        # 用 Mory 写工作总结
│   └── knowledge-base.md      # 构建个人知识库
│
├── settings/                   # 设置与配置
│   ├── _meta.json
│   ├── index.md               # 设置概览
│   ├── ai-models.md           # AI 模型配置
│   ├── ollama.md              # Ollama 本地模型
│   ├── custom-provider.md     # 自定义服务商
│   └── theme.md               # 主题设置
│
├── advanced/                   # 进阶使用
│   ├── _meta.json
│   ├── index.md               # 进阶概览
│   ├── prompt-tips.md         # 提示词技巧
│   ├── file-organization.md   # 文件组织最佳实践
│   └── sync.md                # 多设备同步方案
│
├── faq/                        # 常见问题
│   ├── _meta.json
│   └── index.md               # FAQ 汇总
│
└── public/                     # 静态资源
    ├── logo-light.png
    ├── logo-dark.png
    ├── favicon.ico
    └── images/                 # 文档截图
        ├── vault/
        ├── editor/
        ├── chat/
        └── settings/
```

---

## 四、各页面内容大纲

### 首页 (index.md)
- 一句话介绍 Mory
- 核心特性卡片（3-4 个）
- 快速开始入口
- 功能导航

### 快速开始

#### installation.md
- 系统要求（macOS / Windows）
- 下载链接
- 安装步骤（带截图）
- 首次启动

#### first-note.md
- 创建 Vault
- 新建笔记
- 基础编辑操作
- 保存与自动保存

#### first-chat.md
- 打开对话面板
- 配置 AI 模型（推荐 DeepSeek 或免费方案）
- 发送第一条消息
- 理解 Mory 的回复

### 功能详解

#### vault.md
- Vault 概念介绍
- 文件树操作
- 文件管理（新建、重命名、移动、删除）
- 搜索文件

#### editor.md
- 编辑器界面介绍
- 支持的格式（标题、列表、代码块、表格等）
- Slash 命令
- 快捷键列表
- 多标签页

#### ai-assistant.md
- Mory 是什么
- 对话界面介绍
- 会话管理
- 上下文附加
- 流式回复

#### ai-tools.md
- 工具能力概览
- 文件操作工具（read/write/edit/ls/glob/grep 等）
- 联网能力（web_search/web_fetch）
- 命令执行（bash）
- 任务规划（manage_plan/task）

#### mcp.md
- 什么是 MCP
- 配置 MCP 服务器
- 使用 MCP 工具
- 常用 MCP 推荐

### 使用指南（场景化）

#### study-prep.md
- 场景描述
- 准备工作（整理学习笔记）
- 对话示例
- 技巧与建议

#### event-planning.md
- 场景描述
- 如何让 Mory 读取历史记录
- 对话示例
- 方案模板

#### travel-planning.md
- 场景描述
- 记录旅行偏好
- 对话示例
- 行程模板

#### work-summary.md
- 场景描述
- 工作日志最佳实践
- 对话示例
- 总结模板

#### knowledge-base.md
- 为什么用 Mory 做知识库
- 笔记组织建议
- 如何让 Mory 利用你的知识库

### 设置与配置

#### ai-models.md
- 支持的服务商列表
- API Key 配置
- 模型选择建议
- 参数调整

#### ollama.md
- 什么是 Ollama
- 安装 Ollama
- 在 Mory 中配置
- 推荐模型

#### custom-provider.md
- OpenAI 兼容协议
- 添加自定义服务商
- 常见问题

### 进阶使用

#### prompt-tips.md
- 有效提示词的原则
- 让 Mory 读取特定笔记
- 让 Mory 搜索信息
- 让 Mory 执行任务

#### file-organization.md
- 目录结构建议
- 命名规范
- 标签与链接

#### sync.md
- 与 iCloud 同步
- 与坚果云/OneDrive 同步
- 注意事项

### FAQ (faq/index.md)
- 安装与启动问题
- AI 配置问题
- 编辑器问题
- 文件同步问题
- 隐私与安全

---

## 五、写作风格指南

### 语言
- **全部使用中文**
- 避免技术术语，用生活化语言
- 第二人称（"你"）

### 语气
- 友好、亲切，像朋友在指导
- 避免生硬的说明书风格
- 适当使用 emoji 增加亲和力

### 格式
- 段落简短，每段 2-4 句
- 善用列表和表格
- 关键操作配截图
- 代码/命令用代码块

### 示例风格

```markdown
## 创建你的第一篇笔记

打开 Mory 后，你会看到左侧的文件树是空的。让我们来创建第一篇笔记：

1. 点击文件树顶部的 **+** 按钮
2. 输入笔记名称，比如「我的想法」
3. 按下回车，笔记就创建好了

现在你可以在中间的编辑区开始写作了。试试输入 `/` 看看有哪些快捷命令可以用。
```

---

## 六、技术配置调整

### rspress.config.ts 更新

```typescript
import { defineConfig } from 'rspress/config';

export default defineConfig({
  root: 'docs',
  title: 'Mory 文档',
  description: '会思考的 AI 笔记伙伴',
  icon: '/favicon.ico',
  logo: {
    light: '/logo-light.png',
    dark: '/logo-dark.png',
  },
  lang: 'zh',
  locales: [
    {
      lang: 'zh',
      label: '简体中文',
    },
  ],
  themeConfig: {
    socialLinks: [
      {
        icon: 'github',
        mode: 'link',
        content: 'https://github.com/dvlin-dev/moryflow-meta',
      },
    ],
    footer: {
      message: '© 2025 Moryflow | Made with ❤️',
    },
  },
});
```

### 需要准备的资源
- [ ] Logo 文件（亮色/暗色）
- [ ] Favicon
- [ ] 功能截图（按目录组织）

---

## 七、执行计划

### 第一阶段：基础框架
1. 更新 rspress.config.ts
2. 创建目录结构和 _meta.json
3. 编写首页
4. 编写快速开始章节

### 第二阶段：功能文档
1. 编写功能详解章节
2. 截图并组织图片资源

### 第三阶段：场景指南
1. 编写使用指南章节
2. 准备对话示例

### 第四阶段：配置与进阶
1. 编写设置与配置章节
2. 编写进阶使用章节
3. 编写 FAQ

### 第五阶段：优化
1. 检查链接和导航
2. 优化 SEO
3. 部署测试

---

## 八、已确认事项

1. **品牌名称**：统一使用「MoryFlow」
2. **截图来源**：留占位符，用户自行截图放入对应目录
3. **AI 配置推荐**：推荐 OpenRouter
4. **多语言支持**：先做中文，预留英文国际化位置
5. **部署方式**：Cloudflare，域名 docs.moryflow.com
