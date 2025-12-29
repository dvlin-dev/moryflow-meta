/**
 * Memory DTO Types
 */
import { z } from 'zod';
import {
  AddMemoryRequestSchema,
  SearchMemoryRequestSchema,
  MemoryMetadataSchema,
  SearchFilterSchema,
} from './schemas';

// ==================== 请求类型 ====================

/** 添加记忆请求 */
export type AddMemoryRequest = z.infer<typeof AddMemoryRequestSchema>;

/** 搜索记忆请求 */
export type SearchMemoryRequest = z.infer<typeof SearchMemoryRequestSchema>;

/** 记忆元数据 */
export type MemoryMetadata = z.infer<typeof MemoryMetadataSchema>;

/** 搜索过滤器 */
export type SearchFilter = z.infer<typeof SearchFilterSchema>;

// ==================== 响应类型 ====================

/** 记忆项响应 */
export interface MemoryItemResponse {
  id: string;
  content: string;
  metadata: MemoryMetadata;
  createdAt: string;
  updatedAt: string;
}

/** 带分数的记忆项响应 */
export interface ScoredMemoryItemResponse extends MemoryItemResponse {
  score: number;
  source: 'vector' | 'graph' | 'hybrid';
}

/** 搜索结果响应 */
export interface SearchResultResponse {
  items: ScoredMemoryItemResponse[];
  took: number;
}
