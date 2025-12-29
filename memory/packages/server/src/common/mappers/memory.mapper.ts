/**
 * Memory Mappers
 * Transform database rows to domain objects
 */
import type { MemoryItem, ScoredMemoryItem } from '@moryflow/memory-core';
import type { MemoryRow, ScoredMemoryRow } from '../types/database.types';

/** Map database row to MemoryItem */
export function toMemoryItem(row: MemoryRow): MemoryItem {
  return {
    id: row.id,
    content: row.content,
    metadata: {
      userId: row.user_id,
      agentId: row.agent_id ?? undefined,
      sessionId: row.session_id ?? undefined,
      source: row.source as 'conversation' | 'document' | 'extraction',
      importance: row.importance,
      tags: row.tags,
    },
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** Map database row to ScoredMemoryItem */
export function toScoredMemoryItem(row: ScoredMemoryRow): ScoredMemoryItem {
  return {
    ...toMemoryItem(row),
    score: row.score,
    retrievalSource: 'vector' as const,
  };
}
