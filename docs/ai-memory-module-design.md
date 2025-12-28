# AI Memory Module 设计方案

> 一个基于 PostgreSQL 的 AI Agent 记忆层，支持向量检索和知识图谱。

---

## 1. 需求

### 1.1 背景

AI Agent 需要持久化记忆能力，以实现：
- 跨会话的上下文保持
- 用户偏好和历史的学习
- 知识的积累和关联

### 1.2 功能需求

| 需求 | 描述 | 优先级 |
|------|------|--------|
| **向量记忆** | 语义相似性检索，找到相关历史对话 | P0 |
| **知识图谱** | 实体关系抽取，支持多跳推理 | P0 |
| **记忆管理** | 添加、更新、删除、过期清理 | P0 |
| **多租户** | 按 userId/agentId 隔离记忆空间 | P1 |
| **记忆压缩** | 长对话摘要，降低存储成本 | P1 |
| **可观测性** | 记忆检索日志、性能指标 | P2 |
| **管理后台** | 可视化管理记忆、实体、关系 | P2 |

### 1.3 非功能需求

| 需求 | 指标 |
|------|------|
| 检索延迟 | P99 < 200ms |
| 可用性 | 99.9% |
| 数据隔离 | 租户间完全隔离 |
| 可扩展性 | 支持水平扩展 |

### 1.4 约束

- 存储层：PostgreSQL（pgvector）
- Embedding：阿里 text-embedding-v4（1024 维）
- LLM（实体/关系抽取）：可配置，默认 OpenAI gpt-4.1-mini
- 部署：Docker / Docker Compose
- 语言：TypeScript
- 框架：NestJS + Prisma + Zod
- 开源协议：Apache-2.0
- npm scope：`@moryflow/memory-*`

---

## 2. 核心逻辑

### 2.1 记忆生命周期

```
┌─────────────────────────────────────────────────────────────────┐
│                      Memory Lifecycle                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ┌──────────┐     ┌──────────┐     ┌──────────┐               │
│   │  Ingest  │────▶│ Process  │────▶│  Store   │               │
│   │  输入    │     │  处理    │     │  存储    │               │
│   └──────────┘     └──────────┘     └──────────┘               │
│        │                │                │                      │
│        ▼                ▼                ▼                      │
│   对话/文档         向量化            Vector Store              │
│                    实体抽取           Graph Store               │
│                    关系抽取                                      │
│                                                                 │
│   ┌──────────┐     ┌──────────┐     ┌──────────┐               │
│   │  Query   │◀────│  Rank    │◀────│ Retrieve │               │
│   │  返回    │     │  排序    │     │  检索    │               │
│   └──────────┘     └──────────┘     └──────────┘               │
│        │                │                │                      │
│        ▼                ▼                ▼                      │
│   格式化输出        重排序/融合       向量检索                   │
│                                       图谱遍历                   │
│                                                                 │
│   ┌──────────┐                                                  │
│   │  Manage  │  过期清理 / 压缩 / 去重                          │
│   └──────────┘                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 向量记忆逻辑

**写入流程**：
```
Input (text)
    → Embedding (text → vector[1024])
    → Store (vector + metadata → PostgreSQL)
```

**检索流程**：
```
Query (text)
    → Embedding (text → vector[1024])
    → Vector Search (cosine similarity, top-k)
    → Filter (metadata conditions)
    → Return (MemoryItem[])
```

**核心算法**：
- 相似度计算：余弦相似度 `1 - (v1 <=> v2)`
- 索引类型：HNSW（高召回率）或 IVFFlat（高性能）

### 2.3 知识图谱逻辑

**设计决策**：使用 PostgreSQL 关系表 + 递归 CTE，而非 Apache AGE。

理由：
1. **易用性**：无需编译安装额外扩展，降低用户部署门槛
2. **Prisma 兼容**：原生支持，无需 raw SQL
3. **性能足够**：2-3 跳遍历对大多数 AI Agent 场景足够
4. **维护成本低**：标准 SQL，易于调试和优化

**实体抽取流程**：
```
Input (text)
    → NER / LLM Extract (识别实体)
    → Entity Resolution (去重/合并)
    → Store Node (实体 → entities 表)
```

**关系抽取流程**：
```
Input (text + entities)
    → Relation Extraction (LLM 抽取三元组)
    → Validate (过滤低置信度)
    → Store Edge (关系 → relations 表)
```

**图谱查询流程**（递归 CTE）：
```sql
WITH RECURSIVE graph AS (
  -- 起点
  SELECT id, name, type, 0 as depth
  FROM entities WHERE id = $1

  UNION ALL

  -- 递归遍历
  SELECT e.id, e.name, e.type, g.depth + 1
  FROM entities e
  JOIN relations r ON e.id = r.target_id
  JOIN graph g ON r.source_id = g.id
  WHERE g.depth < $2  -- 最大深度
)
SELECT * FROM graph;
```

### 2.4 混合检索逻辑

```
┌─────────────────────────────────────────────────────────────────┐
│                    Hybrid Retrieval                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   Query ──┬──▶ Vector Search ──┬──▶ Reciprocal Rank Fusion     │
│           │                    │           │                    │
│           └──▶ Graph Traverse ─┘           ▼                    │
│                                      Rerank (可选)              │
│                                           │                     │
│                                           ▼                     │
│                                      Final Results              │
└─────────────────────────────────────────────────────────────────┘
```

**融合策略**：Reciprocal Rank Fusion (RRF)
```
RRF_score(d) = Σ 1 / (k + rank_i(d))

