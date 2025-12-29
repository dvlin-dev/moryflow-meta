/**
 * Graph DTO Types
 */
import { z } from 'zod';
import {
  TraverseRequestSchema,
  FindPathRequestSchema,
  GetSubGraphRequestSchema,
} from './schemas';
import type { Entity, SubGraph } from '@moryflow/memory-core';

// ==================== 请求类型 ====================

/** 图遍历请求 */
export type TraverseRequest = z.infer<typeof TraverseRequestSchema>;

/** 查找路径请求 */
export type FindPathRequest = z.infer<typeof FindPathRequestSchema>;

/** 获取子图请求 */
export type GetSubGraphRequest = z.infer<typeof GetSubGraphRequestSchema>;

// ==================== 响应类型 ====================

/** 遍历节点 */
export interface TraversalNode {
  entity: Entity;
  depth: number;
  path: string[];
}

/** 遍历结果 */
export interface TraversalResult {
  nodes: TraversalNode[];
  subGraph: SubGraph;
}
