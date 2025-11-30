import * as path from 'node:path';
import { defineConfig } from 'rspress/config';

// 中文侧边栏配置
const zhSidebar = [
  {
    text: '快速开始',
    items: [
      { text: '什么是 MoryFlow', link: '/zh/getting-started/' },
      { text: '下载与安装', link: '/zh/getting-started/installation' },
      { text: '创建第一篇笔记', link: '/zh/getting-started/first-note' },
      { text: '第一次对话', link: '/zh/getting-started/first-chat' },
    ],
  },
  {
    text: '功能详解',
    items: [
      { text: '功能概览', link: '/zh/features/' },
      { text: '笔记文件夹', link: '/zh/features/vault' },
      { text: '编辑器', link: '/zh/features/editor' },
      { text: 'Mory 智能助手', link: '/zh/features/ai-assistant' },
      { text: 'Mory 的工具', link: '/zh/features/ai-tools' },
      { text: 'MCP 扩展', link: '/zh/features/mcp' },
    ],
  },
  {
    text: '使用指南',
    items: [
      { text: '场景介绍', link: '/zh/guides/' },
      { text: '考试备考', link: '/zh/guides/study-prep' },
      { text: '活动策划', link: '/zh/guides/event-planning' },
      { text: '旅行规划', link: '/zh/guides/travel-planning' },
      { text: '工作总结', link: '/zh/guides/work-summary' },
      { text: '知识库', link: '/zh/guides/knowledge-base' },
    ],
  },
  {
    text: '设置配置',
    items: [
      { text: '设置总览', link: '/zh/settings/' },
      { text: 'AI 模型配置', link: '/zh/settings/ai-models' },
      { text: 'Ollama 本地模型', link: '/zh/settings/ollama' },
      { text: '自定义服务商', link: '/zh/settings/custom-provider' },
      { text: '主题设置', link: '/zh/settings/theme' },
    ],
  },
  {
    text: '进阶使用',
    items: [
      { text: '进阶总览', link: '/zh/advanced/' },
      { text: '提示词技巧', link: '/zh/advanced/prompt-tips' },
      { text: '文件组织', link: '/zh/advanced/file-organization' },
      { text: '多设备同步', link: '/zh/advanced/sync' },
    ],
  },
  {
    text: '常见问题',
    items: [{ text: 'FAQ', link: '/zh/faq/' }],
  },
];

// 英文侧边栏配置（默认语言，路径不带 /en/ 前缀）
const enSidebar = [
  {
    text: 'Getting Started',
    items: [
      { text: 'What is MoryFlow', link: '/getting-started/' },
      { text: 'Download & Install', link: '/getting-started/installation' },
      { text: 'Create Your First Note', link: '/getting-started/first-note' },
      { text: 'Your First Chat', link: '/getting-started/first-chat' },
    ],
  },
  {
    text: 'Features',
    items: [
      { text: 'Features Overview', link: '/features/' },
      { text: 'Note Folder', link: '/features/vault' },
      { text: 'Editor', link: '/features/editor' },
      { text: 'Mory AI Assistant', link: '/features/ai-assistant' },
      { text: "Mory's Tools", link: '/features/ai-tools' },
      { text: 'MCP Extensions', link: '/features/mcp' },
    ],
  },
  {
    text: 'Guides',
    items: [
      { text: 'Use Cases', link: '/guides/' },
      { text: 'Exam Preparation', link: '/guides/study-prep' },
      { text: 'Event Planning', link: '/guides/event-planning' },
      { text: 'Travel Planning', link: '/guides/travel-planning' },
      { text: 'Work Summary', link: '/guides/work-summary' },
      { text: 'Knowledge Base', link: '/guides/knowledge-base' },
    ],
  },
  {
    text: 'Settings',
    items: [
      { text: 'Settings Overview', link: '/settings/' },
      { text: 'AI Model Configuration', link: '/settings/ai-models' },
      { text: 'Ollama Local Models', link: '/settings/ollama' },
      { text: 'Custom Providers', link: '/settings/custom-provider' },
      { text: 'Theme Settings', link: '/settings/theme' },
    ],
  },
  {
    text: 'Advanced',
    items: [
      { text: 'Advanced Overview', link: '/advanced/' },
      { text: 'Prompt Tips', link: '/advanced/prompt-tips' },
      { text: 'File Organization', link: '/advanced/file-organization' },
      { text: 'Multi-device Sync', link: '/advanced/sync' },
    ],
  },
  {
    text: 'FAQ',
    items: [{ text: 'FAQ', link: '/faq/' }],
  },
];

export default defineConfig({
  root: path.join(__dirname, 'docs'),
  title: 'MoryFlow',
  icon: '/favicon.ico',
  logo: {
    light: '/logo-light.png',
    dark: '/logo-dark.png',
  },
  // 默认语言设置为英文
  lang: 'en',
  // 多语言配置
  locales: [
    {
      lang: 'zh',
      label: '简体中文',
      title: 'MoryFlow 文档',
      description: '会思考的 AI 笔记伙伴',
    },
    {
      lang: 'en',
      label: 'English',
      title: 'MoryFlow Docs',
      description: 'Your AI-powered note-taking companion',
    },
  ],
  themeConfig: {
    sidebar: {
      '/zh/': zhSidebar,
      '/': enSidebar,
    },
    socialLinks: [
      {
        icon: 'github',
        mode: 'link',
        content: 'https://github.com/dvlin-dev/moryflow-meta',
      },
    ],
    footer: {
      message: '© 2025 MoryFlow | Made with ❤️',
    },
    lastUpdated: true,
    // 多语言本地化配置
    locales: [
      {
        lang: 'zh',
        label: '简体中文',
        searchPlaceholderText: '搜索文档',
        prevPageText: '上一页',
        nextPageText: '下一页',
        outlineTitle: '目录',
        lastUpdatedText: '最后更新',
      },
      {
        lang: 'en',
        label: 'English',
        searchPlaceholderText: 'Search docs',
        prevPageText: 'Previous',
        nextPageText: 'Next',
        outlineTitle: 'On this page',
        lastUpdatedText: 'Last updated',
      },
    ],
  },
  // Markdown 配置
  markdown: {
    checkDeadLinks: true,
  },
});
