/**
 * HTTP client for Memory API
 *
 * [PROVIDES]: MemoryApiClient - HTTP client for all Memory API operations
 * [DEPENDS]: constants
 * [POS]: Core API client, used by all MCP tools
 */

import { z } from 'zod';
import { DEFAULT_API_URL, DEFAULT_USER_ID } from './constants';

// ============ Response Schemas ============

const IdResponseSchema = z.object({
  id: z.string(),
});

const MemoryItemSchema = z.object({
  id: z.string(),
  content: z.string(),
  score: z.number().optional(),
  metadata: z.record(z.unknown()).optional(),
});

const SearchResultSchema = z.object({
  items: z.array(MemoryItemSchema),
  took: z.number(),
});

const EntityItemSchema = z.object({
  id: z.string(),
  type: z.string(),
  name: z.string(),
  score: z.number().optional(),
  properties: z.record(z.unknown()).optional(),
});

const RelationItemSchema = z.object({
  id: z.string(),
  sourceId: z.string(),
  targetId: z.string(),
  type: z.string(),
});

const TraverseNodeSchema = z.object({
  entity: z.object({
    id: z.string(),
    type: z.string(),
    name: z.string(),
  }),
  depth: z.number(),
});

const TraverseResultSchema = z.object({
  nodes: z.array(TraverseNodeSchema),
  subGraph: z.object({
    entities: z.array(z.object({
      id: z.string(),
      type: z.string(),
      name: z.string(),
    })),
    relations: z.array(z.object({
      sourceId: z.string(),
      targetId: z.string(),
      type: z.string(),
    })),
  }),
});

// ============ Types ============

interface ApiResponse<T> {
  ok: boolean;
  data?: T;
  error?: string;
}

export interface MemoryApiClientConfig {
  apiUrl?: string;
  userId?: string;
}

// ============ Client ============

export class MemoryApiClient {
  private readonly baseUrl: string;
  private readonly userId: string;

  constructor(config?: MemoryApiClientConfig) {
    this.baseUrl = config?.apiUrl ?? process.env.MEMORY_API_URL ?? DEFAULT_API_URL;
    this.userId = config?.userId ?? process.env.MEMORY_USER_ID ?? DEFAULT_USER_ID;
  }

  private async request<T>(
    method: string,
    path: string,
    schema?: z.ZodType<T>,
    body?: unknown,
    queryParams?: Record<string, string>,
  ): Promise<ApiResponse<T>> {
    try {
      let url = `${this.baseUrl}${path}`;

      if (queryParams) {
        const params = new URLSearchParams(queryParams);
        url += `?${params.toString()}`;
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!response.ok) {
        const errorText = await response.text();
        return { ok: false, error: `HTTP ${response.status}: ${errorText}` };
      }

      // Handle empty responses
      const text = await response.text();
      if (!text) {
        return { ok: true, data: undefined };
      }

      const json: unknown = JSON.parse(text);

      // Validate response if schema provided
      if (schema) {
        const parsed = schema.safeParse(json);
        if (!parsed.success) {
          return { ok: false, error: `Invalid response: ${parsed.error.message}` };
        }
        return { ok: true, data: parsed.data };
      }

      return { ok: true, data: json as T };
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  // ============ Memory Operations ============

  async addMemory(content: string, options?: {
    source?: string;
    tags?: string[];
    importance?: number;
  }) {
    return this.request('POST', '/memories', IdResponseSchema, {
      content,
      metadata: {
        userId: this.userId,
        source: options?.source ?? 'conversation',
        tags: options?.tags ?? [],
        importance: options?.importance ?? 0.5,
      },
    });
  }

  async searchMemories(query: string, options?: {
    limit?: number;
    threshold?: number;
  }) {
    return this.request('POST', '/memories/search', SearchResultSchema, {
      query,
      userId: this.userId,
      limit: options?.limit ?? 10,
      threshold: options?.threshold ?? 0.7,
    });
  }

  async listMemories(options?: { limit?: number; offset?: number }) {
    return this.request('GET', '/memories', z.array(MemoryItemSchema), undefined, {
      userId: this.userId,
      ...(options?.limit && { limit: String(options.limit) }),
      ...(options?.offset && { offset: String(options.offset) }),
    });
  }

  async deleteMemory(id: string) {
    return this.request<void>('DELETE', `/memories/${id}`, undefined, undefined, {
      userId: this.userId,
    });
  }

  // ============ Entity Operations ============

  async createEntity(entity: {
    type: string;
    name: string;
    properties?: Record<string, unknown>;
  }) {
    return this.request('POST', '/entities', IdResponseSchema, {
      ...entity,
      userId: this.userId,
    });
  }

  async searchEntities(query: string, options?: {
    type?: string;
    limit?: number;
  }) {
    return this.request('POST', '/entities/search', z.array(EntityItemSchema), {
      query,
      userId: this.userId,
      ...options,
    });
  }

  async listEntities(options?: { type?: string; limit?: number }) {
    return this.request('GET', '/entities', z.array(EntityItemSchema), undefined, {
      userId: this.userId,
      ...(options?.type && { type: options.type }),
      ...(options?.limit && { limit: String(options.limit) }),
    });
  }

  // ============ Relation Operations ============

  async createRelation(relation: {
    sourceId: string;
    targetId: string;
    type: string;
    properties?: Record<string, unknown>;
  }) {
    return this.request('POST', '/relations', IdResponseSchema, {
      ...relation,
      userId: this.userId,
    });
  }

  async listRelations(options?: { entityId?: string; type?: string }) {
    return this.request('GET', '/relations', z.array(RelationItemSchema), undefined, {
      userId: this.userId,
      ...(options?.entityId && { entityId: options.entityId }),
      ...(options?.type && { type: options.type }),
    });
  }

  // ============ Graph Operations ============

  async traverseGraph(entityId: string, options?: {
    depth?: number;
    direction?: 'outgoing' | 'incoming' | 'both';
  }) {
    return this.request('POST', '/graph/traverse', TraverseResultSchema, {
      entityId,
      userId: this.userId,
      ...options,
    });
  }

  async findPath(sourceId: string, targetId: string, maxDepth?: number) {
    return this.request('POST', '/graph/path', z.array(TraverseNodeSchema), {
      sourceId,
      targetId,
      userId: this.userId,
      maxDepth,
    });
  }
}
