/**
 * HTTP client for Memory API
 */

const DEFAULT_API_URL = 'http://localhost:8765';

interface ApiResponse<T> {
  ok: boolean;
  data?: T;
  error?: string;
}

export class MemoryApiClient {
  private baseUrl: string;
  private userId: string;

  constructor(config?: { apiUrl?: string; userId?: string }) {
    this.baseUrl = config?.apiUrl ?? process.env.MEMORY_API_URL ?? DEFAULT_API_URL;
    this.userId = config?.userId ?? process.env.MEMORY_USER_ID ?? 'default';
  }

  private async request<T>(
    method: string,
    path: string,
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

      const data = JSON.parse(text) as T;
      return { ok: true, data };
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
    return this.request<{ id: string }>('POST', '/memories', {
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
    return this.request<{
      items: Array<{
        id: string;
        content: string;
        score: number;
        metadata: Record<string, unknown>;
      }>;
      took: number;
    }>('POST', '/memories/search', {
      query,
      userId: this.userId,
      limit: options?.limit ?? 10,
      threshold: options?.threshold ?? 0.7,
    });
  }

  async listMemories(options?: { limit?: number; offset?: number }) {
    return this.request<Array<{
      id: string;
      content: string;
      metadata: Record<string, unknown>;
    }>>('GET', '/memories', undefined, {
      userId: this.userId,
      ...(options?.limit && { limit: String(options.limit) }),
      ...(options?.offset && { offset: String(options.offset) }),
    });
  }

  async deleteMemory(id: string) {
    return this.request<void>('DELETE', `/memories/${id}`, undefined, {
      userId: this.userId,
    });
  }

  // ============ Entity Operations ============

  async createEntity(entity: {
    type: string;
    name: string;
    properties?: Record<string, unknown>;
  }) {
    return this.request<{ id: string }>('POST', '/entities', {
      ...entity,
      userId: this.userId,
    });
  }

  async searchEntities(query: string, options?: {
    type?: string;
    limit?: number;
  }) {
    return this.request<Array<{
      id: string;
      type: string;
      name: string;
      score: number;
    }>>('POST', '/entities/search', {
      query,
      userId: this.userId,
      ...options,
    });
  }

  async listEntities(options?: { type?: string; limit?: number }) {
    return this.request<Array<{
      id: string;
      type: string;
      name: string;
      properties: Record<string, unknown>;
    }>>('GET', '/entities', undefined, {
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
    return this.request<{ id: string }>('POST', '/relations', {
      ...relation,
      userId: this.userId,
    });
  }

  async listRelations(options?: { entityId?: string; type?: string }) {
    return this.request<Array<{
      id: string;
      sourceId: string;
      targetId: string;
      type: string;
    }>>('GET', '/relations', undefined, {
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
    return this.request<{
      nodes: Array<{
        entity: { id: string; type: string; name: string };
        depth: number;
      }>;
      subGraph: {
        entities: Array<{ id: string; type: string; name: string }>;
        relations: Array<{ sourceId: string; targetId: string; type: string }>;
      };
    }>('POST', '/graph/traverse', {
      entityId,
      userId: this.userId,
      ...options,
    });
  }

  async findPath(sourceId: string, targetId: string, maxDepth?: number) {
    return this.request<Array<{
      entity: { id: string; type: string; name: string };
      depth: number;
    }>>('POST', '/graph/path', {
      sourceId,
      targetId,
      userId: this.userId,
      maxDepth,
    });
  }
}