其中：
- k = 60 (常数，防止高排名权重过大)
- rank_i(d) = 文档 d 在第 i 个检索结果中的排名
```

---

## 3. 技术方案

### 3.1 项目结构

参考 [mem0/openmemory](https://github.com/mem0ai/mem0/tree/main/openmemory) 架构：

```
moryflow-meta/
├── website/              # 官网
├── docs-site/            # 文档站
└── memory/               # AI Memory 模块 (独立项目)
    ├── packages/         # 内部子模块
    │   ├── core/         # 核心抽象和接口
    │   │   ├── src/
    │   │   │   ├── schemas/      # Zod schemas
    │   │   │   ├── types.ts
    │   │   │   ├── memory.ts
    │   │   │   ├── vector.ts
    │   │   │   ├── graph.ts
    │   │   │   └── errors.ts
    │   │   └── package.json
    │   │
    │   ├── server/       # NestJS API 服务
    │   │   ├── src/
    │   │   │   ├── memory/       # 记忆模块
    │   │   │   ├── entity/       # 实体模块
    │   │   │   ├── relation/     # 关系模块
    │   │   │   ├── embedding/    # Embedding 模块
    │   │   │   ├── extract/      # 抽取模块
    │   │   │   ├── llm/          # LLM 适配器
    │   │   │   └── app.module.ts
    │   │   ├── prisma/
    │   │   │   └── schema.prisma
    │   │   └── package.json
    │   │
    │   ├── mcp/          # MCP Server (Model Context Protocol)
    │   │   ├── src/
    │   │   │   ├── server.ts     # MCP Server 入口
    │   │   │   ├── tools/        # MCP Tools 定义
    │   │   │   │   ├── memory.ts
    │   │   │   │   ├── entity.ts
    │   │   │   │   └── search.ts
    │   │   │   └── index.ts
    │   │   └── package.json
    │   │
    │   └── admin/        # 管理后台 (Vite + React)
    │       ├── src/
    │       │   ├── pages/
    │       │   ├── components/
    │       │   └── api/
    │       ├── vite.config.ts
    │       └── package.json
    │
    ├── docker/           # Docker 配置
    │   ├── Dockerfile
    │   ├── docker-compose.yml
    │   └── init.sql
    │
    ├── examples/         # 使用示例
    │   └── basic.ts
    │
    ├── package.json      # 根 package
    ├── pnpm-workspace.yaml
    ├── tsconfig.json
    └── README.md
```

**目录说明**：
- `memory/` 是一个独立的 monorepo，可以单独 clone 和运行
- `packages/server` 是 NestJS API 服务，提供 REST API
- `packages/mcp` 是 MCP Server，供 Claude 等 AI 直接调用
- `packages/admin` 是管理后台（Vite + React），用于可视化管理记忆
- 发布时各子模块独立发布为 `@moryflow/memory-core` 等

### 3.2 依赖库版本

> 版本号查询时间：2025-12-29

> ⚠️ **重要提醒**：
> 1. **使用前务必查阅官方文档**：以下库版本较新，API 可能与旧版本有显著差异，开发前请查阅各库的最新文档和迁移指南
> 2. **Prisma 7.x Breaking Changes**：Prisma 7.x 相比 6.x 有重大变更，包括：
>    - 新的查询引擎架构
>    - `$queryRaw` 和 `$executeRaw` API 变化
>    - 类型系统改进
>    - 请参考：https://www.prisma.io/docs/orm/more/upgrade-guides
> 3. **Zod 4.x Breaking Changes**：Zod 4.x 相比 3.x 有 API 变更，请参考迁移指南
> 4. **Tailwind CSS 4.x**：Tailwind 4.x 采用全新架构，配置方式与 3.x 不同
> 5. **NestJS 11.x**：请查阅 NestJS 11 的更新日志

#### 3.2.1 核心依赖

| 包名 | 版本 | 用途 |
|------|------|------|
| `@nestjs/core` | ^11.1.10 | Web 框架 |
| `@nestjs/common` | ^11.1.10 | 公共模块 |
| `@nestjs/swagger` | ^11.2.3 | OpenAPI 文档 |
| `@prisma/client` | ^7.2.0 | 数据库 ORM |
| `prisma` | ^7.2.0 | Prisma CLI |
| `zod` | ^4.2.1 | 运行时验证 |
| `pgvector` | ^0.2.1 | PostgreSQL 向量扩展 Node 客户端 |
| `openai` | ^6.15.0 | OpenAI SDK（LLM 调用） |
| `@modelcontextprotocol/sdk` | ^1.25.1 | MCP Server SDK |

#### 3.2.2 工具依赖

| 包名 | 版本 | 用途 |
|------|------|------|
| `typescript` | ^5.9.3 | 类型系统 |
| `tsup` | ^8.5.1 | 打包工具 |
| `vitest` | ^4.0.16 | 测试框架 |
| `@types/node` | ^25.0.3 | Node 类型定义 |

#### 3.2.3 Admin 前端依赖

| 包名 | 版本 | 用途 |
|------|------|------|
| `react` | ^19.2.3 | UI 框架 |
| `react-dom` | ^19.2.3 | React DOM |
| `react-router` | ^7.11.0 | 路由 |
| `@tanstack/react-query` | ^5.90.14 | 数据请求 |
| `@tanstack/react-table` | ^8.21.3 | 表格组件 |
| `tailwindcss` | ^4.1.18 | CSS 框架 |
| `shadcn/ui` | latest | UI 组件库 |
| `react-force-graph` | ^1.48.1 | 图谱可视化 |
| `vite` | ^7.3.0 | 构建工具 |

### 3.3 核心数据结构

#### 3.3.1 Zod Schemas (`packages/core/src/schemas/memory.schema.ts`)

```typescript
import { z } from 'zod';

// ============ 基础 Schema ============

/** 记忆元数据 Schema */
export const MemoryMetadataSchema = z.object({
  userId: z.string().min(1),
  agentId: z.string().optional(),
  sessionId: z.string().optional(),
  source: z.enum(['conversation', 'document', 'extraction']),
  importance: z.number().min(0).max(1).optional().default(0.5),
  tags: z.array(z.string()).optional(),
}).passthrough();

