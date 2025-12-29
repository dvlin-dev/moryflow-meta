import type {
  MemorySource,
  MemoryMetadata,
  MemoryItem,
  ScoredMemoryItem,
  Entity,
  Relation,
  SubGraph,
} from './schemas/index.js';

// Re-export schema types
export type {
  MemorySource,
  MemoryMetadata,
  MemoryItem,
  ScoredMemoryItem,
  Entity,
  Relation,
  SubGraph,
};

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

// ============ Config Types ============

export interface EmbeddingConfig {
  provider: 'aliyun' | 'openai' | 'custom';
  apiKey: string;
  baseUrl?: string;
  model?: string;
  dimension?: number;
}

export interface LLMConfig {
  provider: 'openai' | 'anthropic' | 'custom';
  apiKey: string;
  baseUrl?: string;
  model?: string;
}

export interface MemoryConfig {
  embedding: EmbeddingConfig;
  llm?: LLMConfig;
  vectorIndexType?: 'hnsw' | 'ivfflat';
}
