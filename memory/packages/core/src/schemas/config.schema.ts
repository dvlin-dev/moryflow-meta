import { z } from 'zod';

// ============ Embedding Config Schema ============

export const EmbeddingProviderSchema = z.enum(['aliyun', 'openai', 'custom']);

export const EmbeddingConfigSchema = z.object({
  provider: EmbeddingProviderSchema,
  apiKey: z.string().min(1, 'apiKey is required'),
  baseUrl: z.string().url().optional(),
  model: z.string().optional(),
  dimension: z.number().int().positive().optional(),
});

// ============ LLM Config Schema ============

export const LLMProviderSchema = z.enum(['openai', 'anthropic', 'custom']);

export const LLMConfigSchema = z.object({
  provider: LLMProviderSchema,
  apiKey: z.string().min(1, 'apiKey is required'),
  baseUrl: z.string().url().optional(),
  model: z.string().optional(),
});

// ============ Memory Config Schema ============

export const VectorIndexTypeSchema = z.enum(['hnsw', 'ivfflat']);

export const MemoryConfigSchema = z.object({
  embedding: EmbeddingConfigSchema,
  llm: LLMConfigSchema.optional(),
  vectorIndexType: VectorIndexTypeSchema.optional(),
});

// ============ Type Exports ============

export type EmbeddingProvider = z.infer<typeof EmbeddingProviderSchema>;
export type EmbeddingConfig = z.infer<typeof EmbeddingConfigSchema>;
export type LLMProvider = z.infer<typeof LLMProviderSchema>;
export type LLMConfig = z.infer<typeof LLMConfigSchema>;
export type VectorIndexType = z.infer<typeof VectorIndexTypeSchema>;
export type MemoryConfig = z.infer<typeof MemoryConfigSchema>;
