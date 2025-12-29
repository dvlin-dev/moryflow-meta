/**
 * Memories page - CRUD for memory items
 *
 * [PROPS]: none (route component)
 * [EMITS]: none
 * [POS]: Main page for viewing, searching, adding, and deleting memories
 */
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Search, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { memoryApi, type Memory } from '@/api/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
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

export default function Memories() {
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newContent, setNewContent] = useState('')

  const { data: memories, isLoading } = useQuery({
    queryKey: ['memories', 'list'],
    queryFn: () => memoryApi.list(100),
  })

  const { data: searchResults } = useQuery({
    queryKey: ['memories', 'search', searchQuery],
    queryFn: () => memoryApi.search(searchQuery),
    enabled: isSearching && searchQuery.length > 0,
  })

  const createMutation = useMutation({
    mutationFn: (content: string) => memoryApi.create(content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memories'] })
      setShowAddModal(false)
      setNewContent('')
      toast.success('Memory added successfully')
    },
    onError: () => {
      toast.error('Failed to add memory')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => memoryApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memories'] })
      toast.success('Memory deleted')
    },
    onError: () => {
      toast.error('Failed to delete memory')
    },
  })

  const displayMemories = isSearching && searchResults ? searchResults.items : memories

  const handleCloseModal = () => {
    setShowAddModal(false)
    setNewContent('')
  }

  const handleClear = () => {
    setIsSearching(false)
    setSearchQuery('')
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Memories</h1>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Memory
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search memories semantically..."
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
          {isSearching && searchResults && (
            <p className="mt-2 text-sm text-muted-foreground">
              Found {searchResults.items.length} results in {searchResults.took}ms
            </p>
          )}
        </CardContent>
      </Card>

      {/* Memory List */}
      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : !displayMemories || displayMemories.length === 0 ? (
            <p className="text-muted-foreground">No memories found</p>
          ) : (
            <div className="divide-y">
              {displayMemories.map((memory: Memory & { score?: number }) => (
                <div key={memory.id} className="py-4 first:pt-0 last:pb-0">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <p className="text-foreground">{memory.content}</p>
                      <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                        <span>Source: {memory.metadata.source}</span>
                        {memory.score !== undefined && (
                          <span>Score: {memory.score.toFixed(3)}</span>
                        )}
                        <span>
                          {new Date(memory.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {memory.metadata.tags.length > 0 && (
                        <div className="flex gap-2 mt-2">
                          {memory.metadata.tags.map((tag) => (
                            <Badge key={tag} variant="secondary">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteMutation.mutate(memory.id)}
                      disabled={deleteMutation.isPending}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Dialog */}
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
              onClick={() => createMutation.mutate(newContent)}
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
