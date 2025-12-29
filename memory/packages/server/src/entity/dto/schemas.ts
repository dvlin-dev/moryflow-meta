/**
 * Entity DTO Zod Schemas
 */
import { z } from 'zod';

// ==================== 基础 Schema ====================

/** 实体类型枚举 */
export const EntityTypeSchema = z.enum([
  'person',
  'organization',
  'location',
  'concept',
  'event',
  'custom',
]);

// ==================== 请求 Schema ====================

/** 创建实体请求 Schema */
export const CreateEntityRequestSchema = z.object({
  type: EntityTypeSchema,
  name: z.string().min(1),
  properties: z.record(z.unknown()).optional(),
  userId: z.string().min(1),
  source: z.string().optional(),
  confidence: z.number().min(0).max(1).optional(),
});

/** 更新实体请求 Schema */
export const UpdateEntityRequestSchema = z.object({
  type: EntityTypeSchema.optional(),
  name: z.string().min(1).optional(),
  properties: z.record(z.unknown()).optional(),
  confidence: z.number().min(0).max(1).optional(),
});

/** 搜索实体请求 Schema */
export const SearchEntityRequestSchema = z.object({
  query: z.string().min(1),
  userId: z.string().min(1),
  type: z.string().optional(),
  limit: z.number().min(1).max(100).optional(),
  threshold: z.number().min(0).max(1).optional(),
});
