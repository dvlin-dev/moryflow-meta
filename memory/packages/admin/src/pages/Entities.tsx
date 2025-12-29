/**
 * Entities page - CRUD for knowledge graph entities
 *
 * [PROPS]: none (route component)
 * [EMITS]: none
 * [POS]: Main page for viewing, searching, adding, and deleting entities
 */
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Trash2, Search } from 'lucide-react'
import { toast } from 'sonner'
import { entityApi, type Entity } from '@/api/client'
import { ENTITY_TYPES } from '@/constants'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

export default function Entities() {
  const queryClient = useQueryClient()
  const [filterType, setFilterType] = useState<string>('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [newEntity, setNewEntity] = useState({ type: 'person', name: '' })
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)

  const { data: entities, isLoading } = useQuery({
    queryKey: ['entities', 'list', filterType],
    queryFn: () => entityApi.list(filterType || undefined),
  })

  const { data: searchResults } = useQuery({
    queryKey: ['entities', 'search', searchQuery],
    queryFn: () => entityApi.search(searchQuery),
    enabled: isSearching && searchQuery.length > 0,
  })

  const createMutation = useMutation({
    mutationFn: (data: { type: string; name: string }) => entityApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entities'] })
      setShowAddModal(false)
      setNewEntity({ type: 'person', name: '' })
      toast.success('Entity created successfully')
    },
    onError: () => {
      toast.error('Failed to create entity')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => entityApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entities'] })
      toast.success('Entity deleted')
    },
    onError: () => {
      toast.error('Failed to delete entity')
    },
  })

  const displayEntities = isSearching && searchResults ? searchResults : entities

  const handleCloseModal = () => {
    setShowAddModal(false)
    setNewEntity({ type: 'person', name: '' })
  }

  const handleClear = () => {
    setIsSearching(false)
    setSearchQuery('')
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Entities</h1>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Entity
        </Button>
      </div>

      {/* Filters & Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 flex-wrap">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Types</SelectItem>
                {ENTITY_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search entities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && setIsSearching(true)}
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

      {/* Entity Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <>
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </>
        ) : !displayEntities || displayEntities.length === 0 ? (
          <p className="text-muted-foreground col-span-full">No entities found</p>
        ) : (
          displayEntities.map((entity: Entity & { score?: number }) => (
            <Card key={entity.id}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div>
                    <Badge variant="secondary" className="uppercase text-xs">
                      {entity.type}
                    </Badge>
                    <h3 className="font-semibold mt-2">{entity.name}</h3>
                    {entity.score !== undefined && (
                      <p className="text-sm text-muted-foreground">
                        Score: {entity.score.toFixed(3)}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground mt-1">
                      Confidence: {(entity.confidence * 100).toFixed(0)}%
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteMutation.mutate(entity.id)}
                    disabled={deleteMutation.isPending}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Add Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Entity</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={newEntity.type}
                onValueChange={(value) => setNewEntity({ ...newEntity, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ENTITY_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={newEntity.name}
                onChange={(e) => setNewEntity({ ...newEntity, name: e.target.value })}
                placeholder="Entity name..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button
              onClick={() => createMutation.mutate(newEntity)}
              disabled={!newEntity.name.trim() || createMutation.isPending}
            >
              {createMutation.isPending ? 'Creating...' : 'Create Entity'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
