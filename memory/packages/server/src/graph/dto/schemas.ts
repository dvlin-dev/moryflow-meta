/**
 * Graph DTO Zod Schemas
 */
import { z } from 'zod';

// ==================== 请求 Schema ====================

/** 图遍历请求 Schema */
export const TraverseRequestSchema = z.object({
  entityId: z.string().min(1),
  userId: z.string().min(1),
  depth: z.number().min(1).max(10).optional(),
  direction: z.enum(['outgoing', 'incoming', 'both']).optional(),
  relationTypes: z.array(z.string()).optional(),
  limit: z.number().min(1).max(1000).optional(),
});

/** 查找路径请求 Schema */
export const FindPathRequestSchema = z.object({
  sourceId: z.string().min(1),
  targetId: z.string().min(1),
  userId: z.string().min(1),
  maxDepth: z.number().min(1).max(10).optional(),
});

/** 获取子图请求 Schema */
export const GetSubGraphRequestSchema = z.object({
  entityIds: z.array(z.string().min(1)).min(1),
  userId: z.string().min(1),
});
