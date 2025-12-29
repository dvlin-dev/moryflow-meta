/**
 * Layout component - Main app shell with sidebar navigation
 *
 * [PROPS]: { children } - Page content to render in main area
 * [EMITS]: none
 * [POS]: Root layout wrapper, used by App.tsx
 */

import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Brain,
  Network,
  GitBranch,
  Share2,
} from 'lucide-react';
import { clsx } from 'clsx';
import type { ReactNode } from 'react';

const ICONS = {
  LayoutDashboard,
  Brain,
  Network,
  GitBranch,
  Share2,
} as const;

const navigation = [
  { name: 'Dashboard', href: '/', icon: 'LayoutDashboard' as const },
  { name: 'Memories', href: '/memories', icon: 'Brain' as const },
  { name: 'Entities', href: '/entities', icon: 'Network' as const },
  { name: 'Relations', href: '/relations', icon: 'GitBranch' as const },
  { name: 'Graph', href: '/graph', icon: 'Share2' as const },
];

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-6">
          <h1 className="text-xl font-bold">Moryflow Memory</h1>
          <p className="text-gray-400 text-sm mt-1">Admin Console</p>
        </div>

        <nav className="flex-1 px-4">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = ICONS[item.icon];
            return (
              <Link
                key={item.name}
                to={item.href}
                className={clsx(
                  'flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors',
                  isActive
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800'
                )}
              >
                <Icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <p className="text-gray-400 text-xs">v0.1.0</p>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}
