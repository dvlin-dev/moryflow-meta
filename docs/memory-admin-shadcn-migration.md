# Memory Admin shadcn/ui 改造方案

> 将 `memory/packages/admin` 改造为使用 shadcn/ui 组件库，参考 `apps/admin` 的实现

## 1. 改造概述

### 1.1 目标

将 Memory Admin 从基础的 Tailwind CSS 类改造为使用 shadcn/ui 组件库，统一设计风格，提升开发效率和用户体验。

### 1.2 参考项目

- **源项目**: `apps/admin` (已完成 shadcn/ui 集成)
- **目标项目**: `moryflow-meta/memory/packages/admin`

### 1.3 改造范围

| 模块     | 当前状态      | 改造内容                      |
| -------- | ------------- | ----------------------------- |
| 组件库   | 自定义 CSS 类 | 迁移到 shadcn/ui              |
| 布局系统 | 固定侧边栏    | SidebarProvider + Collapsible |
| 样式系统 | Tailwind 3.x  | Tailwind 4.x + CSS Variables  |
| 主题     | 仅亮色        | 亮色/暗色双主题               |

## 2. 技术栈升级

### 2.1 依赖变更

在 `package.json` 中添加以下依赖：

```json
{
  "dependencies": {
    "@radix-ui/react-avatar": "^1.1.10",
    "@radix-ui/react-collapsible": "^1.1.12",
    "@radix-ui/react-dialog": "^1.1.15",
    "@radix-ui/react-dropdown-menu": "^2.1.16",
    "@radix-ui/react-label": "^2.1.7",
    "@radix-ui/react-scroll-area": "^1.2.10",
    "@radix-ui/react-select": "^2.2.6",
    "@radix-ui/react-separator": "^1.1.8",
    "@radix-ui/react-slot": "^1.2.4",
    "@radix-ui/react-tabs": "^1.1.13",
    "@radix-ui/react-tooltip": "^1.2.8",
    "sonner": "^2.0.7"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4.1.17",
    "class-variance-authority": "^0.7.1",
    "tailwindcss": "^4.1.17",
    "tailwind-merge": "^3.4.0",
    "tw-animate-css": "^1.4.0"
  }
}
```

### 2.2 升级

```json
{
  "dependencies": {
    "react": "^19.2.0",
    "react-dom": "^19.2.0",
    "react-router-dom": "^7.10.1",
    "@tanstack/react-query": "^5.90.12",
    "@tanstack/react-table": "^8.21.3",
    "lucide-react": "^0.553.0"
  }
}
```

## 3. 配置文件

### 3.1 创建 `components.json`

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/styles/globals.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "iconLibrary": "lucide",
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  }
}
```

### 3.2 更新 `tsconfig.json`

确保路径别名配置正确（已有）：

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### 3.3 更新 `vite.config.ts`

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

### 3.4 更新 `postcss.config.js`

```javascript
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
}
```

## 4. 样式系统

### 4.1 替换 `src/index.css` 为 `src/styles/globals.css`

从 `apps/admin/src/styles/globals.css` 复制完整内容，包含：

- OKLch 色彩空间的 CSS 变量
- 亮色/暗色主题配置
- Sidebar 专用变量
- 圆角系统 (`--radius`)
- 图表色彩

**关键变量示例**：

```css
:root {
  --background: oklch(0.995 0 0);
  --foreground: oklch(0.2 0 0);
  --primary: oklch(0.25 0 0);
  --sidebar: oklch(0.98 0 0);
  --radius: 0.625rem;
  /* ... 完整变量见 apps/admin */
}

.dark {
  --background: oklch(0.13 0 0);
  /* ... 暗色主题变量 */
}
```

### 4.2 创建 `src/lib/utils.ts`

```typescript
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

## 5. 组件迁移

### 5.1 复制 UI 组件

从 `apps/admin/src/components/ui/` 复制以下组件到 `memory/packages/admin/src/components/ui/`：

**必需组件** (布局和基础交互):

```
ui/
├── avatar.tsx          # 用户头像
├── badge.tsx           # 标签
├── button.tsx          # 按钮
├── card.tsx            # 卡片容器
├── collapsible.tsx     # 可折叠面板
├── dialog.tsx          # 对话框 (替代 Modal)
├── dropdown-menu.tsx   # 下拉菜单
├── input.tsx           # 输入框
├── label.tsx           # 标签
├── scroll-area.tsx     # 滚动区域
├── select.tsx          # 选择器
├── separator.tsx       # 分隔线
├── sidebar.tsx         # 侧边栏核心组件
├── skeleton.tsx        # 加载骨架
├── sonner.tsx          # Toast 通知
├── table.tsx           # 表格
├── tabs.tsx            # 标签页
├── textarea.tsx        # 文本域
├── tooltip.tsx         # 提示框
└── empty.tsx           # 空状态
```

