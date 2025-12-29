import { useQuery } from '@tanstack/react-query';
import { Brain, Network, GitBranch, Activity } from 'lucide-react';
import { memoryApi, entityApi, relationApi } from '../api/client';

function StatCard({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string;
  value: number | string;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="card flex items-center gap-4">
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { data: memories } = useQuery({
    queryKey: ['memories', 'list'],
    queryFn: () => memoryApi.list(100),
  });

  const { data: entities } = useQuery({
    queryKey: ['entities', 'list'],
    queryFn: () => entityApi.list(),
  });

  const { data: relations } = useQuery({
    queryKey: ['relations', 'list'],
    queryFn: () => relationApi.list(),
  });

  const stats = [
    {
      title: 'Total Memories',
      value: memories?.length ?? 0,
      icon: Brain,
      color: 'bg-blue-500',
    },
    {
      title: 'Total Entities',
      value: entities?.length ?? 0,
      icon: Network,
      color: 'bg-green-500',
    },
    {
      title: 'Total Relations',
      value: relations?.length ?? 0,
      icon: GitBranch,
      color: 'bg-purple-500',
    },
    {
      title: 'Status',
      value: 'Active',
      icon: Activity,
      color: 'bg-emerald-500',
    },
  ];

  // Entity type distribution
  const entityTypes = entities?.reduce(
    (acc, e) => {
      acc[e.type] = (acc[e.type] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  // Recent memories
  const recentMemories = memories?.slice(0, 5) ?? [];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Memories */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Recent Memories</h2>
          {recentMemories.length === 0 ? (
            <p className="text-gray-500">No memories yet</p>
          ) : (
            <div className="space-y-3">
              {recentMemories.map((memory) => (
                <div
                  key={memory.id}
                  className="p-3 bg-gray-50 rounded-lg text-sm"
                >
                  <p className="line-clamp-2">{memory.content}</p>
                  <p className="text-gray-400 text-xs mt-1">
                    {new Date(memory.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Entity Types */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Entity Distribution</h2>
          {!entityTypes || Object.keys(entityTypes).length === 0 ? (
            <p className="text-gray-500">No entities yet</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(entityTypes).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <span className="capitalize">{type}</span>
                  <span className="px-2 py-1 bg-gray-100 rounded text-sm">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
