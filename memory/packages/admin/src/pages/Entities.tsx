import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, X, Search } from 'lucide-react';
import { entityApi, type Entity } from '../api/client';

const ENTITY_TYPES = [
  'person',
  'organization',
  'location',
  'concept',
  'event',
  'custom',
];

export default function Entities() {
  const queryClient = useQueryClient();
  const [filterType, setFilterType] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEntity, setNewEntity] = useState({ type: 'person', name: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const { data: entities, isLoading } = useQuery({
    queryKey: ['entities', 'list', filterType],
    queryFn: () => entityApi.list(filterType || undefined),
  });

  const { data: searchResults } = useQuery({
    queryKey: ['entities', 'search', searchQuery],
    queryFn: () => entityApi.search(searchQuery),
    enabled: isSearching && searchQuery.length > 0,
  });

  const createMutation = useMutation({
    mutationFn: (data: { type: string; name: string }) => entityApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entities'] });
      setShowAddModal(false);
      setNewEntity({ type: 'person', name: '' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => entityApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entities'] });
    },
  });

  const displayEntities = isSearching && searchResults ? searchResults : entities;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Entities</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Entity
        </button>
      </div>

      {/* Filters & Search */}
      <div className="card mb-6">
        <div className="flex gap-4 flex-wrap">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="input w-auto"
          >
            <option value="">All Types</option>
            {ENTITY_TYPES.map((type) => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>

          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search entities..."
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
      </div>

      {/* Entity Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <p className="text-gray-500 col-span-full">Loading...</p>
        ) : !displayEntities || displayEntities.length === 0 ? (
          <p className="text-gray-500 col-span-full">No entities found</p>
        ) : (
          displayEntities.map((entity: Entity & { score?: number }) => (
            <div key={entity.id} className="card">
              <div className="flex justify-between items-start">
                <div>
                  <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded text-xs uppercase">
                    {entity.type}
                  </span>
                  <h3 className="font-semibold mt-2">{entity.name}</h3>
                  {entity.score !== undefined && (
                    <p className="text-sm text-gray-500">
                      Score: {entity.score.toFixed(3)}
                    </p>
                  )}
                  <p className="text-sm text-gray-500 mt-1">
                    Confidence: {(entity.confidence * 100).toFixed(0)}%
                  </p>
                </div>
                <button
                  onClick={() => deleteMutation.mutate(entity.id)}
                  className="p-2 text-gray-400 hover:text-red-500"
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Add Entity</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="label">Type</label>
                <select
                  value={newEntity.type}
                  onChange={(e) =>
                    setNewEntity({ ...newEntity, type: e.target.value })
                  }
                  className="input"
                >
                  {ENTITY_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Name</label>
                <input
                  type="text"
                  value={newEntity.name}
                  onChange={(e) =>
                    setNewEntity({ ...newEntity, name: e.target.value })
                  }
                  placeholder="Entity name..."
                  className="input"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={() => createMutation.mutate(newEntity)}
                disabled={!newEntity.name.trim() || createMutation.isPending}
                className="btn btn-primary"
              >
                {createMutation.isPending ? 'Creating...' : 'Create Entity'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
