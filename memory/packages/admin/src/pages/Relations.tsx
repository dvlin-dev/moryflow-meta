import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, X, ArrowRight } from 'lucide-react';
import { relationApi, entityApi, type Relation, type Entity } from '../api/client';

export default function Relations() {
  const queryClient = useQueryClient();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRelation, setNewRelation] = useState({
    sourceId: '',
    targetId: '',
    type: '',
  });

  const { data: relations, isLoading } = useQuery({
    queryKey: ['relations', 'list'],
    queryFn: () => relationApi.list(),
  });

  const { data: entities } = useQuery({
    queryKey: ['entities', 'list'],
    queryFn: () => entityApi.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data: { sourceId: string; targetId: string; type: string }) =>
      relationApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['relations'] });
      setShowAddModal(false);
      setNewRelation({ sourceId: '', targetId: '', type: '' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => relationApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['relations'] });
    },
  });

  const getEntityName = (id: string) => {
    const entity = entities?.find((e) => e.id === id);
    return entity?.name ?? id.slice(0, 8);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Relations</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn btn-primary flex items-center gap-2"
          disabled={!entities || entities.length < 2}
        >
          <Plus className="w-4 h-4" />
          Add Relation
        </button>
      </div>

      {/* Relations List */}
      <div className="card">
        {isLoading ? (
          <p className="text-gray-500">Loading...</p>
        ) : !relations || relations.length === 0 ? (
          <p className="text-gray-500">No relations found</p>
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
                  <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full text-sm">
                    <ArrowRight className="w-4 h-4" />
                    <span>{relation.type}</span>
                  </div>
                  <span className="font-medium">
                    {getEntityName(relation.targetId)}
                  </span>
                </div>
                <button
                  onClick={() => deleteMutation.mutate(relation.id)}
                  className="p-2 text-gray-400 hover:text-red-500"
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Add Relation</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="label">Source Entity</label>
                <select
                  value={newRelation.sourceId}
                  onChange={(e) =>
                    setNewRelation({ ...newRelation, sourceId: e.target.value })
                  }
                  className="input"
                >
                  <option value="">Select entity...</option>
                  {entities?.map((entity: Entity) => (
                    <option key={entity.id} value={entity.id}>
                      {entity.name} ({entity.type})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Relation Type</label>
                <input
                  type="text"
                  value={newRelation.type}
                  onChange={(e) =>
                    setNewRelation({ ...newRelation, type: e.target.value })
                  }
                  placeholder="e.g., works_at, knows, part_of"
                  className="input"
                />
              </div>

              <div>
                <label className="label">Target Entity</label>
                <select
                  value={newRelation.targetId}
                  onChange={(e) =>
                    setNewRelation({ ...newRelation, targetId: e.target.value })
                  }
                  className="input"
                >
                  <option value="">Select entity...</option>
                  {entities
                    ?.filter((e: Entity) => e.id !== newRelation.sourceId)
                    .map((entity: Entity) => (
                      <option key={entity.id} value={entity.id}>
                        {entity.name} ({entity.type})
                      </option>
                    ))}
                </select>
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
                onClick={() => createMutation.mutate(newRelation)}
                disabled={
                  !newRelation.sourceId ||
                  !newRelation.targetId ||
                  !newRelation.type.trim() ||
                  createMutation.isPending
                }
                className="btn btn-primary"
              >
                {createMutation.isPending ? 'Creating...' : 'Create Relation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
