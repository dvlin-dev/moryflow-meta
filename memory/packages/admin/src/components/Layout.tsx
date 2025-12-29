import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Brain,
  Network,
  GitBranch,
  Share2,
} from 'lucide-react';
import { clsx } from 'clsx';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Memories', href: '/memories', icon: Brain },
  { name: 'Entities', href: '/entities', icon: Network },
  { name: 'Relations', href: '/relations', icon: GitBranch },
  { name: 'Graph', href: '/graph', icon: Share2 },
];

export default function Layout({ children }: { children: React.ReactNode }) {
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
                <item.icon className="w-5 h-5" />
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