**可选组件** (按需添加):

```
├── alert.tsx           # 警告提示
├── alert-dialog.tsx    # 确认对话框
├── breadcrumb.tsx      # 面包屑
├── calendar.tsx        # 日历
├── chart.tsx           # 图表
├── checkbox.tsx        # 复选框
├── command.tsx         # 命令面板
├── form.tsx            # 表单验证
├── pagination.tsx      # 分页
└── progress.tsx        # 进度条
```

### 5.2 复制布局组件

从 `apps/admin/src/components/layout/` 复制并修改：

```
layout/
├── index.ts            # 导出
├── main-layout.tsx     # 主布局
├── app-sidebar.tsx     # 侧边栏配置
├── nav-main.tsx        # 导航菜单
└── nav-user.tsx        # 用户菜单 (可选)
```

## 6. 布局系统改造

### 6.1 新建 `src/components/layout/app-sidebar.tsx`

根据 Memory Admin 的导航需求修改：

```tsx
/**
 * AppSidebar - Memory Admin 侧边栏组件
 */
import { LayoutDashboard, Brain, Network, GitBranch, Share2 } from 'lucide-react'

import { NavMain, type NavGroup } from '@/components/layout/nav-main'
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

const navGroups: NavGroup[] = [
  {
    items: [{ title: 'Dashboard', url: '/', icon: LayoutDashboard }],
  },
  {
    label: 'Knowledge Base',
    items: [
      { title: 'Memories', url: '/memories', icon: Brain },
      { title: 'Entities', url: '/entities', icon: Network },
      { title: 'Relations', url: '/relations', icon: GitBranch },
      { title: 'Graph View', url: '/graph', icon: Share2 },
    ],
  },
]

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5">
              <a href="/">
                <Brain className="!size-5" />
                <span className="text-base font-semibold">Memory Admin</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain groups={navGroups} />
      </SidebarContent>
    </Sidebar>
  )
}
```

### 6.2 新建 `src/components/layout/main-layout.tsx`

```tsx
/**
 * MainLayout - 主布局组件
 */
import { Outlet } from 'react-router-dom'
import { AppSidebar } from './app-sidebar'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'

export function MainLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* 移动端头部 */}
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4 md:hidden">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="h-4" />
          <span className="font-semibold">Memory Admin</span>
        </header>
        {/* 主内容区 */}
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
```

### 6.3 复制 `nav-main.tsx`

直接从 `apps/admin` 复制，无需修改。

### 6.4 更新 `src/App.tsx`

```tsx
import { Routes, Route } from 'react-router-dom'
import { MainLayout } from '@/components/layout/main-layout'
import ErrorBoundary from '@/components/ErrorBoundary'
import Dashboard from '@/pages/Dashboard'
import Memories from '@/pages/Memories'
import Entities from '@/pages/Entities'
import Relations from '@/pages/Relations'
import GraphViewer from '@/pages/GraphViewer'

export default function App() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/memories" element={<Memories />} />
          <Route path="/entities" element={<Entities />} />
          <Route path="/relations" element={<Relations />} />
          <Route path="/graph" element={<GraphViewer />} />
        </Route>
      </Routes>
    </ErrorBoundary>
  )
}
```

### 6.5 更新 `src/main.tsx`

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from '@/components/ui/sonner'
import App from './App'
import '@/styles/globals.css'

const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
        <Toaster />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>
)
```

## 7. 页面组件改造示例

### 7.1 改造 `Memories.tsx`

**改造前** (使用自定义 CSS 类):

```tsx
<button className="btn btn-primary">Add Memory</button>
<div className="card">...</div>
<input className="input" />
```

**改造后** (使用 shadcn/ui):

```tsx
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'

