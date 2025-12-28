# Moryflow Memory

> This is the AI Agent guideline for the Memory module. Follows [agents.md spec](https://agents.md/).

## 🔄 Core Sync Protocol (Mandatory)

1. **Atomic Updates**: After any code change, update the related AGENTS.md files
2. **Recursive Trigger**: File change → Update file header → Update directory AGENTS.md → (if global impact) Update root AGENTS.md
3. **Fractal Autonomy**: Each sub-directory's AGENTS.md should enable AI to understand that module independently
4. **No Legacy Baggage**: No backward compatibility hacks, delete/refactor unused code, no deprecated comments

## 📁 Project Structure

```
memory/
├── packages/
│   ├── core/           # Core abstractions and types
│   │   ├── src/
│   │   │   ├── schemas/   # Zod validation schemas
│   │   │   ├── types.ts   # TypeScript type definitions
│   │   │   ├── errors.ts  # Error types and Result<T>
│   │   │   └── index.ts   # Public API exports
│   │   └── package.json
│   │
│   ├── server/         # NestJS API server
│   │   ├── src/
│   │   │   ├── memory/    # Memory CRUD operations
│   │   │   ├── entity/    # Entity management
│   │   │   ├── relation/  # Relation management
│   │   │   ├── embedding/ # Vector embedding service
│   │   │   ├── extract/   # LLM entity/relation extraction
│   │   │   ├── llm/       # LLM adapter interfaces
│   │   │   └── app.module.ts
│   │   ├── prisma/
│   │   │   └── schema.prisma
│   │   └── package.json
│   │
│   ├── mcp/            # MCP Server for Claude integration
│   │   ├── src/
│   │   │   ├── server.ts  # MCP server entry
│   │   │   ├── tools/     # MCP tool definitions
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   └── admin/          # Admin dashboard (Vite + React)
│       ├── src/
│       │   ├── pages/     # Route pages
│       │   ├── components/
│       │   └── api/       # API client
│       └── package.json
│
├── docker/             # Docker configuration
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── init.sql
│
├── examples/           # Usage examples
├── package.json        # Root package
├── pnpm-workspace.yaml
└── README.md
```

### Tech Stack

| Layer | Technology |
|-------|------------|
| API Server | NestJS 11 + Prisma 7 + Zod 4 |
| Database | PostgreSQL 16 + pgvector |
| Embedding | Alibaba text-embedding-v4 (1024 dim) |
| LLM | OpenAI gpt-4.1-mini (configurable) |
| MCP | @modelcontextprotocol/sdk |
| Admin UI | Vite 7 + React 19 + Tailwind 4 |
| Package Manager | pnpm workspace |

## 📚 Documentation

- **Design Document**: → [`docs/ai-memory-module-design.md`](../docs/ai-memory-module-design.md)
- **API Reference**: → `packages/server/README.md` (TBD)
- **MCP Tools**: → `packages/mcp/README.md` (TBD)

## 🤝 Collaboration Guidelines

- **Language**: All code, comments, messages, and documentation in English (for open-source)
- **Research First**: Don't guess implementations, search and verify existing code
- **No Business Assumptions**: Confirm product/data semantics with stakeholders
- **Reuse First**: Prefer existing interfaces, types, and utilities

## 📝 Workflow

1. **Plan**: Before changes, provide a minimal scope plan with motivation and risks
2. **Implement**: Focus on a single issue, no blind modifications
3. **Verify**: Run lint/typecheck locally before committing
4. **Sync**: Update related AGENTS.md (mandatory)
5. **Progress Tracking**: After completing each step, update progress in the design document

### Progress Tracking Convention

After completing each execution phase or step, update the corresponding checklist in `docs/ai-memory-module-design.md`:

```markdown
### Phase 3: Vector Storage Implementation

**Acceptance Criteria**:
- [x] Insert 1000 records < 5s  ← Mark as completed
- [x] Search P99 < 100ms
- [ ] Test coverage > 80%      ← Still pending
```

This ensures:
- Clear visibility of what's done vs pending
- Easy handoff between sessions
- Historical record of implementation progress

## 📄 File Header Convention

Key files should have a header comment. Choose format based on file type:

| File Type | Format |
|-----------|--------|
| Service/Logic | `[INPUT]` / `[OUTPUT]` / `[POS]` |
| React Component | `[PROPS]` / `[EMITS]` / `[POS]` |
| Utility Module | `[PROVIDES]` / `[DEPENDS]` / `[POS]` |
| Type Definitions | `[DEFINES]` / `[USED_BY]` / `[POS]` |

Example:

```typescript
/**
 * [INPUT]: content (string), metadata (MemoryMetadata)
 * [OUTPUT]: Result<MemoryItem>
 * [POS]: Core memory storage service, used by MemoryController
 *
 * [PROTOCOL]: When modifying this file, update this header and the directory AGENTS.md
 */
```

## 📂 Directory Convention

Module directory structure:

- `index.ts` - Entry point (re-exports)
- `types.ts` - Types and interfaces
- `const.ts` - Constants and enums
- `*.service.ts` - Business logic (NestJS services)
- `*.controller.ts` - HTTP handlers (NestJS controllers)
- `*.dto.ts` - Data transfer objects (Zod schemas)

Utility distinction:

- **Module `helper.ts`** - Module-specific logic, only serves current module
- **Global `utils/`** - Pure utility functions, no business state, reusable across projects
- **Global `lib/`** - Shared business logic, may depend on project context

## ⚡ Code Principles

### Core Principles

1. **Single Responsibility (SRP)**: Each function/component does one thing
2. **Open-Closed (OCP)**: Open for extension, closed for modification
3. **Law of Demeter (LoD)**: Only interact with direct dependencies
4. **Dependency Inversion (DIP)**: Depend on abstractions, not implementations
5. **Composition over Inheritance**: Use functional composition and hooks
6. **Web Search for Uncertainty**: When uncertain about anything, search the web to verify
7. **Latest Versions Required**: Always use the latest library versions and query official docs for up-to-date usage patterns before implementation

### Code Practices

1. **Pure Functions First**: Implement logic as pure functions for testability
2. **Early Return**: Use early returns to reduce nesting, improve readability
3. **Separation of Concerns**: Constants, utilities, logic, UI each in their place
4. **DRY Principle**: Extract duplicate logic, don't repeat yourself
5. **Avoid Premature Optimization**: Prioritize correctness and readability

### Comment Guidelines

1. **Document Core Logic**: Complex algorithms, business rules, edge cases need comments
2. **Naming + Comments**: Clear naming paired with necessary comments, not either-or
3. **English Comments**: Use concise English comments; add JSDoc for public APIs

### Prohibited Practices

1. **No Legacy Hacks**: Delete unused code, no backward compatibility workarounds
2. **No Deprecated Markers**: Forbidden: `// deprecated`, `// removed`, `_unused`, etc.
3. **No Guessing**: Search and verify before modifying

## 🎨 Visual Style (Admin UI)

> Keywords: Rounded, Whitespace, Monochrome, Subtle depth, Smooth animations

- Monochrome primary, color used sparingly
- Unified rounded corners, avoid sharp edges
- Whitespace is design, avoid clutter
- Subtle, restrained shadows
- Natural, unobtrusive animations

References: Arc, Notion, Linear

## 📛 Naming Convention

| Type | Convention | Example |
|------|------------|---------|
| Components/Types | PascalCase | `MemoryService`, `SearchResult` |
| Functions/Variables | camelCase | `handleSubmit`, `memoryItems` |
| Constants | UPPER_SNAKE_CASE | `MAX_RETRY`, `DEFAULT_THRESHOLD` |
| Directories | kebab-case | `memory-service/`, `graph-viewer/` |
| Files | camelCase | `memoryService.ts`, `useMemory.ts` |

## 🌐 Language Policy

Since this is an open-source project, English is the default language.

| Context | Language | Notes |
|---------|----------|-------|
| Code Comments | English | Concise and clear |
| Documentation | English | README, API docs, etc. |
| Commit Messages | English | Follow conventional commits |
| Error Messages | English | User-facing and internal |
| Log Messages | English | For debugging |
| UI Labels | English | i18n can be added later |

### Tool Description Convention (MCP/API)

- Tool `description`: English (for LLM understanding)
- Tool return `error`, `note` messages: English
- Parameter schema `.describe()`: English

Example:

```typescript
server.tool(
  'memory_add',
  'Add a new memory to the memory store',  // English description
  {
    content: z.string().describe('The content to remember'),  // English describe
    userId: z.string().describe('User ID for memory isolation'),
  },
  async ({ content, userId }) => {
    // ...
    if (!result.ok) {
      return { content: [{ type: 'text', text: `Error: ${result.error.message}` }] };  // English error
    }
    return { content: [{ type: 'text', text: `Memory added successfully: ${result.value.id}` }] };  // English response
  }
);
```

## 🔧 Development Commands

```bash
# Install dependencies
pnpm install

# Start development
pnpm dev

# Build all packages
pnpm build

# Run tests
pnpm test

# Lint and type check
pnpm lint
pnpm typecheck

# Database operations
pnpm prisma:generate   # Generate Prisma client
pnpm prisma:migrate    # Run migrations
pnpm prisma:studio     # Open Prisma Studio

# Docker
docker-compose up -d   # Start services
docker-compose down    # Stop services
```

## ⚠️ Breaking Changes Notice

> Always check the latest official documentation before using these libraries.

| Library | Version | Notes |
|---------|---------|-------|
| Prisma | 7.x | Significant breaking changes from 6.x. See [upgrade guide](https://www.prisma.io/docs/orm/more/upgrade-guides) |
| Zod | 4.x | API changes from 3.x. Check [migration guide](https://zod.dev) |
| Tailwind CSS | 4.x | New architecture, different config from 3.x |
| NestJS | 11.x | Check [release notes](https://docs.nestjs.com) |

## 📦 Package Publishing

| Package | npm Name | Description |
|---------|----------|-------------|
| `packages/core` | `@moryflow/memory-core` | Core types and schemas |
| `packages/server` | `@moryflow/memory-server` | NestJS API server |
| `packages/mcp` | `@moryflow/memory-mcp` | MCP server for Claude |
| `packages/admin` | `@moryflow/memory-admin` | Admin dashboard |

---

> **Version**: v1.0
> **Updated**: 2025-12-29