/** 添加记忆输入 Schema */
export const AddMemoryInputSchema = z.object({
  content: z.string().min(1),
  metadata: MemoryMetadataSchema,
  extractEntities: z.boolean().optional().default(false),
  extractRelations: z.boolean().optional().default(false),
});

/** 搜索选项 Schema */
export const SearchOptionsSchema = z.object({
  userId: z.string().min(1),
  limit: z.number().min(1).max(100).optional().default(10),
  threshold: z.number().min(0).max(1).optional().default(0.7),
  filter: z.object({
    agentId: z.string().optional(),
    sessionId: z.string().optional(),
    source: z.string().optional(),
    tags: z.array(z.string()).optional(),
    dateRange: z.object({
      from: z.date().optional(),
      to: z.date().optional(),
    }).optional(),
  }).optional(),
  includeGraph: z.boolean().optional().default(false),
  graphDepth: z.number().min(1).max(5).optional().default(2),
});

// ============ 类型导出 ============

export type MemoryMetadata = z.infer<typeof MemoryMetadataSchema>;
export type AddMemoryInput = z.infer<typeof AddMemoryInputSchema>;
export type SearchOptions = z.infer<typeof SearchOptionsSchema>;
```

#### 3.3.2 Zod Schemas (`packages/core/src/schemas/graph.schema.ts`)

```typescript
import { z } from 'zod';

/** 实体类型枚举 */
export const EntityTypeSchema = z.enum([
  'person',
  'organization',
  'location',
  'concept',
  'event',
  'custom',
]);

/** 创建实体输入 Schema */
export const CreateEntityInputSchema = z.object({
  type: EntityTypeSchema,
  name: z.string().min(1).max(255),
  properties: z.record(z.string(), z.unknown()).optional().default({}),
  userId: z.string().min(1),
  source: z.string().optional(),
  confidence: z.number().min(0).max(1).optional().default(1.0),
});

/** 创建关系输入 Schema */
export const CreateRelationInputSchema = z.object({
  sourceId: z.string().uuid(),
  targetId: z.string().uuid(),
  type: z.string().min(1).max(64),
  properties: z.record(z.string(), z.unknown()).optional().default({}),
  userId: z.string().min(1),
  confidence: z.number().min(0).max(1).optional().default(1.0),
  validFrom: z.date().optional(),
  validTo: z.date().optional(),
});

/** 图遍历选项 Schema */
export const TraverseOptionsSchema = z.object({
  depth: z.number().min(1).max(5).default(2),
  direction: z.enum(['outgoing', 'incoming', 'both']).optional().default('both'),
  relationTypes: z.array(z.string()).optional(),
  limit: z.number().min(1).max(1000).optional().default(100),
});

// ============ 类型导出 ============

export type EntityType = z.infer<typeof EntityTypeSchema>;
export type CreateEntityInput = z.infer<typeof CreateEntityInputSchema>;
export type CreateRelationInput = z.infer<typeof CreateRelationInputSchema>;
export type TraverseOptions = z.infer<typeof TraverseOptionsSchema>;
```

#### 3.3.3 类型定义 (`packages/core/src/types.ts`)

```typescript
// ============ 记忆类型 ============

/** 记忆项 */
export interface MemoryItem {
  id: string;
  content: string;
  metadata: MemoryMetadata;
  createdAt: Date;
  updatedAt: Date;
}

/** 带分数的记忆项 */
export interface ScoredMemoryItem extends MemoryItem {
  score: number;
  source: 'vector' | 'graph' | 'hybrid';
}

/** 检索结果 */
export interface SearchResult {
  items: ScoredMemoryItem[];
  graph?: SubGraph;
  took: number; // ms
}

// ============ 图谱类型 ============

/** 实体节点 */
export interface Entity {
  id: string;
  type: EntityType;
  name: string;
  properties: Record<string, unknown>;
  userId: string;
  source?: string;
  confidence: number;
  createdAt: Date;
  updatedAt: Date;
}

/** 关系边 */
export interface Relation {
  id: string;
  sourceId: string;
  targetId: string;
  type: string;
  properties: Record<string, unknown>;
  userId: string;
  confidence: number;
  validFrom?: Date;
  validTo?: Date;
  createdAt: Date;
}

/** 子图 */
export interface SubGraph {
  entities: Entity[];
  relations: Relation[];
}
```

#### 3.3.4 错误处理 (`packages/core/src/errors.ts`)

```typescript
/**
 * Result 类型 - 显式错误处理
 */
export type Result<T, E = MemoryError> =
  | { ok: true; value: T }
  | { ok: false; error: E };

export const Ok = <T>(value: T): Result<T> => ({ ok: true, value });
export const Err = <E>(error: E): Result<never, E> => ({ ok: false, error });

/**
 * 错误类型枚举
 */
export enum MemoryErrorCode {
  // 存储错误
  CONNECTION_FAILED = 'CONNECTION_FAILED',
  QUERY_FAILED = 'QUERY_FAILED',
  NOT_FOUND = 'NOT_FOUND',
  DUPLICATE = 'DUPLICATE',

  // 向量错误
  EMBEDDING_FAILED = 'EMBEDDING_FAILED',
  DIMENSION_MISMATCH = 'DIMENSION_MISMATCH',

  // 图谱错误
  ENTITY_NOT_FOUND = 'ENTITY_NOT_FOUND',
  INVALID_RELATION = 'INVALID_RELATION',
  CYCLE_DETECTED = 'CYCLE_DETECTED',

  // 抽取错误
  EXTRACTION_FAILED = 'EXTRACTION_FAILED',

  // 通用错误
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  RATE_LIMITED = 'RATE_LIMITED',
  UNKNOWN = 'UNKNOWN',
}

export interface MemoryError {
  code: MemoryErrorCode;
  message: string;
  cause?: Error;
  context?: Record<string, unknown>;
}

/**
 * 创建错误的工厂函数
 */