export default function Memories() {
  // ... state 保持不变

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Memories</h1>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Memory
        </Button>
      </div>

      {/* Search Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search memories semantically..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={() => setIsSearching(true)}>Search</Button>
            {isSearching && (
              <Button variant="secondary" onClick={handleClear}>
                Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Memory List */}
      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : !displayMemories?.length ? (
            <Empty description="No memories found" />
          ) : (
            <div className="divide-y">
              {displayMemories.map((memory) => (
                <div key={memory.id} className="py-4 first:pt-0 last:pb-0">
                  {/* ... memory item */}
                  <div className="flex gap-2 mt-2">
                    {memory.metadata.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Dialog (替代 Modal) */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Memory</DialogTitle>
          </DialogHeader>
          <Textarea
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            placeholder="Enter memory content..."
            className="min-h-[120px]"
          />
          <DialogFooter>
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                createMutation.mutate(newContent)
                toast.success('Memory added successfully')
              }}
              disabled={!newContent.trim() || createMutation.isPending}
            >
              {createMutation.isPending ? 'Adding...' : 'Add Memory'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
```

## 8. 文件结构变更

### 8.1 改造后的目录结构

```
memory/packages/admin/src/
├── components/
│   ├── layout/                 # 新增
│   │   ├── index.ts
│   │   ├── main-layout.tsx
│   │   ├── app-sidebar.tsx
│   │   └── nav-main.tsx
│   ├── ui/                     # 新增 (从 apps/admin 复制)
│   │   ├── avatar.tsx
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── collapsible.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── input.tsx
│   │   ├── ... (其他组件)
│   │   └── sidebar.tsx
│   └── ErrorBoundary.tsx       # 保留
├── hooks/                      # 新增
│   └── use-mobile.tsx          # 从 apps/admin 复制
├── lib/                        # 新增
│   └── utils.ts
├── pages/                      # 保留并改造
│   ├── Dashboard.tsx
│   ├── Memories.tsx
│   ├── Entities.tsx
│   ├── Relations.tsx
│   └── GraphViewer.tsx
├── styles/                     # 新增
│   └── globals.css
├── api/
│   └── client.ts               # 保留
├── constants.ts                # 保留
├── App.tsx                     # 改造
└── main.tsx                    # 改造
```

### 8.2 删除的文件

```
- src/index.css                 # 被 styles/globals.css 替代
- src/components/Layout.tsx     # 被 layout/ 目录替代
- src/components/Modal.tsx      # 被 ui/dialog.tsx 替代
```

## 9. 改造步骤

### Phase 1: 基础设施 (1-2小时)

1. 安装新依赖
2. 创建配置文件 (`components.json`, 更新 `vite.config.ts`, `postcss.config.js`)
3. 创建 `lib/utils.ts`
4. 复制 `styles/globals.css`
5. 复制 `hooks/use-mobile.tsx`

### Phase 2: 组件复制 (30分钟)

1. 从 `apps/admin/src/components/ui/` 复制所有组件到目标目录
2. 从 `apps/admin/src/components/layout/` 复制布局组件
3. 修改 `app-sidebar.tsx` 的导航配置

### Phase 3: 入口文件改造 (30分钟)

1. 更新 `App.tsx` 使用新布局
2. 更新 `main.tsx` 添加 Toaster
3. 删除旧的 `Layout.tsx` 和 `Modal.tsx`
4. 删除 `index.css`

### Phase 4: 页面改造 (2-3小时)

按以下顺序改造页面：

1. `Dashboard.tsx` - 统计卡片使用 `Card` 组件
2. `Memories.tsx` - 使用 `Dialog`, `Button`, `Input`, `Badge`
3. `Entities.tsx` - 类似 Memories
4. `Relations.tsx` - 类似 Memories
5. `GraphViewer.tsx` - 保持 react-force-graph-2d，外层包装 `Card`

### Phase 5: 测试验证 (30分钟)

1. 启动开发服务器: `pnpm dev`
2. 验证所有页面正常渲染
3. 验证侧边栏折叠功能
4. 验证响应式布局
5. 验证对话框和 Toast 功能

## 10. 注意事项

### 10.1 保留的功能

- `react-force-graph-2d` 用于图谱可视化（apps/admin 没有这个功能）
- 现有的 API client 和数据结构
- ErrorBoundary 组件

### 10.2 样式冲突

如果遇到样式冲突，检查：

1. 是否删除了旧的 `index.css`
2. `globals.css` 是否正确导入
3. `tailwind.config` 是否正确配置

### 10.3 类型错误

如果遇到路径别名问题：

1. 确保 `tsconfig.json` 配置了 `@/*` 别名
2. 确保 `vite.config.ts` 配置了相同别名
3. 重启 TypeScript 服务

## 11. 验收标准

- [ ] 侧边栏可折叠，支持响应式
- [ ] 移动端显示菜单触发按钮
- [ ] 所有页面使用 shadcn/ui 组件
- [ ] 暗色模式可切换（可选）
- [ ] Toast 通知正常工作
- [ ] 无 TypeScript 错误
- [ ] 无控制台错误
