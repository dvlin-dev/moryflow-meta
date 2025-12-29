/**
 * Database Row Types
 * Raw row types from database queries
 */

/** Memory table row */
export interface MemoryRow {
  id: string;
  content: string;
  user_id: string;
  agent_id: string | null;
  session_id: string | null;
  source: string;
  importance: number;
  tags: string[];
  created_at: Date;
  updated_at: Date;
}

/** Memory row with similarity score */
export interface ScoredMemoryRow extends MemoryRow {
  score: number;
}

/** Entity table row */
export interface EntityRow {
  id: string;
  type: string;
  name: string;
  properties: Record<string, unknown>;
  user_id: string;
  source: string | null;
  confidence: number;
  created_at: Date;
  updated_at: Date;
}

/** Entity row with similarity score */
export interface ScoredEntityRow extends EntityRow {
  score: number;
}

/** Entity row for graph traversal */
export interface TraversalEntityRow extends EntityRow {
  depth: number;
  path: string[];
}

/** Relation table row */
export interface RelationRow {
  id: string;
  source_id: string;
  target_id: string;
  type: string;
  properties: Record<string, unknown>;
  user_id: string;
  confidence: number;
  valid_from: Date | null;
  valid_to: Date | null;
  created_at: Date;
}

/** Count query result */
export interface CountRow {
  count: bigint;
}
