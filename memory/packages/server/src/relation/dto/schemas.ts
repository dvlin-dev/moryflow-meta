/**
 * Relation DTO Zod Schemas
 */
import { z } from 'zod';

// ==================== 请求 Schema ====================

/** 创建关系请求 Schema */
export const CreateRelationRequestSchema = z.object({
  sourceId: z.string().min(1),
  targetId: z.string().min(1),
  type: z.string().min(1),
  properties: z.record(z.unknown()).optional(),
  userId: z.string().min(1),
  confidence: z.number().min(0).max(1).optional(),
  validFrom: z.string().datetime().optional(),
  validTo: z.string().datetime().optional(),
});
