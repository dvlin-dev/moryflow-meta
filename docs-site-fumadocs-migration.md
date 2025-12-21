# docs-site 重构技术方案：迁移至 Fumadocs

## 1. 背景与目标

### 1.1 现状分析

当前 `moryflow-meta/docs-site` 使用 **Rspress v1.40.2** 构建：

| 维度 | 现状 |
|------|------|
| 技术栈 | Rspress（静态生成） |
| 文档数量 | 55 个 Markdown/MDX 文件 |
| 国际化 | 中文 (zh) + 英文 (en) |
| 组件 | 1 个 React 组件 (DownloadButtons) |
| 侧边栏 | _meta.json 配置 |

### 1.2 迁移目标

使用 **Fumadocs** 重构，获得以下优势：

- **Next.js 生态**：与主站 (website) 技术栈统一，便于后续合并
- **类型安全**：fumadocs-mdx 提供类型安全的内容处理
- **内置搜索**：Orama 全文搜索，无需额外配置
- **更好的 DX**：热重载、错误提示、自动生成类型

---

## 2. 技术选型

| 层级 | 技术 | 版本 |
|------|------|------|
| 框架 | Next.js | 15.x |
| 文档框架 | fumadocs-ui + fumadocs-core | latest |
| 内容源 | fumadocs-mdx | latest |
| 样式 | Tailwind CSS | 4.x |
| 搜索 | Orama（内置） | - |

---

## 3. 核心架构

### 3.1 目录结构

```
docs-site/
├── app/
│   ├── [lang]/                      # 国际化动态路由
│   │   ├── layout.tsx               # 根布局 + RootProvider
│   │   ├── (home)/
│   │   │   └── page.tsx             # 首页
│   │   └── docs/
│   │       ├── layout.tsx           # 文档布局
│   │       └── [[...slug]]/
│   │           └── page.tsx         # 文档页面
│   ├── api/
│   │   └── search/
│   │       └── route.ts             # 搜索 API
│   └── layout.tsx                   # 全局布局（字体等）
│
├── content/
│   └── docs/
│       ├── zh/                      # 中文文档
│       │   ├── index.mdx
│       │   ├── meta.json            # 侧边栏配置
│       │   ├── getting-started/
│       │   ├── features/
│       │   ├── guides/
│       │   ├── settings/
│       │   ├── advanced/
│       │   └── faq/
│       └── en/                      # 英文文档
│           └── ...（结构同上）
│
├── components/
│   └── download-buttons.tsx         # 下载按钮组件
│
├── lib/
│   ├── i18n.ts                      # 国际化配置
│   ├── source.ts                    # 内容源配置
│   └── layout.shared.tsx            # 布局共享配置
│
├── source.config.ts                 # fumadocs-mdx 配置
├── next.config.mjs                  # Next.js 配置
├── tailwind.config.ts               # Tailwind 配置
├── mdx-components.tsx               # MDX 组件映射
└── middleware.ts                    # i18n 中间件
```

### 3.2 核心配置文件

#### source.config.ts - 内容源定义

```typescript
import { defineDocs, defineConfig } from 'fumadocs-mdx/config';

// 定义文档集合
export const docs = defineDocs({
  dir: 'content/docs',
});

export default defineConfig();
```

#### lib/i18n.ts - 国际化配置

```typescript
import { defineI18n } from 'fumadocs-core/i18n';

export const i18n = defineI18n({
  defaultLanguage: 'en',
  languages: ['en', 'zh'],
});
```

#### lib/source.ts - 内容加载器

```typescript
import { docs } from 'fumadocs-mdx:collections/server';
import { loader } from 'fumadocs-core/source';
import { i18n } from './i18n';

export const source = loader({
  baseUrl: '/docs',
  source: docs.toFumadocsSource(),
  i18n,
});
```

#### middleware.ts - i18n 路由中间件

```typescript
import { createI18nMiddleware } from 'fumadocs-core/i18n/middleware';
import { i18n } from '@/lib/i18n';

export default createI18nMiddleware(i18n);

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
```

---

## 4. 关键实现

### 4.1 文档页面路由

```typescript
// app/[lang]/docs/[[...slug]]/page.tsx
import { source } from '@/lib/source';
import { getMDXComponent } from 'fumadocs-ui/mdx';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{ lang: string; slug?: string[] }>;
}

export default async function Page({ params }: PageProps) {
  const { lang, slug } = await params;
  const page = source.getPage(slug, lang);

  if (!page) notFound();

  const MDX = page.data.body;

  return (
    <DocsPage toc={page.data.toc}>
      <DocsBody>
        <MDX />
      </DocsBody>
    </DocsPage>
  );
}

export function generateStaticParams() {
  return source.generateParams();
}
```

### 4.2 侧边栏配置迁移

Rspress 使用 `_meta.json`，Fumadocs 使用 `meta.json`：

```json
// content/docs/zh/meta.json
{
  "title": "文档",
  "pages": [
    "index",
    "---快速开始---",
    "getting-started",
    "---功能详解---",
    "features",
    "---使用指南---",
    "guides",
    "---设置配置---",
    "settings",
    "---进阶使用---",
    "advanced",
    "---FAQ---",
    "faq"
  ]
}
```

### 4.3 首页实现