export const createError = (
  code: MemoryErrorCode,
  message: string,
  options?: { cause?: Error; context?: Record<string, unknown> }
): MemoryError => ({
  code,
  message,
  cause: options?.cause,
  context: options?.context,
});
```

### 3.4 Prisma Schema (`packages/server/prisma/schema.prisma`)

```prisma
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["postgresqlExtensions"]
}

datasource db {
  provider   = "postgresql"
  url        = env("DATABASE_URL")
  extensions = [pgvector(map: "vector"), uuid_ossp(map: "uuid-ossp")]
}

// ============ 记忆表 ============

model Memory {
  id        String   @id @default(dbgenerated("uuid_generate_v4()")) @db.Uuid
  content   String   @db.Text
  embedding Unsupported("vector(1024)")

  // 元数据
  userId    String   @map("user_id") @db.VarChar(64)
  agentId   String?  @map("agent_id") @db.VarChar(64)
  sessionId String?  @map("session_id") @db.VarChar(64)
  source    String   @default("conversation") @db.VarChar(32)
  importance Float   @default(0.5)
  tags      String[] @default([])
  extraMetadata Json @default("{}") @map("extra_metadata")

  // 时间戳
  createdAt DateTime @default(now()) @map("created_at") @db.Timestamptz
  updatedAt DateTime @updatedAt @map("updated_at") @db.Timestamptz

  @@index([userId, createdAt(sort: Desc)], name: "idx_memories_user_created")
  @@index([userId, agentId], name: "idx_memories_user_agent")
  @@map("memories")
}

// ============ 实体表 ============

model Entity {
  id         String   @id @default(dbgenerated("uuid_generate_v4()")) @db.Uuid
  type       String   @db.VarChar(32)
  name       String   @db.VarChar(255)
  properties Json     @default("{}")
  embedding  Unsupported("vector(1024)")?

  // 元数据
  userId     String   @map("user_id") @db.VarChar(64)
  source     String?  @db.VarChar(255)
  confidence Float    @default(1.0)

  // 时间戳
  createdAt  DateTime @default(now()) @map("created_at") @db.Timestamptz
  updatedAt  DateTime @updatedAt @map("updated_at") @db.Timestamptz

  // 关系
  outgoingRelations Relation[] @relation("SourceEntity")
  incomingRelations Relation[] @relation("TargetEntity")

  @@unique([userId, type, name], name: "uq_entity_user_type_name")
  @@index([userId], name: "idx_entities_user")
  @@index([userId, type], name: "idx_entities_type")
  @@map("entities")
}

// ============ 关系表 ============

model Relation {
  id         String   @id @default(dbgenerated("uuid_generate_v4()")) @db.Uuid
  type       String   @db.VarChar(64)
  properties Json     @default("{}")

  // 外键
  sourceId   String   @map("source_id") @db.Uuid
  targetId   String   @map("target_id") @db.Uuid
  source     Entity   @relation("SourceEntity", fields: [sourceId], references: [id], onDelete: Cascade)
  target     Entity   @relation("TargetEntity", fields: [targetId], references: [id], onDelete: Cascade)

  // 元数据
  userId     String   @map("user_id") @db.VarChar(64)
  confidence Float    @default(1.0)
  validFrom  DateTime? @map("valid_from") @db.Timestamptz
  validTo    DateTime? @map("valid_to") @db.Timestamptz

  // 时间戳
  createdAt  DateTime @default(now()) @map("created_at") @db.Timestamptz

  @@index([userId], name: "idx_relations_user")
  @@index([sourceId], name: "idx_relations_source")
  @@index([targetId], name: "idx_relations_target")
  @@index([userId, type], name: "idx_relations_type")
  @@map("relations")
}
```

### 3.5 NestJS 模块示例 (`packages/server/src/memory/memory.service.ts`)

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmbeddingService } from '../embedding/embedding.service';
import { AddMemoryInputSchema, SearchOptionsSchema } from '@moryflow/memory-core';
import type { AddMemoryInput, SearchOptions, SearchResult, MemoryItem } from '@moryflow/memory-core';
import { Result, Ok, Err, createError, MemoryErrorCode } from '@moryflow/memory-core';

@Injectable()
export class MemoryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly embedding: EmbeddingService,
  ) {}

  /**
   * 添加记忆
   */
  async add(input: AddMemoryInput): Promise<Result<MemoryItem>> {
    // 1. 验证输入
    const parsed = AddMemoryInputSchema.safeParse(input);
    if (!parsed.success) {
      return Err(createError(MemoryErrorCode.VALIDATION_ERROR, parsed.error.message));
    }

    try {
      // 2. 生成 embedding
      const embeddingResult = await this.embedding.embed(input.content);
      if (!embeddingResult.ok) {
        return Err(embeddingResult.error);
      }

      // 3. 存储到数据库
      const memory = await this.prisma.$queryRaw`
        INSERT INTO memories (content, embedding, user_id, agent_id, session_id, source, importance, tags, extra_metadata)
        VALUES (
          ${input.content},
          ${embeddingResult.value}::vector,
          ${input.metadata.userId},
          ${input.metadata.agentId ?? null},
          ${input.metadata.sessionId ?? null},
          ${input.metadata.source},
          ${input.metadata.importance ?? 0.5},
          ${input.metadata.tags ?? []},
          ${JSON.stringify({})}::jsonb
        )
        RETURNING id, content, user_id, agent_id, session_id, source, importance, tags, created_at, updated_at
      `;

      return Ok(this.mapToMemoryItem(memory[0]));
    } catch (error) {
      return Err(createError(MemoryErrorCode.QUERY_FAILED, 'Failed to add memory', { cause: error as Error }));
    }
  }

  /**
   * 搜索记忆
   */
  async search(query: string, options: SearchOptions): Promise<Result<SearchResult>> {
    const startTime = Date.now();

    // 1. 验证选项
    const parsed = SearchOptionsSchema.safeParse(options);
    if (!parsed.success) {
      return Err(createError(MemoryErrorCode.VALIDATION_ERROR, parsed.error.message));
    }

    try {
      // 2. 生成查询 embedding
      const embeddingResult = await this.embedding.embed(query);
      if (!embeddingResult.ok) {
        return Err(embeddingResult.error);
      }

      // 3. 向量相似性搜索
      const memories = await this.prisma.$queryRaw`
        SELECT
          id, content, user_id, agent_id, session_id, source, importance, tags,
          created_at, updated_at,
          1 - (embedding <=> ${embeddingResult.value}::vector) as score
        FROM memories
        WHERE user_id = ${options.userId}
          AND 1 - (embedding <=> ${embeddingResult.value}::vector) >= ${options.threshold ?? 0.7}
        ORDER BY embedding <=> ${embeddingResult.value}::vector
        LIMIT ${options.limit ?? 10}
      `;

      const items = (memories as any[]).map((m) => ({
        ...this.mapToMemoryItem(m),
        score: m.score,
        source: 'vector' as const,
      }));

      return Ok({
        items,
        took: Date.now() - startTime,
      });
    } catch (error) {
      return Err(createError(MemoryErrorCode.QUERY_FAILED, 'Failed to search memories', { cause: error as Error }));
    }
  }

  private mapToMemoryItem(row: any): MemoryItem {
    return {
      id: row.id,
      content: row.content,
      metadata: {
        userId: row.user_id,
        agentId: row.agent_id,
        sessionId: row.session_id,
        source: row.source,
        importance: row.importance,
        tags: row.tags,
      },
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
```

