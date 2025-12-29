/**
 * Response Mappers
 * Transform domain objects to API responses
 */
import type { MemoryItem, ScoredMemoryItem } from '@moryflow/memory-core';
import type {
  MemoryItemResponse,
  ScoredMemoryItemResponse,
} from '../../memory/dto/types';

/** Map MemoryItem to API response */
export function toMemoryItemResponse(item: MemoryItem): MemoryItemResponse {
  return {
    id: item.id,
    content: item.content,
    metadata: {
      userId: item.metadata.userId,
      agentId: item.metadata.agentId,
      sessionId: item.metadata.sessionId,
      source: item.metadata.source ?? 'conversation',
      importance: item.metadata.importance,
      tags: item.metadata.tags,
    },
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  };
}

/** Map ScoredMemoryItem to API response */
export function toScoredMemoryItemResponse(
  item: ScoredMemoryItem,
): ScoredMemoryItemResponse {
  return {
    ...toMemoryItemResponse(item),
    score: item.score,
    source: item.retrievalSource ?? 'vector',
  };
}
