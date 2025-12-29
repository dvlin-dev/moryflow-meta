/**
 * Relation DTO Types
 */
import { z } from 'zod';
import { CreateRelationRequestSchema } from './schemas';

// ==================== 请求类型 ====================

/** 创建关系请求 */
export type CreateRelationRequest = z.infer<typeof CreateRelationRequestSchema>;

// ==================== 响应类型 ====================

/** 关系响应 */
export interface RelationResponse {
  id: string;
  sourceId: string;
  targetId: string;
  type: string;
  properties: Record<string, unknown>;
  userId: string;
  confidence: number;
  validFrom?: string;
  validTo?: string;
  createdAt: string;
  updatedAt: string;
}
