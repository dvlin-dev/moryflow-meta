/**
 * Entity Mappers
 * Transform database rows to domain objects
 */
import type { Entity } from '@moryflow/memory-core';
import type { EntityRow, TraversalEntityRow } from '../types/database.types';

/** Map database row to Entity */
export function toEntity(row: EntityRow | TraversalEntityRow): Entity {
  return {
    id: row.id,
    type: row.type as Entity['type'],
    name: row.name,
    properties: row.properties,
    userId: row.user_id,
    source: row.source,
    confidence: row.confidence,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** Map database row to Entity with score */
export function toScoredEntity(row: EntityRow & { score: number }): Entity & { score: number } {
  return {
    ...toEntity(row),
    score: row.score,
  };
}
