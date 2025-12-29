/**
 * Dashboard page - Overview and stats
 *
 * [PROPS]: none (route component)
 * [EMITS]: none
 * [POS]: Landing page showing memory/entity/relation counts and recent items
 */
import { useQuery } from '@tanstack/react-query'
import { Brain, Network, GitBranch, Activity } from 'lucide-react'
import type { ReactNode } from 'react'
import { memoryApi, entityApi, relationApi } from '@/api/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

interface StatCardProps {
  title: string
  value: number | string
  icon: ReactNode
  color: string
  isLoading?: boolean
}

function StatCard({ title, value, icon, color, isLoading }: StatCardProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-lg ${color}`}>{icon}</div>
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            {isLoading ? (
              <Skeleton className="h-8 w-16 mt-1" />
            ) : (
              <p className="text-2xl font-bold">{value}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function Dashboard() {
  const { data: memories, isLoading: isLoadingMemories } = useQuery({
    queryKey: ['memories', 'list'],
    queryFn: () => memoryApi.list(100),
  })

  const { data: entities, isLoading: isLoadingEntities } = useQuery({
    queryKey: ['entities', 'list'],
    queryFn: () => entityApi.list(),
  })

  const { data: relations, isLoading: isLoadingRelations } = useQuery({
    queryKey: ['relations', 'list'],
    queryFn: () => relationApi.list(),
  })

  const isLoading = isLoadingMemories || isLoadingEntities || isLoadingRelations

  const stats: StatCardProps[] = [
    {
      title: 'Total Memories',
      value: memories?.length ?? 0,
      icon: <Brain className="w-6 h-6 text-white" />,
      color: 'bg-blue-500',
      isLoading: isLoadingMemories,
    },
    {
      title: 'Total Entities',
      value: entities?.length ?? 0,
      icon: <Network className="w-6 h-6 text-white" />,
      color: 'bg-green-500',
      isLoading: isLoadingEntities,
    },
    {
      title: 'Total Relations',
      value: relations?.length ?? 0,
      icon: <GitBranch className="w-6 h-6 text-white" />,
      color: 'bg-purple-500',
      isLoading: isLoadingRelations,
    },
    {
      title: 'Status',
      value: 'Active',
      icon: <Activity className="w-6 h-6 text-white" />,
      color: 'bg-emerald-500',
      isLoading: false,
    },
  ]

  // Entity type distribution
  const entityTypes = entities?.reduce(
    (acc, e) => {
      acc[e.type] = (acc[e.type] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  // Recent memories
  const recentMemories = memories?.slice(0, 5) ?? []

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Memories */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Memories</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : recentMemories.length === 0 ? (
              <p className="text-muted-foreground">No memories yet</p>
            ) : (
              <div className="space-y-3">
                {recentMemories.map((memory) => (
                  <div
                    key={memory.id}
                    className="p-3 bg-muted rounded-lg text-sm"
                  >
                    <p className="line-clamp-2">{memory.content}</p>
                    <p className="text-muted-foreground text-xs mt-1">
                      {new Date(memory.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Entity Types */}
        <Card>
          <CardHeader>
            <CardTitle>Entity Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            ) : !entityTypes || Object.keys(entityTypes).length === 0 ? (
              <p className="text-muted-foreground">No entities yet</p>
            ) : (
              <div className="space-y-3">
                {Object.entries(entityTypes).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between">
                    <span className="capitalize">{type}</span>
                    <Badge variant="secondary">{count}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