### 3.6 Docker 部署

#### 3.6.1 Dockerfile (`docker/Dockerfile`)

```dockerfile
FROM postgres:16-bookworm

# 安装构建依赖
RUN apt-get update && apt-get install -y \
    build-essential \
    git \
    postgresql-server-dev-16 \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# 安装 pgvector
RUN git clone --branch v0.8.0 https://github.com/pgvector/pgvector.git \
    && cd pgvector \
    && make \
    && make install \
    && cd .. \
    && rm -rf pgvector

# 初始化脚本
COPY init.sql /docker-entrypoint-initdb.d/

EXPOSE 5432
```

#### 3.6.2 docker-compose.yml (`docker/docker-compose.yml`)

```yaml
version: '3.8'

services:
  memory-db:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: memory-postgres
    environment:
      POSTGRES_USER: ${POSTGRES_USER:-memory}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-memory_secret}
      POSTGRES_DB: ${POSTGRES_DB:-memory}
    ports:
      - "${POSTGRES_PORT:-5432}:5432"
    volumes:
      - memory_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-memory}"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped

  memory-api:
    build:
      context: ../packages/server
      dockerfile: Dockerfile
    container_name: memory-api
    environment:
      DATABASE_URL: postgresql://${POSTGRES_USER:-memory}:${POSTGRES_PASSWORD:-memory_secret}@memory-db:5432/${POSTGRES_DB:-memory}
      EMBEDDING_API_KEY: ${EMBEDDING_API_KEY}
      EMBEDDING_BASE_URL: ${EMBEDDING_BASE_URL:-https://dashscope.aliyuncs.com/compatible-mode/v1}
    ports:
      - "${API_PORT:-8765}:3000"
    depends_on:
      memory-db:
        condition: service_healthy
    restart: unless-stopped

  memory-admin:
    build:
      context: ../packages/admin
      dockerfile: Dockerfile
    container_name: memory-admin
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:${API_PORT:-8765}
    ports:
      - "${ADMIN_PORT:-3001}:3000"
    depends_on:
      - memory-api
    restart: unless-stopped

volumes:
  memory_data:
```

#### 3.6.3 初始化脚本 (`docker/init.sql`)

```sql
-- 创建扩展
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 向量索引 (HNSW)
-- 注意：需要在 Prisma migrate 后手动执行
-- CREATE INDEX idx_memories_embedding ON memories
--   USING hnsw (embedding vector_cosine_ops)
--   WITH (m = 16, ef_construction = 64);
```

---

## 4. Admin 管理后台

### 4.1 功能模块

| 模块 | 功能 | 路由 |
|------|------|------|
| **Dashboard** | 概览统计、最近活动 | `/` |
| **Memories** | 记忆列表、搜索、详情、删除 | `/memories` |
| **Entities** | 实体列表、创建、编辑、删除 | `/entities` |
| **Relations** | 关系列表、可视化、管理 | `/relations` |
| **Graph Viewer** | 交互式图谱可视化 | `/graph` |
| **Settings** | 配置管理、API 密钥 | `/settings` |

### 4.2 技术选型

- **构建工具**：Vite 7.3
- **框架**：React 19.2 + TypeScript 5.9
- **路由**：React Router 7.11
- **状态管理**：TanStack Query 5.90
- **UI 组件**：shadcn/ui + Tailwind CSS 4.1
- **图谱可视化**：react-force-graph 1.48
- **表格**：TanStack Table 8.21

### 4.3 核心页面

#### 4.3.1 Dashboard 统计

```typescript
interface DashboardStats {
  totalMemories: number;
  totalEntities: number;
  totalRelations: number;
  memoriesBySource: Record<string, number>;
  recentActivity: ActivityItem[];
}
```

#### 4.3.2 Memories 列表

```typescript
// 列表列定义
const columns = [
  { key: 'content', label: '内容', truncate: 100 },
  { key: 'userId', label: '用户' },
  { key: 'source', label: '来源' },
  { key: 'importance', label: '重要度' },
  { key: 'createdAt', label: '创建时间', format: 'datetime' },
  { key: 'actions', label: '操作' },
];
```

#### 4.3.3 Graph Viewer

使用 force-directed graph 展示实体关系：

```typescript
interface GraphViewerProps {
  userId: string;
  centerEntityId?: string;
  depth?: number;
  onNodeClick?: (entity: Entity) => void;
}
```

---

## 5. MCP Server

### 5.1 概述

