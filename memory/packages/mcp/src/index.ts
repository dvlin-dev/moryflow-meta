#!/usr/bin/env node
/**
 * MCP Server entry point (stdio transport)
 *
 * [POS]: CLI entry point, only handles startup/shutdown
 */

import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createMemoryMcpServer } from './server';

// Re-export for library usage
export { createMemoryMcpServer } from './server';
export type { MemoryMcpServerConfig, MemoryMcpServer } from './server';
export { MemoryApiClient } from './client';
export * from './constants';

async function main() {
  const { server } = createMemoryMcpServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Moryflow Memory MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Failed to start MCP server:', error);
  process.exit(1);
});
