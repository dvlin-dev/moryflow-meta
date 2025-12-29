import type { ScoredMemoryItem, SubGraph, Entity } from './schemas/index';

// ============ Search Result Types ============

export interface SearchResult {
  items: ScoredMemoryItem[];
  graph?: SubGraph;
  took: number; // milliseconds
}

// ============ Embedding Types ============

export interface EmbeddingResult {
  embedding: number[];
  model: string;
  usage?: {
    promptTokens: number;
    totalTokens: number;
  };
}

// ============ LLM Types ============

export interface LLMGenerateOptions {
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
}

export interface ExtractedEntity {
  type: string;
  name: string;
  properties?: Record<string, unknown>;
  confidence: number;
}

export interface ExtractedRelation {
  sourceEntity: string; // entity name
  targetEntity: string; // entity name
  type: string;
  properties?: Record<string, unknown>;
  confidence: number;
}

export interface ExtractionResult {
  entities: ExtractedEntity[];
  relations: ExtractedRelation[];
}

// ============ Graph Traversal Types ============

export interface TraversalNode {
  entity: Entity;
  depth: number;
  path: string[]; // entity IDs from root to this node
}

export interface TraversalResult {
  nodes: TraversalNode[];
  subGraph: SubGraph;
}
