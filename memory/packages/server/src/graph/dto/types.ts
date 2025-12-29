/**
 * Graph DTO Types
 */
import { z } from 'zod';
import {
  TraverseRequestSchema,
  FindPathRequestSchema,
  GetSubGraphRequestSchema,
} from './schemas';

// Re-export shared types
export type { TraversalNode, TraversalResult } from '../../common/types';

// ==================== 请求类型 ====================

/** 图遍历请求 */
export type TraverseRequest = z.infer<typeof TraverseRequestSchema>;

/** 查找路径请求 */
export type FindPathRequest = z.infer<typeof FindPathRequestSchema>;

/** 获取子图请求 */
export type GetSubGraphRequest = z.infer<typeof GetSubGraphRequestSchema>;