MCP (Model Context Protocol) 是 Anthropic 提出的标准协议，让 AI 模型（如 Claude）可以直接调用外部工具和数据源。通过提供 MCP Server，AI 可以直接操作记忆系统。

### 5.2 支持的 Tools

| Tool 名称 | 描述 | 参数 |
|-----------|------|------|
| `memory_add` | 添加记忆 | `content`, `userId`, `metadata` |
| `memory_search` | 搜索记忆 | `query`, `userId`, `limit`, `threshold` |
| `memory_delete` | 删除记忆 | `memoryId` |
| `entity_list` | 列出实体 | `userId`, `type`, `limit` |
| `entity_get` | 获取实体详情 | `entityId` |
| `graph_traverse` | 图谱遍历 | `entityId`, `depth`, `direction` |

### 5.3 MCP Server 实现 (`packages/mcp/src/server.ts`)

```typescript
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

const server = new McpServer({
  name: 'moryflow-memory',
  version: '1.0.0',
});

// 添加记忆 Tool
server.tool(
  'memory_add',
  'Add a new memory to the memory store',
  {
    content: z.string().describe('The content to remember'),
    userId: z.string().describe('User ID for memory isolation'),
    source: z.enum(['conversation', 'document', 'extraction']).optional(),
    tags: z.array(z.string()).optional(),
  },
  async ({ content, userId, source, tags }) => {
    // 调用 Memory Service
    const result = await memoryService.add({
      content,
      metadata: { userId, source: source ?? 'conversation', tags },
    });

    if (!result.ok) {
      return { content: [{ type: 'text', text: `Error: ${result.error.message}` }] };
    }

    return {
      content: [{ type: 'text', text: `Memory added: ${result.value.id}` }],
    };
  }
);

// 搜索记忆 Tool
server.tool(
  'memory_search',
  'Search for relevant memories using semantic similarity',
  {
    query: z.string().describe('Search query'),
    userId: z.string().describe('User ID'),
    limit: z.number().min(1).max(50).optional().describe('Max results'),
    threshold: z.number().min(0).max(1).optional().describe('Similarity threshold'),
  },
  async ({ query, userId, limit, threshold }) => {
    const result = await memoryService.search(query, {
      userId,
      limit: limit ?? 10,
      threshold: threshold ?? 0.7,
    });

    if (!result.ok) {
      return { content: [{ type: 'text', text: `Error: ${result.error.message}` }] };
    }

    const memories = result.value.items
      .map((m, i) => `${i + 1}. [${m.score.toFixed(2)}] ${m.content}`)
      .join('\n');

    return {
      content: [{ type: 'text', text: memories || 'No memories found' }],
    };
  }
);

// 启动 Server
const transport = new StdioServerTransport();
await server.connect(transport);
```

### 5.4 MCP 客户端配置

在 Claude Desktop 或其他 MCP 客户端中配置：

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

或使用 SSE 模式连接到运行中的服务：

```json
{
  "mcpServers": {
    "moryflow-memory": {
      "url": "http://localhost:8765/mcp/sse"
    }
  }
}
```

---

## 6. LLM 配置

### 6.1 概述

实体抽取和关系抽取需要调用 LLM。系统支持可配置的 LLM 适配器。

### 6.2 默认配置

```typescript
// packages/server/src/llm/config.ts
export const defaultLLMConfig = {
  provider: 'openai',
  model: 'gpt-4.1-mini',
  baseUrl: 'https://api.openai.com/v1',
  apiKey: process.env.OPENAI_API_KEY,
};
```

### 6.3 环境变量

| 变量 | 描述 | 默认值 |
|------|------|--------|
| `LLM_PROVIDER` | LLM 提供商 | `openai` |
| `LLM_MODEL` | 模型名称 | `gpt-4.1-mini` |
| `LLM_BASE_URL` | API 基础 URL | `https://api.openai.com/v1` |
| `LLM_API_KEY` | API 密钥 | - |

### 6.4 LLM 适配器接口 (`packages/server/src/llm/types.ts`)

```typescript
export interface LLMAdapter {
  /**
   * 生成文本响应
   */
  generate(prompt: string, options?: GenerateOptions): Promise<Result<string>>;

  /**
   * 结构化输出（JSON Schema）
   */
  generateStructured<T>(
    prompt: string,
    schema: z.ZodSchema<T>,
    options?: GenerateOptions
  ): Promise<Result<T>>;
}

export interface GenerateOptions {
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
}
```

### 6.5 OpenAI 适配器实现

```typescript
// packages/server/src/llm/openai.adapter.ts
import OpenAI from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';

export class OpenAIAdapter implements LLMAdapter {
  private client: OpenAI;
  private model: string;

  constructor(config: { apiKey: string; baseUrl?: string; model?: string }) {
    this.client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseUrl,
    });
    this.model = config.model ?? 'gpt-4.1-mini';
  }

  async generate(prompt: string, options?: GenerateOptions): Promise<Result<string>> {
    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          ...(options?.systemPrompt ? [{ role: 'system' as const, content: options.systemPrompt }] : []),
          { role: 'user', content: prompt },
        ],
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens,
      });

      return Ok(response.choices[0]?.message?.content ?? '');
    } catch (error) {
      return Err(createError(MemoryErrorCode.EXTRACTION_FAILED, 'LLM generation failed', { cause: error as Error }));
    }
  }

  async generateStructured<T>(
    prompt: string,
    schema: z.ZodSchema<T>,
    options?: GenerateOptions
  ): Promise<Result<T>> {
    try {
      const response = await this.client.beta.chat.completions.parse({
        model: this.model,
        messages: [
          ...(options?.systemPrompt ? [{ role: 'system' as const, content: options.systemPrompt }] : []),
          { role: 'user', content: prompt },
        ],
        response_format: zodResponseFormat(schema, 'result'),
      });

      const parsed = response.choices[0]?.message?.parsed;
      if (!parsed) {
        return Err(createError(MemoryErrorCode.EXTRACTION_FAILED, 'Failed to parse structured response'));
      }

      return Ok(parsed);
    } catch (error) {
      return Err(createError(MemoryErrorCode.EXTRACTION_FAILED, 'Structured generation failed', { cause: error as Error }));
    }
  }
}
```

