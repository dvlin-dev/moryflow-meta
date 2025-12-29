/**
 * Entity DTO Types
 */
import { z } from 'zod';
import {
  EntityTypeSchema,
  CreateEntityRequestSchema,
  UpdateEntityRequestSchema,
  SearchEntityRequestSchema,
} from './schemas';

// ==================== 基础类型 ====================

/** 实体类型 */
export type EntityType = z.infer<typeof EntityTypeSchema>;

// ==================== 请求类型 ====================

/** 创建实体请求 */
export type CreateEntityRequest = z.infer<typeof CreateEntityRequestSchema>;

/** 更新实体请求 */
export type UpdateEntityRequest = z.infer<typeof UpdateEntityRequestSchema>;

/** 搜索实体请求 */
export type SearchEntityRequest = z.infer<typeof SearchEntityRequestSchema>;

// ==================== 响应类型 ====================

/** 实体响应 */
export interface EntityResponse {
  id: string;
  type: EntityType;
  name: string;
  properties: Record<string, unknown>;
  userId: string;
  source?: string;
  confidence: number;
  createdAt: string;
  updatedAt: string;
}

/** 带分数的实体响应 */
export interface ScoredEntityResponse extends EntityResponse {
  score: number;
}
