/**
 * MainLayout - 主布局组件
 *
 * [PROPS]: none
 * [EMITS]: none
 * [POS]: 包装 SidebarProvider 和 AppSidebar，支持响应式布局
 */
import { Outlet } from 'react-router-dom'
import { AppSidebar } from './app-sidebar'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
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
