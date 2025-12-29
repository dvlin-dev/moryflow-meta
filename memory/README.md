# Moryflow AI Memory Module

> A PostgreSQL-based AI Agent memory layer with vector retrieval and knowledge graph support.

## Features

- **Vector Memory**: Semantic similarity search using pgvector (1024-dim embeddings)
- **Knowledge Graph**: Entity-relationship storage with recursive CTE traversal
- **Entity Extraction**: LLM-powered entity and relation extraction from text
- **Multi-tenant**: Memory isolation by userId/agentId
- **MCP Server**: Model Context Protocol server for Claude and other AI integration
- **REST API**: Full CRUD operations with Swagger documentation

## Quick Start

### Prerequisites

- Node.js >= 22
- pnpm >= 9
- Docker & Docker Compose

### 1. Start Database

```bash
cd docker
cp .env.example .env
# Edit .env with your API keys
docker-compose up -d memory-db
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Generate Prisma Client

```bash
pnpm db:generate
```

### 4. Run Migrations

```bash
# Create .env in packages/server
cp packages/server/.env.example packages/server/.env
# Edit with your database URL and API keys

pnpm db:push
```

### 5. Create Vector Indexes

```bash
# Connect to PostgreSQL and run:
docker exec -it memory-postgres psql -U memory -d memory
SELECT create_vector_indexes();
```

### 6. Start Server

```bash
pnpm dev
```

Server runs at `http://localhost:8765`
Swagger docs at `http://localhost:8765/api`

## API Endpoints

### Memory Operations

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/memories` | Add a new memory |
| POST | `/memories/search` | Search memories by semantic similarity |
| GET | `/memories` | List memories |
| GET | `/memories/:id` | Get memory by ID |
| DELETE | `/memories/:id` | Delete memory |

### Entity Operations

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/entities` | Create entity |
| POST | `/entities/search` | Search entities |
| GET | `/entities` | List entities |
| GET | `/entities/:id` | Get entity by ID |
| PUT | `/entities/:id` | Update entity |
| DELETE | `/entities/:id` | Delete entity |

### Relation Operations

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/relations` | Create relation |
| GET | `/relations` | List relations |
| DELETE | `/relations/:id` | Delete relation |

### Graph Operations

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/graph/traverse` | Traverse graph from entity |
| POST | `/graph/path` | Find shortest path |
| POST | `/graph/subgraph` | Get subgraph |
| GET | `/graph/neighbors/:id` | Get entity neighbors |

## MCP Server

The MCP server allows Claude and other AI assistants to directly interact with the memory system.

### Configuration

Add to your Claude Desktop config (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "moryflow-memory": {
      "command": "npx",
      "args": ["@moryflow/memory-mcp"],
      "env": {
        "MEMORY_API_URL": "http://localhost:8765",
        "MEMORY_USER_ID": "default"
      }
    }
  }
}
```

### Available Tools

| Tool | Description |
|------|-------------|
| `memory_add` | Add a new memory |
| `memory_search` | Search memories by similarity |
| `memory_list` | List stored memories |
| `memory_delete` | Delete a memory |
| `entity_create` | Create an entity |
| `entity_search` | Search entities |
| `entity_list` | List entities |
| `relation_create` | Create a relation |
| `relation_list` | List relations |
| `graph_traverse` | Traverse the knowledge graph |
| `graph_find_path` | Find path between entities |

## Admin UI

A web-based admin dashboard for managing memories, entities, relations, and visualizing the knowledge graph.

### Features

- **Dashboard**: Overview with statistics on memories, entities, and relations
- **Memory Management**: Add, search, and delete memories
- **Entity Management**: CRUD operations for entities with type filtering
- **Relation Management**: Create and manage entity relationships
- **Graph Viewer**: Interactive force-directed graph visualization with traversal

### Running the Admin UI

```bash
# Development mode
cd packages/admin
pnpm dev
# Open http://localhost:5173

# Production (Docker)
docker-compose up -d memory-admin
# Open http://localhost:8080
```

### Tech Stack

- React 18 + TypeScript
- TailwindCSS + Vite
- TanStack Query for data fetching
- react-force-graph-2d for visualization

## CI/CD

GitHub Actions workflow is configured for:

- **Lint & Test**: Runs ESLint and Vitest on every push/PR
- **Build**: Builds all packages
- **Docker**: Builds Docker images on main branch pushes

Workflow triggers on changes to `memory/**` paths.

## Project Structure

```
memory/
├── packages/
│   ├── core/           # Types, schemas, errors
│   ├── server/         # NestJS API server
│   │   ├── src/
│   │   │   ├── memory/     # Memory CRUD + vector search
│   │   │   ├── entity/     # Entity management
│   │   │   ├── relation/   # Relation management
│   │   │   ├── graph/      # Graph traversal
│   │   │   ├── extract/    # LLM extraction
│   │   │   └── llm/        # LLM adapter
│   │   └── prisma/
│   ├── mcp/            # MCP Server
│   └── admin/          # Admin UI (React + TailwindCSS)
├── docker/             # Docker configuration
└── examples/           # Usage examples
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | - |
| `EMBEDDING_API_KEY` | Aliyun DashScope API key | - |
| `EMBEDDING_BASE_URL` | Embedding API base URL | `https://dashscope.aliyuncs.com/compatible-mode/v1` |
| `EMBEDDING_MODEL` | Embedding model name | `text-embedding-v4` |
| `LLM_API_KEY` | OpenAI API key (for extraction) | - |
| `LLM_MODEL` | LLM model name | `gpt-4o-mini` |
| `PORT` | Server port | `3000` |

## Technology Stack

- **Runtime**: Node.js 22
- **Framework**: NestJS 11 + Fastify
- **ORM**: Prisma 7 (with driver adapters)
- **Database**: PostgreSQL 16 + pgvector 0.8
- **Validation**: Zod 3
- **Embedding**: Aliyun text-embedding-v4 (OpenAI compatible)
- **MCP**: Model Context Protocol SDK

## License

Apache-2.0
