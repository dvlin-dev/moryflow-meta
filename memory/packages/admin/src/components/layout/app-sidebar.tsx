/**
 * AppSidebar - Memory Admin 侧边栏组件
 *
 * [PROPS]: React.ComponentProps<typeof Sidebar>
 * [EMITS]: none
 * [POS]: 侧边栏核心组件，包含导航配置
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

// 导航分组配置
const navGroups: NavGroup[] = [
  {
    // 概览 - 无分组标签
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
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
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
