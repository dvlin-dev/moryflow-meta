/**
 * MCP Server constants
 *
 * [PROVIDES]: Server metadata and tool name constants
 * [USED_BY]: server.ts, tools/*.ts
 */

// Server metadata
export const SERVER_NAME = 'moryflow-memory';
export const SERVER_VERSION = '0.1.0';

// Default configuration
export const DEFAULT_API_URL = 'http://localhost:8765';
export const DEFAULT_USER_ID = 'default';

// Memory tool names
export const TOOL_MEMORY_ADD = 'memory_add';
export const TOOL_MEMORY_SEARCH = 'memory_search';
export const TOOL_MEMORY_LIST = 'memory_list';
export const TOOL_MEMORY_DELETE = 'memory_delete';

// Entity tool names
export const TOOL_ENTITY_CREATE = 'entity_create';
export const TOOL_ENTITY_SEARCH = 'entity_search';
export const TOOL_ENTITY_LIST = 'entity_list';
export const TOOL_RELATION_CREATE = 'relation_create';
export const TOOL_RELATION_LIST = 'relation_list';

// Graph tool names
export const TOOL_GRAPH_TRAVERSE = 'graph_traverse';
export const TOOL_GRAPH_FIND_PATH = 'graph_find_path';
