import { z } from 'zod';

// ============ Memory Source Enum ============

export const MemorySourceSchema = z.enum(['conversation', 'document', 'extraction']);

// ============ Memory Metadata Schema ============

export const MemoryMetadataSchema = z.object({
  userId: z.string().min(1, 'userId is required'),
  agentId: z.string().optional(),
  sessionId: z.string().optional(),
  source: MemorySourceSchema.default('conversation'),
  importance: z.number().min(0).max(1).default(0.5),
  tags: z.array(z.string()).default([]),
});

// ============ Add Memory Input Schema ============

export const AddMemoryInputSchema = z.object({
  content: z.string().min(1, 'content is required'),
  metadata: MemoryMetadataSchema,
  extractEntities: z.boolean().default(false),
  extractRelations: z.boolean().default(false),
});

// ============ Update Memory Input Schema ============

export const UpdateMemoryInputSchema = z.object({
  content: z.string().min(1).optional(),
  metadata: MemoryMetadataSchema.partial().optional(),
});

// ============ Search Options Schema ============

export const DateRangeSchema = z.object({
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});

export const SearchFilterSchema = z.object({
  agentId: z.string().optional(),
  sessionId: z.string().optional(),
  source: MemorySourceSchema.optional(),
  tags: z.array(z.string()).optional(),
  dateRange: DateRangeSchema.optional(),
});

export const SearchOptionsSchema = z.object({
  userId: z.string().min(1, 'userId is required'),
  limit: z.number().min(1).max(100).default(10),
  threshold: z.number().min(0).max(1).default(0.7),
  filter: SearchFilterSchema.optional(),
  includeGraph: z.boolean().default(false),
  graphDepth: z.number().min(1).max(5).default(2),
});

// ============ Memory Item Schema (for responses) ============

export const MemoryItemSchema = z.object({
  id: z.string().uuid(),
  content: z.string(),
  metadata: MemoryMetadataSchema,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const ScoredMemoryItemSchema = MemoryItemSchema.extend({
  score: z.number().min(0).max(1),
  retrievalSource: z.enum(['vector', 'graph', 'hybrid']),
});

// ============ Type Exports ============

export type MemorySource = z.infer<typeof MemorySourceSchema>;
export type MemoryMetadata = z.infer<typeof MemoryMetadataSchema>;
export type AddMemoryInput = z.infer<typeof AddMemoryInputSchema>;
export type UpdateMemoryInput = z.infer<typeof UpdateMemoryInputSchema>;
export type DateRange = z.infer<typeof DateRangeSchema>;
export type SearchFilter = z.infer<typeof SearchFilterSchema>;
export type SearchOptions = z.infer<typeof SearchOptionsSchema>;
export type MemoryItem = z.infer<typeof MemoryItemSchema>;
export type ScoredMemoryItem = z.infer<typeof ScoredMemoryItemSchema>;
