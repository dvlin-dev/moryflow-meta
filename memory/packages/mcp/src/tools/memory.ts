/**
 * Memory-related MCP tools
 *
 * [PROVIDES]: registerMemoryTools - Register memory CRUD tools
 * [DEPENDS]: @modelcontextprotocol/sdk, ../client, ../constants
 */

import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { MemoryApiClient } from '../client';
import {
  TOOL_MEMORY_ADD,
  TOOL_MEMORY_SEARCH,
  TOOL_MEMORY_LIST,
  TOOL_MEMORY_DELETE,
} from '../constants';

export function registerMemoryTools(server: McpServer, client: MemoryApiClient) {
  // Add memory
  server.tool(
    TOOL_MEMORY_ADD,
    'Add a new memory to the memory store. Use this to remember important information from conversations.',
    {
      content: z.string().describe('The content to remember'),
      source: z
        .enum(['conversation', 'document', 'extraction'])
        .optional()
        .describe('Source of the memory'),
      tags: z.array(z.string()).optional().describe('Tags for categorization'),
      importance: z
        .number()
        .min(0)
        .max(1)
        .optional()
        .describe('Importance score (0-1)'),
    },
    async ({ content, source, tags, importance }) => {
      const result = await client.addMemory(content, { source, tags, importance });

      if (!result.ok) {
        return {
          content: [{ type: 'text', text: `Error: ${result.error}` }],
          isError: true,
        };
      }

      return {
        content: [
          { type: 'text', text: `Memory added successfully. ID: ${result.data?.id}` },
        ],
      };
    },
  );

  // Search memories
  server.tool(
    TOOL_MEMORY_SEARCH,
    'Search for relevant memories using semantic similarity. Use this to recall past conversations or information.',
    {
      query: z.string().describe('Search query'),
      limit: z.number().min(1).max(50).optional().describe('Maximum results to return'),
      threshold: z
        .number()
        .min(0)
        .max(1)
        .optional()
        .describe('Minimum similarity threshold (0-1)'),
    },
    async ({ query, limit, threshold }) => {
      const result = await client.searchMemories(query, { limit, threshold });

      if (!result.ok) {
        return {
          content: [{ type: 'text', text: `Error: ${result.error}` }],
          isError: true,
        };
      }

      const data = result.data;
      if (!data || data.items.length === 0) {
        return {
          content: [{ type: 'text', text: 'No memories found matching your query.' }],
        };
      }

      const memories = data.items
        .map((m, i) => `${i + 1}. [Score: ${m.score?.toFixed(3) ?? 'N/A'}] ${m.content}`)
        .join('\n\n');

      return {
        content: [
          {
            type: 'text',
            text: `Found ${data.items.length} memories (${data.took}ms):\n\n${memories}`,
          },
        ],
      };
    },
  );

  // List memories
  server.tool(
    TOOL_MEMORY_LIST,
    'List recent memories. Use this to see what has been stored.',
    {
      limit: z.number().min(1).max(100).optional().describe('Maximum results'),
      offset: z.number().min(0).optional().describe('Offset for pagination'),
    },
    async ({ limit, offset }) => {
      const result = await client.listMemories({ limit, offset });

      if (!result.ok) {
        return {
          content: [{ type: 'text', text: `Error: ${result.error}` }],
          isError: true,
        };
      }

      const data = result.data;
      if (!data || data.length === 0) {
        return {
          content: [{ type: 'text', text: 'No memories stored yet.' }],
        };
      }

      const memories = data
        .map((m, i) => `${i + 1}. [${m.id.slice(0, 8)}] ${m.content.slice(0, 100)}...`)
        .join('\n');

      return {
        content: [{ type: 'text', text: `Stored memories:\n\n${memories}` }],
      };
    },
  );

  // Delete memory
  server.tool(
    TOOL_MEMORY_DELETE,
    'Delete a specific memory by its ID.',
    {
      id: z.string().describe('The ID of the memory to delete'),
    },
    async ({ id }) => {
      const result = await client.deleteMemory(id);

      if (!result.ok) {
        return {
          content: [{ type: 'text', text: `Error: ${result.error}` }],
          isError: true,
        };
      }

      return {
        content: [{ type: 'text', text: `Memory ${id} deleted successfully.` }],
      };
    },
  );
}
