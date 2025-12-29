import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { MemoryApiClient } from '../client';

export function registerEntityTools(server: McpServer, client: MemoryApiClient) {
  // Create entity
  server.tool(
    'entity_create',
    'Create a new entity in the knowledge graph. Use this to add people, organizations, concepts, etc.',
    {
      type: z
        .enum(['person', 'organization', 'location', 'concept', 'event', 'custom'])
        .describe('Type of entity'),
      name: z.string().describe('Name of the entity'),
      properties: z
        .record(z.string(), z.unknown())
        .optional()
        .describe('Additional properties'),
    },
    async ({ type, name, properties }) => {
      const result = await client.createEntity({ type, name, properties });

      if (!result.ok) {
        return {
          content: [{ type: 'text', text: `Error: ${result.error}` }],
          isError: true,
        };
      }

      return {
        content: [
          { type: 'text', text: `Entity "${name}" (${type}) created. ID: ${result.data?.id}` },
        ],
      };
    },
  );

  // Search entities
  server.tool(
    'entity_search',
    'Search for entities by name or semantic similarity.',
    {
      query: z.string().describe('Search query'),
      type: z
        .enum(['person', 'organization', 'location', 'concept', 'event', 'custom'])
        .optional()
        .describe('Filter by entity type'),
      limit: z.number().min(1).max(50).optional().describe('Maximum results'),
    },
    async ({ query, type, limit }) => {
      const result = await client.searchEntities(query, { type, limit });

      if (!result.ok) {
        return {
          content: [{ type: 'text', text: `Error: ${result.error}` }],
          isError: true,
        };
      }

      const data = result.data;
      if (!data || data.length === 0) {
        return {
          content: [{ type: 'text', text: 'No entities found.' }],
        };
      }

      const entities = data
        .map((e, i) => `${i + 1}. [${e.type}] ${e.name} (score: ${e.score.toFixed(3)})`)
        .join('\n');

      return {
        content: [{ type: 'text', text: `Found entities:\n\n${entities}` }],
      };
    },
  );

  // List entities
  server.tool(
    'entity_list',
    'List all entities in the knowledge graph.',
    {
      type: z
        .enum(['person', 'organization', 'location', 'concept', 'event', 'custom'])
        .optional()
        .describe('Filter by entity type'),
      limit: z.number().min(1).max(100).optional().describe('Maximum results'),
    },
    async ({ type, limit }) => {
      const result = await client.listEntities({ type, limit });

      if (!result.ok) {
        return {
          content: [{ type: 'text', text: `Error: ${result.error}` }],
          isError: true,
        };
      }

      const data = result.data;
      if (!data || data.length === 0) {
        return {
          content: [{ type: 'text', text: 'No entities in knowledge graph.' }],
        };
      }

      const entities = data
        .map((e, i) => `${i + 1}. [${e.type}] ${e.name}`)
        .join('\n');

      return {
        content: [{ type: 'text', text: `Entities:\n\n${entities}` }],
      };
    },
  );

  // Create relation
  server.tool(
    'relation_create',
    'Create a relationship between two entities.',
    {
      sourceId: z.string().describe('ID of the source entity'),
      targetId: z.string().describe('ID of the target entity'),
      type: z.string().describe('Type of relationship (e.g., works_at, knows, part_of)'),
      properties: z
        .record(z.string(), z.unknown())
        .optional()
        .describe('Additional properties'),
    },
    async ({ sourceId, targetId, type, properties }) => {
      const result = await client.createRelation({ sourceId, targetId, type, properties });

      if (!result.ok) {
        return {
          content: [{ type: 'text', text: `Error: ${result.error}` }],
          isError: true,
        };
      }

      return {
        content: [
          { type: 'text', text: `Relation "${type}" created. ID: ${result.data?.id}` },
        ],
      };
    },
  );

  // List relations
  server.tool(
    'relation_list',
    'List relationships, optionally filtered by entity or type.',
    {
      entityId: z.string().optional().describe('Filter by entity ID'),
      type: z.string().optional().describe('Filter by relation type'),
    },
    async ({ entityId, type }) => {
      const result = await client.listRelations({ entityId, type });

      if (!result.ok) {
        return {
          content: [{ type: 'text', text: `Error: ${result.error}` }],
          isError: true,
        };
      }

      const data = result.data;
      if (!data || data.length === 0) {
        return {
          content: [{ type: 'text', text: 'No relations found.' }],
        };
      }

      const relations = data
        .map((r, i) => `${i + 1}. ${r.sourceId.slice(0, 8)} --[${r.type}]--> ${r.targetId.slice(0, 8)}`)
        .join('\n');

      return {
        content: [{ type: 'text', text: `Relations:\n\n${relations}` }],
      };
    },
  );
}
