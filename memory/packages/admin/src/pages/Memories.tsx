import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Plus, Trash2, X } from 'lucide-react';
import { memoryApi, type Memory } from '../api/client';

export default function Memories() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newContent, setNewContent] = useState('');

  const { data: memories, isLoading } = useQuery({
    queryKey: ['memories', 'list'],
    queryFn: () => memoryApi.list(100),
  });

  const { data: searchResults } = useQuery({
    queryKey: ['memories', 'search', searchQuery],
    queryFn: () => memoryApi.search(searchQuery),
    enabled: isSearching && searchQuery.length > 0,
  });

  const createMutation = useMutation({
    mutationFn: (content: string) => memoryApi.create(content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memories'] });
      setShowAddModal(false);
      setNewContent('');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => memoryApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memories'] });
    },
  });

  const displayMemories = isSearching && searchResults ? searchResults.items : memories;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Memories</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Memory
        </button>
      </div>

      {/* Search */}
      <div className="card mb-6">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search memories semantically..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && setIsSearching(true)}
              className="input pl-10"
            />
          </div>
          <button
            onClick={() => setIsSearching(true)}
            className="btn btn-primary"
          >
            Search
          </button>
          {isSearching && (
            <button
              onClick={() => {
                setIsSearching(false);
                setSearchQuery('');
              }}
              className="btn btn-secondary"
            >
              Clear
            </button>
          )}
        </div>
        {isSearching && searchResults && (
          <p className="mt-2 text-sm text-gray-500">
            Found {searchResults.items.length} results in {searchResults.took}ms
          </p>
        )}
      </div>

      {/* Memory List */}
      <div className="card">
        {isLoading ? (
          <p className="text-gray-500">Loading...</p>
        ) : !displayMemories || displayMemories.length === 0 ? (
          <p className="text-gray-500">No memories found</p>
        ) : (
          <div className="divide-y">
            {displayMemories.map((memory: Memory & { score?: number }) => (
              <div key={memory.id} className="py-4 first:pt-0 last:pb-0">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <p className="text-gray-900">{memory.content}</p>
                    <div className="flex gap-4 mt-2 text-sm text-gray-500">
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
                          <span
                            key={tag}
                            className="px-2 py-1 bg-gray-100 rounded text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => deleteMutation.mutate(memory.id)}
                    className="p-2 text-gray-400 hover:text-red-500"
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Add Memory</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <textarea
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="Enter memory content..."
              className="input min-h-[120px] resize-none"
            />
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setShowAddModal(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={() => createMutation.mutate(newContent)}
                disabled={!newContent.trim() || createMutation.isPending}
                className="btn btn-primary"
              >
                {createMutation.isPending ? 'Adding...' : 'Add Memory'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
