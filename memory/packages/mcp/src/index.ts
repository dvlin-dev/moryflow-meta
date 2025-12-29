import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { MemoryApiClient } from './client.js';
import { registerMemoryTools } from './tools/memory.js';
import { registerEntityTools } from './tools/entity.js';
import { registerGraphTools } from './tools/graph.js';

// Create MCP server
const server = new McpServer({
  name: 'moryflow-memory',
  version: '0.1.0',
});

// Create API client
const client = new MemoryApiClient({
  apiUrl: process.env.MEMORY_API_URL,
  userId: process.env.MEMORY_USER_ID,
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
      text: `Moryflow Memory MCP Server v0.1.0

Connected to: ${process.env.MEMORY_API_URL ?? 'http://localhost:8765'}
User ID: ${process.env.MEMORY_USER_ID ?? 'default'}

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

// Start server with stdio transport
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Moryflow Memory MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Failed to start MCP server:', error);
  process.exit(1);
});