```typescript
// app/[lang]/(home)/page.tsx
import Link from 'next/link';

const features = [
  { icon: '🧠', title: '记得住你说过的话', description: '...' },
  { icon: '✍️', title: '写作不再是难事', description: '...' },
  // ...
];

export default async function HomePage({ params }) {
  const { lang } = await params;

  return (
    <main className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="text-center py-20">
        <h1>MoryFlow</h1>
        <p>{lang === 'zh' ? '会思考的 AI 笔记伙伴' : 'Your Thinking AI Note Companion'}</p>
        <Link href={`/${lang}/docs`}>
          {lang === 'zh' ? '开始使用' : 'Get Started'}
        </Link>
      </section>

      {/* Features Grid */}
      <section className="grid grid-cols-3 gap-6">
        {features.map((f) => (
          <FeatureCard key={f.title} {...f} />
        ))}
      </section>
    </main>
  );
}
```

### 4.4 搜索 API

```typescript
// app/api/search/route.ts
import { source } from '@/lib/source';
import { createSearchAPI } from 'fumadocs-core/search/server';

export const { GET } = createSearchAPI('advanced', {
  indexes: source.getSearchIndexes(),
});
```

### 4.5 UI 翻译配置

```typescript
// app/[lang]/layout.tsx
import { RootProvider } from 'fumadocs-ui/provider/next';
import { defineI18nUI } from 'fumadocs-ui/i18n';
import { i18n } from '@/lib/i18n';

const { provider } = defineI18nUI(i18n, {
  translations: {
    en: {
      displayName: 'English',
    },
    zh: {
      displayName: '简体中文',
      search: '搜索文档',
      searchNoResult: '没有找到结果',
      toc: '目录',
      lastUpdate: '最后更新',
      previousPage: '上一页',
      nextPage: '下一页',
    },
  },
});

export default async function RootLayout({ params, children }) {
  const { lang } = await params;

  return (
    <html lang={lang} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <RootProvider i18n={provider(lang)}>
          {children}
        </RootProvider>
      </body>
    </html>
  );
}
```

---

## 5. 内容迁移映射

### 5.1 Frontmatter 对照

| Rspress | Fumadocs | 说明 |
|---------|----------|------|
| `pageType: home` | 删除，用独立页面实现 | 首页不再用 MDX |
| `hero` | 删除 | 首页用 React 组件 |
| `features` | 删除 | 首页用 React 组件 |
| `title` | `title` | 保持不变 |
| `description` | `description` | 保持不变 |

### 5.2 侧边栏配置对照

| Rspress (_meta.json) | Fumadocs (meta.json) |
|---------------------|----------------------|
| `{ "type": "file", "name": "index", "label": "快速开始" }` | `"index"` + frontmatter title |
| 数组形式 | `pages` 数组 + 分隔符 `---Title---` |

### 5.3 特殊语法迁移

| 功能 | Rspress | Fumadocs |
|------|---------|----------|
| 提示框 | `:::tip\n内容\n:::` | `<Callout type="info">\n内容\n</Callout>` |
| 代码高亮 | 内置 | 内置（Shiki） |
| 图片 | `![](./image.png)` | 相同，放 public 或 content |

---

## 6. 迁移步骤

### 阶段一：项目初始化

1. 创建新 Next.js 项目
2. 安装依赖：`fumadocs-ui fumadocs-core fumadocs-mdx @types/mdx`
3. 配置 `next.config.mjs`、`source.config.ts`、`tailwind.config.ts`
4. 设置基础布局和路由结构

### 阶段二：内容迁移

1. 复制 `docs/zh/` 和 `docs/en/` 到 `content/docs/`
2. 将 `_meta.json` 转换为 `meta.json` 格式
3. 清理首页 frontmatter，改用 React 组件实现
4. 迁移 `:::tip` 等语法为 `<Callout>` 组件

### 阶段三：组件迁移

1. 迁移 `DownloadButtons.tsx` 组件
2. 在 `mdx-components.tsx` 中注册自定义组件
3. 验证 MDX 中的组件引用正常工作

### 阶段四：功能完善

1. 配置搜索 API
2. 实现首页设计
3. 配置 i18n 翻译文本
4. 添加 SEO 元数据

### 阶段五：验证与部署

1. 本地验证所有页面正常渲染
2. 验证搜索功能
3. 验证国际化切换
4. 静态导出测试（如需要）
5. 部署到 Vercel/Cloudflare Pages

---

## 7. 风险与注意事项

| 风险 | 应对措施 |
|------|----------|
| 首页设计变化 | 首页从 Markdown 改为 React 组件，需重新实现 |
| 提示框语法不兼容 | 批量替换 `:::tip` 为 `<Callout>` |
| 静态资源路径 | 确保图片路径正确，建议统一放 `public/` |
| 侧边栏配置格式 | 需要手动转换 `_meta.json` 格式 |

---

## 8. 依赖清单

```json
{
  "dependencies": {
    "fumadocs-core": "latest",
    "fumadocs-mdx": "latest",
    "fumadocs-ui": "latest",
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@types/mdx": "^2.0.0",
    "@types/node": "^20.0.0",
    "@types/react": "^19.0.0",
    "tailwindcss": "^4.0.0",
    "typescript": "^5.0.0"
  }
}
```

---

## 9. 参考资料

- [Fumadocs 官方文档](https://www.fumadocs.dev/docs/ui)
- [Fumadocs MDX](https://www.fumadocs.dev/docs/mdx)
- [Next.js i18n](https://www.fumadocs.dev/docs/ui/internationalization/next)
- [Fumadocs 手动安装](https://www.fumadocs.dev/docs/ui/manual-installation/next)
