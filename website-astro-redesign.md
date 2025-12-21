# Moryflow 官网 Astro 改造方案

## 现状分析

### 当前技术栈
- Vite + React 19 + React Router
- TailwindCSS + Framer Motion
- GSAP + Three.js（动效）

### 当前风格
- 暖橙色调（#FF9F1C）
- 动画较多（浮动光晕、打字机效果）
- 中文文案为主

---

## 目标

### 技术目标
- 迁移至 **Astro** 框架
- 保留 TailwindCSS，移除 React Router / GSAP / Three.js
- 静态优先，交互组件使用 Astro Islands（React）

### 设计目标
- **Notion 风格**：简约、留白、黑白灰主调、彩色克制使用
- 内容驱动，减少装饰性动效
- 突出 AI Agent 核心能力

---

## 核心设计规范

### 色彩系统

```css
/* Notion 风格调色板 */
--color-bg: #FFFFFF;
--color-bg-secondary: #F7F6F3;       /* Notion 米色背景 */
--color-text-primary: #191919;
--color-text-secondary: #6B6B6B;
--color-text-muted: #9B9B9B;
--color-accent: #2383E2;              /* Notion 蓝 - 仅用于链接/CTA */
--color-border: #E3E2E0;
```

### 排版

| 元素 | 字体 | 大小 | 行高 |
|------|------|------|------|
| H1 | Inter 700 | 48-72px | 1.1 |
| H2 | Inter 600 | 32-40px | 1.2 |
| 正文 | Inter 400 | 16-18px | 1.6 |
| 小字 | Inter 400 | 14px | 1.5 |

### 间距

- 段落间距：24-32px
- 区块间距：80-120px
- 最大内容宽度：1200px

### 动效原则

- 仅保留 **必要的状态反馈**（hover, active）
- 页面切换无动画
- 滚动触发禁止夸张动画

---

## 页面结构

```
┌─────────────────────────────────────┐
│            Navbar                   │  固定顶部，白底毛玻璃
├─────────────────────────────────────┤
│            Hero                     │  一句话价值主张 + CTA
├─────────────────────────────────────┤
│         Bento Grid                  │  3-4 个核心功能卡片
├─────────────────────────────────────┤
│         AI Demo                     │  交互式 Agent 演示
├─────────────────────────────────────┤
│         社会证明                     │  用户评价 / 数据指标
├─────────────────────────────────────┤
│         下载 CTA                     │  平台下载按钮
├─────────────────────────────────────┤
│            Footer                   │  链接 + 版权
└─────────────────────────────────────┘
```

---

## 各区块设计

### 1. Navbar

```
┌─ Logo ──────────────────────────────── 下载 ─┐
```

- 左侧：Logo（黑色文字）
- 右侧：单个主 CTA「下载」
- 样式：`backdrop-blur-lg bg-white/80 border-b border-gray-100`

### 2. Hero

**布局**：左文右图

```
┌─────────────────────────────────────────────┐
│                                             │
│   你的 AI 知识助手                           │
│                                             │
│   Mory 理解你的笔记、记忆你的习惯，            │
│   自动帮你完成复杂任务。                      │
│                                             │
│   [免费下载]                                 │
│                                             │
└─────────────────────────────────────────────┘
```

- 标题：48-72px，#191919
- 副标题：18px，#6B6B6B
- CTA：黑底白字圆角按钮

### 3. Bento Grid（核心功能）

```
┌──────────────────┬──────────────────┐
│                  │                  │
│   本地知识库      │    AI 对话       │
│   你的笔记和文档   │   问任何问题      │
│   都在这里        │                  │
│                  │                  │
├──────────────────┴──────────────────┤
│                                     │
│            智能 Agent               │
│      告诉它目标，它自己想办法完成      │
│                                     │
└─────────────────────────────────────┘
```

- 卡片：白底 + 细边框 + 微阴影
- 每个卡片有 icon + 标题 + 一句话描述
- Hover：阴影加深

### 4. AI Demo（交互组件）

保留当前的场景演示逻辑，但简化视觉：
- 移除彩色光晕背景
- 使用简洁的白色卡片
- 保留打字机效果，但速度加快

### 5. 社会证明

```
┌─────────────────────────────────────┐
│   "Mory 让我找资料的效率提升了 5 倍"   │
│                                     │
│   — 张三，产品经理                   │
└─────────────────────────────────────┘
```

或使用数据指标：

```
┌──────────┬──────────┬──────────┐
│  10K+    │   500+   │   4.9    │
│  用户     │  笔记同步  │  评分    │
└──────────┴──────────┴──────────┘
```

### 6. 下载 CTA

```
┌─────────────────────────────────────┐
│                                     │
│        立即开始使用 Mory             │
│                                     │
│   [macOS]  [Windows]  [iOS]         │
│                                     │
└─────────────────────────────────────┘
```

### 7. Footer

```
┌─────────────────────────────────────┐
│  Logo    产品  |  帮助  |  隐私       │
│          © 2024 Moryflow            │
└─────────────────────────────────────┘
```

---

## 技术实现

### 项目结构

```
moryflow-meta/website/
├── src/
│   ├── components/       # 可复用组件
│   │   ├── Navbar.astro
│   │   ├── Footer.astro
│   │   ├── BentoCard.astro
│   │   └── DownloadButton.astro
│   ├── layouts/
│   │   └── Layout.astro  # 全局布局
│   ├── pages/
│   │   └── index.astro   # 首页
│   └── styles/
│       └── global.css    # 全局样式
├── public/
│   └── images/           # 静态资源
├── astro.config.mjs
├── tailwind.config.mjs
└── package.json
```

### 关键依赖

```json
{
  "dependencies": {
    "astro": "^5.0.0",
    "@astrojs/react": "^4.0.0",
    "@astrojs/tailwind": "^6.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  }
}
```

### Astro 配置

```js
// astro.config.mjs
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  integrations: [
    react(),
    tailwind()
  ],
  output: 'static'
});
```

### TailwindCSS 配置

```js
// tailwind.config.mjs
export default {
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        notion: {
          bg: '#FFFFFF',
          'bg-secondary': '#F7F6F3',
          text: '#191919',
          'text-secondary': '#6B6B6B',
          'text-muted': '#9B9B9B',
          accent: '#2383E2',
          border: '#E3E2E0'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      }
    }
  }
};
```

---

## 迁移步骤

### Phase 1: 初始化 Astro 项目

1. 创建 Astro 项目
2. 配置 TailwindCSS + React 集成
3. 设置 Notion 风格 Design Token

### Phase 2: 静态组件迁移

1. Navbar.astro
2. Footer.astro
3. Hero 区块
4. Bento Grid 区块
5. 下载 CTA 区块

### Phase 3: 交互组件

1. AI Demo（React Island）
2. 下载镜像检测逻辑

### Phase 4: 优化

1. 图片优化（Astro Image）
2. SEO meta 配置
3. 性能测试

---

## 文案调整

| 位置 | 当前 | Notion 风格 |
|------|------|-------------|
| Hero 标题 | 不是聊天机器人，是会思考的伙伴 | 你的 AI 知识助手 |
| Hero 副标题 | 你说想做什么，Mory 会自己想办法帮你完成 | 理解你的笔记，记忆你的习惯，自动完成复杂任务 |
| CTA | 免费下载 | 开始使用（免费） |

---

## 设计参考

- [notion.so](https://notion.so) - 整体风格
- [linear.app](https://linear.app) - Bento Grid 布局
- [arc.net](https://arc.net) - 简洁动效
