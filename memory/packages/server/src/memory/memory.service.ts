import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { EmbeddingService } from '../embedding/embedding.service';
import {
  type Result,
  Ok,
  Err,
  createError,
  MemoryErrorCode,
  AddMemoryInputSchema,
  SearchOptionsSchema,
  type AddMemoryInput,
  type SearchOptions,
  type MemoryItem,
  type ScoredMemoryItem,
  type SearchResult,
} from '@moryflow/memory-core';
import {
  type MemoryRow,
  type ScoredMemoryRow,
  type CountRow,
} from '../common/types';
import { toMemoryItem, toScoredMemoryItem } from '../common/mappers';

@Injectable()
export class MemoryService {
  private readonly logger = new Logger(MemoryService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly embedding: EmbeddingService,
  ) {}

  /**
   * Add a new memory
   */
  async add(input: AddMemoryInput): Promise<Result<MemoryItem>> {
    // Validate input
    const parsed = AddMemoryInputSchema.safeParse(input);
    if (!parsed.success) {
      return Err(
        createError(MemoryErrorCode.VALIDATION_ERROR, parsed.error.message, {
          context: { errors: parsed.error.errors },
        }),
      );
    }

    const validInput = parsed.data;

    try {
      // Generate embedding
      const embeddingResult = await this.embedding.embed(validInput.content);
      if (!embeddingResult.ok) {
        return Err(embeddingResult.error);
      }

      const vectorStr = `[${embeddingResult.value.join(',')}]`;

      // Insert into database using raw query for vector support
      const result = await this.prisma.$queryRaw<MemoryRow[]>`
        INSERT INTO memories (
          content, embedding, user_id, agent_id, session_id,
          source, importance, tags, extra_metadata
        )
        VALUES (
          ${validInput.content},
          ${vectorStr}::vector,
          ${validInput.metadata.userId},
          ${validInput.metadata.agentId ?? null},
          ${validInput.metadata.sessionId ?? null},
          ${validInput.metadata.source},
          ${validInput.metadata.importance},
          ${validInput.metadata.tags}::text[],
          '{}'::jsonb
        )
        RETURNING
          id, content, user_id, agent_id, session_id,
          source, importance, tags, created_at, updated_at
      `;

      const row = result[0];
      if (!row) {
        return Err(createError(MemoryErrorCode.QUERY_FAILED, 'Failed to insert memory'));
      }

      return Ok(toMemoryItem(row));
    } catch (error) {
      this.logger.error('Failed to add memory', error);
      return Err(
        createError(MemoryErrorCode.QUERY_FAILED, 'Failed to add memory', {
          cause: error instanceof Error ? error : new Error(String(error)),
        }),
      );
    }
  }

  /**
   * Search memories by semantic similarity
   */
  async search(query: string, options: SearchOptions): Promise<Result<SearchResult>> {
    const startTime = Date.now();

    // Validate options
    const parsed = SearchOptionsSchema.safeParse(options);
    if (!parsed.success) {
      return Err(
        createError(MemoryErrorCode.VALIDATION_ERROR, parsed.error.message, {
          context: { errors: parsed.error.errors },
        }),
      );
    }

    const validOptions = parsed.data;

    try {
      // Generate query embedding
      const embeddingResult = await this.embedding.embed(query);
      if (!embeddingResult.ok) {
        return Err(embeddingResult.error);
      }

      const vectorStr = `[${embeddingResult.value.join(',')}]`;

      // Build filter conditions
      const filterConditions = this.buildFilterConditions(validOptions);

      // Vector similarity search
      const memories = await this.prisma.$queryRaw<ScoredMemoryRow[]>`
        SELECT
          id, content, user_id, agent_id, session_id,
          source, importance, tags, created_at, updated_at,
          1 - (embedding <=> ${vectorStr}::vector) as score
        FROM memories
        WHERE user_id = ${validOptions.userId}
          AND embedding IS NOT NULL
          AND 1 - (embedding <=> ${vectorStr}::vector) >= ${validOptions.threshold}
          ${filterConditions}
        ORDER BY embedding <=> ${vectorStr}::vector
        LIMIT ${validOptions.limit}
      `;

      const items: ScoredMemoryItem[] = memories.map((row: ScoredMemoryRow) =>
        toScoredMemoryItem(row),
      );

      return Ok({
        items,
        took: Date.now() - startTime,
      });
    } catch (error) {
      this.logger.error('Failed to search memories', error);
      return Err(
        createError(MemoryErrorCode.QUERY_FAILED, 'Failed to search memories', {
          cause: error instanceof Error ? error : new Error(String(error)),
        }),
      );
    }
  }

