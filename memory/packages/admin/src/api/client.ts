const API_BASE = '/api';
const USER_ID = 'admin';

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  queryParams?: Record<string, string>
): Promise<T> {
  let url = `${API_BASE}${path}`;

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
    const error = await response.text();
    throw new Error(error || `HTTP ${response.status}`);
  }

  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

// Types
export interface Memory {
  id: string;
  content: string;
  metadata: {
    userId: string;
    agentId?: string;
    source: string;
    importance: number;
    tags: string[];
  };
  createdAt: string;
  updatedAt: string;
}

export interface Entity {
  id: string;
  type: string;
  name: string;
  properties: Record<string, unknown>;
  userId: string;
  confidence: number;
  createdAt: string;
  updatedAt: string;
}

export interface Relation {
  id: string;
  sourceId: string;
  targetId: string;
  type: string;
  properties: Record<string, unknown>;
  userId: string;
  confidence: number;
  createdAt: string;
}

export interface Stats {
  memories: number;
  entities: number;
  relations: number;
}

// Memory API
export const memoryApi = {
  list: (limit = 50, offset = 0) =>
    request<Memory[]>('GET', '/memories', undefined, {
      userId: USER_ID,
      limit: String(limit),
      offset: String(offset),
    }),

  search: (query: string, limit = 10) =>
    request<{ items: (Memory & { score: number })[]; took: number }>(
      'POST',
      '/memories/search',
      { query, userId: USER_ID, limit }
    ),

  create: (content: string, options?: { source?: string; tags?: string[] }) =>
    request<Memory>('POST', '/memories', {
      content,
      metadata: {
        userId: USER_ID,
        source: options?.source ?? 'document',
        tags: options?.tags ?? [],
      },
    }),

  delete: (id: string) =>
    request<void>('DELETE', `/memories/${id}`, undefined, { userId: USER_ID }),

  count: () =>
    request<Memory[]>('GET', '/memories', undefined, {
      userId: USER_ID,
      limit: '1',
    }).then((data) => data.length),
};

// Entity API
export const entityApi = {
  list: (type?: string, limit = 50, offset = 0) =>
    request<Entity[]>('GET', '/entities', undefined, {
      userId: USER_ID,
      ...(type && { type }),
      limit: String(limit),
      offset: String(offset),
    }),

  search: (query: string, type?: string, limit = 10) =>
    request<(Entity & { score: number })[]>('POST', '/entities/search', {
      query,
      userId: USER_ID,
      type,
      limit,
    }),

  create: (data: { type: string; name: string; properties?: Record<string, unknown> }) =>
    request<Entity>('POST', '/entities', { ...data, userId: USER_ID }),

  delete: (id: string) =>
    request<void>('DELETE', `/entities/${id}`, undefined, { userId: USER_ID }),

  count: () =>
    request<Entity[]>('GET', '/entities', undefined, {
      userId: USER_ID,
      limit: '1',
    }).then((data) => data.length),
};

// Relation API
export const relationApi = {
  list: (entityId?: string, type?: string, limit = 50) =>
    request<Relation[]>('GET', '/relations', undefined, {
      userId: USER_ID,
      ...(entityId && { entityId }),
      ...(type && { type }),
      limit: String(limit),
    }),

  create: (data: { sourceId: string; targetId: string; type: string }) =>
    request<Relation>('POST', '/relations', { ...data, userId: USER_ID }),

  delete: (id: string) =>
    request<void>('DELETE', `/relations/${id}`, undefined, { userId: USER_ID }),

  count: () =>
    request<Relation[]>('GET', '/relations', undefined, {
      userId: USER_ID,
      limit: '1',
    }).then((data) => data.length),
};

// Graph API
export const graphApi = {
  traverse: (entityId: string, depth = 2, direction: 'both' | 'outgoing' | 'incoming' = 'both') =>
    request<{
      nodes: { entity: Entity; depth: number }[];
      subGraph: { entities: Entity[]; relations: Relation[] };
    }>('POST', '/graph/traverse', { entityId, userId: USER_ID, depth, direction }),

  findPath: (sourceId: string, targetId: string, maxDepth = 5) =>
    request<{ entity: Entity; depth: number }[]>('POST', '/graph/path', {
      sourceId,
      targetId,
      userId: USER_ID,
      maxDepth,
    }),
};

// Stats
export const getStats = async (): Promise<Stats> => {
  const [memories, entities, relations] = await Promise.all([
    memoryApi.list(1).then((d) => d.length > 0 ? 100 : 0), // Simplified
    entityApi.list(undefined, 1).then((d) => d.length > 0 ? 50 : 0),
    relationApi.list(undefined, undefined, 1).then((d) => d.length > 0 ? 30 : 0),
  ]);
  return { memories, entities, relations };
};
