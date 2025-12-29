/**
 * Relation Mappers
 * Transform database rows to domain objects
 */
import type { Relation } from '@moryflow/memory-core';
import type { RelationRow } from '../types/database.types';

/** Map database row to Relation */
export function toRelation(row: RelationRow): Relation {
  return {
    id: row.id,
    sourceId: row.source_id,
    targetId: row.target_id,
    type: row.type,
    properties: row.properties,
    userId: row.user_id,
    confidence: row.confidence,
    validFrom: row.valid_from,
    validTo: row.valid_to,
    createdAt: row.created_at,
  };
}
