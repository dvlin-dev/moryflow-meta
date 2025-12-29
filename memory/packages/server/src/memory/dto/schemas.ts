/**
 * Memory DTO Zod Schemas
 */
import { z } from 'zod';

// ==================== 基础 Schema ====================

/** 记忆元数据 Schema */
export const MemoryMetadataSchema = z.object({
  userId: z.string().min(1),
  agentId: z.string().optional(),
  sessionId: z.string().optional(),
  source: z.enum(['conversation', 'document', 'extraction']).optional(),
  importance: z.number().min(0).max(1).optional(),
  tags: z.array(z.string()).optional(),
});

/** 搜索过滤器 Schema */
export const SearchFilterSchema = z.object({
  agentId: z.string().optional(),
  sessionId: z.string().optional(),
  source: z.enum(['conversation', 'document', 'extraction']).optional(),
  tags: z.array(z.string()).optional(),
});

// ==================== 请求 Schema ====================

/** 添加记忆请求 Schema */
export const AddMemoryRequestSchema = z.object({
  content: z.string().min(1),
  metadata: MemoryMetadataSchema,
  extractEntities: z.boolean().optional(),
  extractRelations: z.boolean().optional(),
});

/** 搜索记忆请求 Schema */
export const SearchMemoryRequestSchema = z.object({
  query: z.string().min(1),
  userId: z.string().min(1),
  limit: z.number().min(1).max(100).optional(),
  threshold: z.number().min(0).max(1).optional(),
  includeGraph: z.boolean().optional(),
  graphDepth: z.number().min(1).max(5).optional(),
  filter: SearchFilterSchema.optional(),
});
