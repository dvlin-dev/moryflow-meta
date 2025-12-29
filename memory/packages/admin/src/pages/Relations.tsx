/**
 * Relations page - CRUD for entity relationships
 *
 * [PROPS]: none (route component)
 * [EMITS]: none
 * [POS]: Main page for viewing, adding, and deleting relations between entities
 */
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Trash2, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'
import { relationApi, entityApi, type Relation, type Entity } from '@/api/client'
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
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'

export default function Relations() {
  const queryClient = useQueryClient()
  const [showAddModal, setShowAddModal] = useState(false)
  const [newRelation, setNewRelation] = useState({
    sourceId: '',
    targetId: '',
    type: '',
  })

  const { data: relations, isLoading } = useQuery({
    queryKey: ['relations', 'list'],
    queryFn: () => relationApi.list(),
  })

  const { data: entities } = useQuery({
    queryKey: ['entities', 'list'],
    queryFn: () => entityApi.list(),
  })

  const createMutation = useMutation({
    mutationFn: (data: { sourceId: string; targetId: string; type: string }) =>
      relationApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['relations'] })
      setShowAddModal(false)
      setNewRelation({ sourceId: '', targetId: '', type: '' })
      toast.success('Relation created successfully')
    },
    onError: () => {
      toast.error('Failed to create relation')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => relationApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['relations'] })
      toast.success('Relation deleted')
    },
    onError: () => {
      toast.error('Failed to delete relation')
    },
  })

  const getEntityName = (id: string) => {
    const entity = entities?.find((e) => e.id === id)
    return entity?.name ?? id.slice(0, 8)
  }

  const handleCloseModal = () => {
    setShowAddModal(false)
    setNewRelation({ sourceId: '', targetId: '', type: '' })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Relations</h1>
        <Button
          onClick={() => setShowAddModal(true)}
          disabled={!entities || entities.length < 2}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Relation
        </Button>
      </div>

      {/* Relations List */}
      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : !relations || relations.length === 0 ? (
            <p className="text-muted-foreground">No relations found</p>
          ) : (
            <div className="divide-y">
              {relations.map((relation: Relation) => (
                <div
                  key={relation.id}
                  className="py-4 first:pt-0 last:pb-0 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-medium">
                      {getEntityName(relation.sourceId)}
                    </span>
                    <Badge variant="secondary" className="flex items-center gap-2">
                      <ArrowRight className="w-4 h-4" />
                      <span>{relation.type}</span>
                    </Badge>
                    <span className="font-medium">
                      {getEntityName(relation.targetId)}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteMutation.mutate(relation.id)}
                    disabled={deleteMutation.isPending}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Relation</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Source Entity</Label>
              <Select
                value={newRelation.sourceId}
                onValueChange={(value) =>
                  setNewRelation({ ...newRelation, sourceId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select entity..." />
                </SelectTrigger>
                <SelectContent>
                  {entities?.map((entity: Entity) => (
                    <SelectItem key={entity.id} value={entity.id}>
                      {entity.name} ({entity.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Relation Type</Label>
              <Input
                value={newRelation.type}
                onChange={(e) =>
                  setNewRelation({ ...newRelation, type: e.target.value })
                }
                placeholder="e.g., works_at, knows, part_of"
              />
            </div>

            <div className="space-y-2">
              <Label>Target Entity</Label>
              <Select
                value={newRelation.targetId}
                onValueChange={(value) =>
                  setNewRelation({ ...newRelation, targetId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select entity..." />
                </SelectTrigger>
                <SelectContent>
                  {entities
                    ?.filter((e: Entity) => e.id !== newRelation.sourceId)
                    .map((entity: Entity) => (
                      <SelectItem key={entity.id} value={entity.id}>
                        {entity.name} ({entity.type})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button
              onClick={() => createMutation.mutate(newRelation)}
              disabled={
                !newRelation.sourceId ||
                !newRelation.targetId ||
                !newRelation.type.trim() ||
                createMutation.isPending
              }
            >
              {createMutation.isPending ? 'Creating...' : 'Create Relation'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
