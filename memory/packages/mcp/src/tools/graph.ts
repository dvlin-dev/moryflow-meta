import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { MemoryApiClient } from '../client.js';

export function registerGraphTools(server: McpServer, client: MemoryApiClient) {
  // Traverse graph
  server.tool(
    'graph_traverse',
    'Traverse the knowledge graph starting from an entity. Use this to explore relationships.',
    {
      entityId: z.string().describe('Starting entity ID'),
      depth: z.number().min(1).max(5).optional().describe('Maximum traversal depth'),
      direction: z
        .enum(['outgoing', 'incoming', 'both'])
        .optional()
        .describe('Direction to traverse'),
    },
    async ({ entityId, depth, direction }) => {
      const result = await client.traverseGraph(entityId, { depth, direction });

      if (!result.ok) {
        return {
          content: [{ type: 'text', text: `Error: ${result.error}` }],
          isError: true,
        };
      }

      const data = result.data;
      if (!data || data.nodes.length === 0) {
        return {
          content: [{ type: 'text', text: 'No connected entities found.' }],
        };
      }

      // Format the subgraph
      const nodes = data.nodes
        .map((n) => `  [Depth ${n.depth}] ${n.entity.name} (${n.entity.type})`)
        .join('\n');

      const edges = data.subGraph.relations
        .map((r) => {
          const source = data.subGraph.entities.find((e) => e.id === r.sourceId);
          const target = data.subGraph.entities.find((e) => e.id === r.targetId);
          return `  ${source?.name ?? '?'} --[${r.type}]--> ${target?.name ?? '?'}`;
        })
        .join('\n');

      return {
        content: [
          {
            type: 'text',
            text: `Graph traversal result:\n\nNodes:\n${nodes}\n\nRelations:\n${edges || '  (none)'}`,
          },
        ],
      };
    },
  );

  // Find path
  server.tool(
    'graph_find_path',
    'Find the shortest path between two entities in the knowledge graph.',
    {
      sourceId: z.string().describe('Starting entity ID'),
      targetId: z.string().describe('Target entity ID'),
      maxDepth: z.number().min(1).max(10).optional().describe('Maximum path length'),
    },
    async ({ sourceId, targetId, maxDepth }) => {
      const result = await client.findPath(sourceId, targetId, maxDepth);

      if (!result.ok) {
        return {
          content: [{ type: 'text', text: `Error: ${result.error}` }],
          isError: true,
        };
      }

      const data = result.data;
      if (!data || data.length === 0) {
        return {
          content: [{ type: 'text', text: 'No path found between the entities.' }],
        };
      }

      const path = data
        .map((n, i) => `${i + 1}. ${n.entity.name} (${n.entity.type})`)
        .join(' → ');

      return {
        content: [
          { type: 'text', text: `Path found (${data.length} hops):\n\n${path}` },
        ],
      };
    },
  );
}