  /**
   * Get a memory by ID
   */
  async getById(id: string, userId: string): Promise<Result<MemoryItem | null>> {
    try {
      const result = await this.prisma.$queryRaw<MemoryRow[]>`
        SELECT
          id, content, user_id, agent_id, session_id,
          source, importance, tags, created_at, updated_at
        FROM memories
        WHERE id = ${id}::uuid AND user_id = ${userId}
      `;

      const row = result[0];
      if (!row) {
        return Ok(null);
      }

      return Ok(toMemoryItem(row));
    } catch (error) {
      this.logger.error('Failed to get memory', error);
      return Err(
        createError(MemoryErrorCode.QUERY_FAILED, 'Failed to get memory', {
          cause: error instanceof Error ? error : new Error(String(error)),
        }),
      );
    }
  }

  /**
   * Delete a memory by ID
   */
  async delete(id: string, userId: string): Promise<Result<boolean>> {
    try {
      const result = await this.prisma.$executeRaw`
        DELETE FROM memories
        WHERE id = ${id}::uuid AND user_id = ${userId}
      `;

      return Ok(result > 0);
    } catch (error) {
      this.logger.error('Failed to delete memory', error);
      return Err(
        createError(MemoryErrorCode.QUERY_FAILED, 'Failed to delete memory', {
          cause: error instanceof Error ? error : new Error(String(error)),
        }),
      );
    }
  }

  /**
   * List memories for a user
   */
  async list(
    userId: string,
    options?: { limit?: number; offset?: number; agentId?: string },
  ): Promise<Result<MemoryItem[]>> {
    const limit = options?.limit ?? 50;
    const offset = options?.offset ?? 0;

    try {
      let result: MemoryRow[];

      if (options?.agentId) {
        result = await this.prisma.$queryRaw<MemoryRow[]>`
          SELECT
            id, content, user_id, agent_id, session_id,
            source, importance, tags, created_at, updated_at
          FROM memories
          WHERE user_id = ${userId} AND agent_id = ${options.agentId}
          ORDER BY created_at DESC
          LIMIT ${limit} OFFSET ${offset}
        `;
      } else {
        result = await this.prisma.$queryRaw<MemoryRow[]>`
          SELECT
            id, content, user_id, agent_id, session_id,
            source, importance, tags, created_at, updated_at
          FROM memories
          WHERE user_id = ${userId}
          ORDER BY created_at DESC
          LIMIT ${limit} OFFSET ${offset}
        `;
      }

      return Ok(result.map((row: MemoryRow) => toMemoryItem(row)));
    } catch (error) {
      this.logger.error('Failed to list memories', error);
      return Err(
        createError(MemoryErrorCode.QUERY_FAILED, 'Failed to list memories', {
          cause: error instanceof Error ? error : new Error(String(error)),
        }),
      );
    }
  }

  /**
   * Count memories for a user
   */
  async count(userId: string, agentId?: string): Promise<Result<number>> {
    try {
      let result: CountRow[];

      if (agentId) {
        result = await this.prisma.$queryRaw<CountRow[]>`
          SELECT COUNT(*) as count FROM memories
          WHERE user_id = ${userId} AND agent_id = ${agentId}
        `;
      } else {
        result = await this.prisma.$queryRaw<CountRow[]>`
          SELECT COUNT(*) as count FROM memories
          WHERE user_id = ${userId}
        `;
      }

      const row = result[0];
      return Ok(row ? Number(row.count) : 0);
    } catch (error) {
      this.logger.error('Failed to count memories', error);
      return Err(
        createError(MemoryErrorCode.QUERY_FAILED, 'Failed to count memories', {
          cause: error instanceof Error ? error : new Error(String(error)),
        }),
      );
    }
  }

  /**
   * Build SQL filter conditions from search options
   * Note: This returns a Prisma.sql fragment for additional conditions
   */
  private buildFilterConditions(_options: SearchOptions): ReturnType<typeof Prisma.sql> {
    // For now, we'll handle basic filters in the main query
    // Complex filters can be added here
    return Prisma.empty;
  }
}
