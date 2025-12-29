/**
 * Graph Types
 * Types for graph traversal operations
 */
import type { Entity, SubGraph } from '@moryflow/memory-core';

/** Traversal node representing an entity in a graph path */
export interface TraversalNode {
  entity: Entity;
  depth: number;
  path: string[];
}

/** Result of graph traversal */
export interface TraversalResult {
  nodes: TraversalNode[];
  subGraph: SubGraph;
}