---

## 7. 部署指南

### 7.1 Docker Compose 部署

最简单的部署方式，适合开发和小规模生产环境：

```bash
cd memory/docker
cp .env.example .env
# 编辑 .env 配置环境变量
docker-compose up -d
```

服务端口：
- API Server: `http://localhost:8765`
- Admin UI: `http://localhost:3001`
- PostgreSQL: `localhost:5432`

### 7.2 Dokploy 部署

[Dokploy](https://dokploy.com) 是一个开源的 PaaS 平台，类似 Vercel/Railway 的自托管版本。

#### 7.2.1 准备工作

1. 确保 Dokploy 已安装并运行
2. 准备一个 PostgreSQL 数据库（可使用 Dokploy 的数据库服务）

#### 7.2.2 创建项目

1. 在 Dokploy 中创建新项目 `moryflow-memory`
2. 添加以下服务：

**服务 1: PostgreSQL 数据库**
- 类型：Database
- 镜像：使用自定义 Dockerfile（包含 pgvector）
- 或使用 Dokploy 提供的 PostgreSQL + 手动安装 pgvector

**服务 2: API Server**
- 类型：Application
- 源码：Git 仓库
- 构建路径：`packages/server`
- Dockerfile：

```dockerfile
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

FROM node:22-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
EXPOSE 3000
CMD ["node", "dist/main.js"]
```

**服务 3: Admin UI**
- 类型：Application
- 源码：Git 仓库
- 构建路径：`packages/admin`
- Dockerfile：

```dockerfile
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

#### 7.2.3 环境变量配置

在 Dokploy 中为各服务配置环境变量：

**API Server:**
```
DATABASE_URL=postgresql://user:pass@db:5432/memory
EMBEDDING_API_KEY=your-aliyun-key
EMBEDDING_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
LLM_API_KEY=your-openai-key
LLM_MODEL=gpt-4.1-mini
```

**Admin UI:**
```
VITE_API_URL=https://api.your-domain.com
```

#### 7.2.4 域名配置

在 Dokploy 中配置域名：
- API: `api.memory.your-domain.com`
- Admin: `admin.memory.your-domain.com`

### 7.3 通用 Docker 部署

适用于任何支持 Docker 的平台（AWS ECS、Google Cloud Run、Azure Container Apps 等）：

#### 7.3.1 构建镜像

```bash
# 构建 API Server
docker build -t moryflow-memory-api:latest -f packages/server/Dockerfile .

# 构建 Admin UI
docker build -t moryflow-memory-admin:latest -f packages/admin/Dockerfile .

# 构建 PostgreSQL + pgvector
docker build -t moryflow-memory-db:latest -f docker/Dockerfile docker/
```

#### 7.3.2 推送到镜像仓库

```bash
# Docker Hub
docker push your-username/moryflow-memory-api:latest
docker push your-username/moryflow-memory-admin:latest

# 或私有仓库
docker tag moryflow-memory-api:latest registry.your-domain.com/memory-api:latest
docker push registry.your-domain.com/memory-api:latest
```

#### 7.3.3 Kubernetes 部署（可选）

```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: memory-api
spec:
  replicas: 2
  selector:
    matchLabels:
      app: memory-api
  template:
    metadata:
      labels:
        app: memory-api
    spec:
      containers:
        - name: api
          image: moryflow-memory-api:latest
          ports:
            - containerPort: 3000
          env:
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: memory-secrets
                  key: database-url
          resources:
            requests:
              memory: "256Mi"
              cpu: "250m"
            limits:
              memory: "512Mi"
              cpu: "500m"
```

### 7.4 健康检查

所有部署方式都应配置健康检查：

```
# API Server
GET /health

# 响应
{
  "status": "ok",
  "database": "connected",
  "version": "1.0.0"
}
```

---

## 8. 执行计划

### Phase 1: 基础设施

| 步骤 | 任务 | 产出 |
|------|------|------|
| 1.1 | 初始化 `memory/` 项目结构 | 根目录 + `packages/` |
| 1.2 | 配置 TypeScript + ESLint + Prettier | 工程配置 |
| 1.3 | 创建 Docker 镜像 | `docker/` 目录 |
| 1.4 | 配置 Prisma Schema | `packages/server/prisma/` |
| 1.5 | 实现数据库连接和迁移 | 数据库初始化 |

**验收标准**：
- [ ] `docker-compose up` 启动成功
- [ ] Prisma migrate 执行成功
- [ ] 数据库连接健康检查通过

### Phase 2: 核心类型和接口

| 步骤 | 任务 | 产出 |
|------|------|------|
| 2.1 | 定义 Zod Schemas | `packages/core/src/schemas/` |
| 2.2 | 定义 TypeScript 类型 | `packages/core/src/types.ts` |
| 2.3 | 定义错误类型和 Result | `packages/core/src/errors.ts` |
| 2.4 | 导出公共 API | `packages/core/src/index.ts` |

**验收标准**：
- [ ] 类型定义完整，通过 TypeScript 编译
- [ ] Zod schema 验证功能正常
- [ ] 导出清晰的公共 API

### Phase 3: 向量存储实现

| 步骤 | 任务 | 产出 |
|------|------|------|
| 3.1 | 实现 Embedding Service | `packages/server/src/embedding/` |
| 3.2 | 实现 Memory Service | `packages/server/src/memory/` |
| 3.3 | 实现向量插入和搜索 | pgvector 操作 |
| 3.4 | 编写单元测试 | `tests/memory.test.ts` |

**验收标准**：
- [ ] 插入 1000 条记录 < 5s
- [ ] 搜索 P99 < 100ms
- [ ] 测试覆盖率 > 80%

### Phase 4: 图谱存储实现

| 步骤 | 任务 | 产出 |
|------|------|------|
| 4.1 | 实现 Entity Service | `packages/server/src/entity/` |
| 4.2 | 实现 Relation Service | `packages/server/src/relation/` |
| 4.3 | 实现递归 CTE 遍历 | 图遍历查询 |
| 4.4 | 编写单元测试 | `tests/graph.test.ts` |

**验收标准**：
- [ ] 支持 3 跳以内遍历
- [ ] 遍历 P99 < 200ms
- [ ] 测试覆盖率 > 80%

### Phase 5: 实体/关系抽取

| 步骤 | 任务 | 产出 |
|------|------|------|
| 5.1 | 定义抽取 Prompt | LLM Prompt 模板 |
| 5.2 | 实现 LLM 实体抽取 | `packages/server/src/extract/entity.ts` |
| 5.3 | 实现 LLM 关系抽取 | `packages/server/src/extract/relation.ts` |
| 5.4 | 实现实体去重/合并 | Resolution 逻辑 |

**验收标准**：
- [ ] 实体抽取准确率 > 85%
- [ ] 关系抽取准确率 > 75%

### Phase 6: API 层实现

| 步骤 | 任务 | 产出 |
|------|------|------|
| 6.1 | 实现 Memory Controller | REST API |
| 6.2 | 实现 Entity Controller | REST API |
| 6.3 | 实现 Relation Controller | REST API |
| 6.4 | 添加 OpenAPI 文档 | Swagger UI |

**验收标准**：
- [ ] API 端点功能完整
- [ ] OpenAPI 文档生成成功

### Phase 7: MCP Server 实现

| 步骤 | 任务 | 产出 |
|------|------|------|
| 7.1 | 初始化 MCP 项目 | `packages/mcp/` |
| 7.2 | 实现 memory_* Tools | 记忆操作 |
| 7.3 | 实现 entity_* Tools | 实体操作 |
| 7.4 | 实现 graph_* Tools | 图谱遍历 |
| 7.5 | 添加 SSE 传输支持 | HTTP SSE 模式 |

**验收标准**：
- [ ] Claude Desktop 可正常调用
- [ ] Stdio 和 SSE 模式都可用

### Phase 8: Admin 管理后台

| 步骤 | 任务 | 产出 |
|------|------|------|
| 8.1 | 初始化 Vite + React 项目 | `packages/admin/` |
| 8.2 | 实现 Dashboard 页面 | 概览统计 |
| 8.3 | 实现 Memories 管理 | CRUD 页面 |
| 8.4 | 实现 Entities/Relations 管理 | CRUD 页面 |
| 8.5 | 实现 Graph Viewer | 可视化组件 |

**验收标准**：
- [ ] 管理后台功能完整
- [ ] 图谱可视化正常

### Phase 9: 文档和发布

| 步骤 | 任务 | 产出 |
|------|------|------|
| 9.1 | 编写 README | 快速开始文档 |
| 9.2 | 编写 API 文档 | TypeDoc 生成 |
| 9.3 | 编写使用示例 | `examples/` |
| 9.4 | 配置 CI/CD | GitHub Actions |
| 9.5 | 发布 npm 包 | `@moryflow/memory-*` |

**验收标准**：
- [ ] 文档完整
- [ ] npm 发布成功
- [ ] CI 全部通过

---

## 9. 参考文档

### 9.1 官方文档

| 资源 | 链接 | 备注 |
|------|------|------|
| pgvector | https://github.com/pgvector/pgvector | |
| Prisma 7.x | https://www.prisma.io/docs | ⚠️ 7.x 有重大变更 |
| Prisma 升级指南 | https://www.prisma.io/docs/orm/more/upgrade-guides | 必读 |
| NestJS 11 | https://docs.nestjs.com | |
| Zod 4.x | https://zod.dev | ⚠️ 4.x 有 API 变更 |
| Tailwind CSS 4 | https://tailwindcss.com/docs | ⚠️ 全新架构 |
| React 19 | https://react.dev | |
| TanStack Query | https://tanstack.com/query/latest | |
| TanStack Table | https://tanstack.com/table/latest | |
| PostgreSQL 16 | https://www.postgresql.org/docs/16/ | |
| OpenAI API | https://platform.openai.com/docs | LLM 调用 |
| MCP 协议 | https://modelcontextprotocol.io | MCP Server 开发 |
| 阿里 Embedding | https://help.aliyun.com/zh/model-studio/text-embedding-v4 | |

### 9.2 相关项目

| 项目 | 链接 | 参考价值 |
|------|------|----------|
| Mem0 | https://github.com/mem0ai/mem0 | API 设计、openmemory 架构 |
| Cognee | https://github.com/topoteretes/cognee | 管道设计 |
| Zep/Graphiti | https://github.com/getzep/graphiti | 时序图谱 |
| LangChain Memory | https://python.langchain.com/docs/modules/memory/ | 接口参考 |

### 9.3 论文和文章

| 标题 | 链接 |
|------|------|
| GraphRAG | https://arxiv.org/pdf/2404.16130 |
| MemGPT | https://arxiv.org/abs/2310.08560 |
| Reciprocal Rank Fusion | https://plg.uwaterloo.ca/~gvcormac/cormacksigir09-rrf.pdf |

### 9.4 最佳实践

| 主题 | 参考 |
|------|------|
| pgvector 索引调优 | https://github.com/pgvector/pgvector#indexing |
| Prisma + pgvector | https://www.prisma.io/docs/orm/prisma-schema/postgresql-extensions |
| NestJS 最佳实践 | https://docs.nestjs.com/techniques/performance |
| MCP Server 开发 | https://modelcontextprotocol.io/docs/concepts/servers |

---

> **文档版本**: v3.0
> **更新日期**: 2025-12-29
> **状态**: Draft
