/**
 * MCP Server factory and configuration
 *
 * [PROVIDES]: createMemoryMcpServer - Factory function to create configured MCP server
 * [DEPENDS]: @modelcontextprotocol/sdk, ./client, ./tools/*
 * [POS]: Core server module, reusable for different transports
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { MemoryApiClient } from './client';
import { registerMemoryTools } from './tools/memory';
import { registerEntityTools } from './tools/entity';
import { registerGraphTools } from './tools/graph';
import { SERVER_NAME, SERVER_VERSION } from './constants';

export interface MemoryMcpServerConfig {
  apiUrl?: string;
  userId?: string;
}

export interface MemoryMcpServer {
  server: McpServer;
  client: MemoryApiClient;
}

/**
 * Create and configure a Memory MCP server instance
 */
export function createMemoryMcpServer(config?: MemoryMcpServerConfig): MemoryMcpServer {
  const server = new McpServer({
    name: SERVER_NAME,
    version: SERVER_VERSION,
  });

  const client = new MemoryApiClient({
    apiUrl: config?.apiUrl,
    userId: config?.userId,
  });

  // Register all tools
  registerMemoryTools(server, client);
  registerEntityTools(server, client);
  registerGraphTools(server, client);

  // Add server info resource
  server.resource('server-info', 'moryflow://info', async () => ({
    contents: [
      {
        uri: 'moryflow://info',
        mimeType: 'text/plain',
        text: `Moryflow Memory MCP Server v${SERVER_VERSION}

Connected to: ${config?.apiUrl ?? process.env.MEMORY_API_URL ?? 'http://localhost:8765'}
User ID: ${config?.userId ?? process.env.MEMORY_USER_ID ?? 'default'}

Available tools:
- memory_add: Add a new memory
- memory_search: Search memories by semantic similarity
- memory_list: List stored memories
- memory_delete: Delete a memory

- entity_create: Create an entity
- entity_search: Search entities
- entity_list: List entities
- relation_create: Create a relationship
- relation_list: List relationships

- graph_traverse: Traverse the knowledge graph
- graph_find_path: Find path between entities
`,
      },
    ],
  }));

  return { server, client };
}
