import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmbeddingService } from '../embedding/embedding.service';
import {
  type Result,
  Ok,
  Err,
  createError,
  MemoryErrorCode,
  CreateEntityInputSchema,
  UpdateEntityInputSchema,
  type CreateEntityInput,
  type UpdateEntityInput,
  type Entity,
} from '@moryflow/memory-core';
import { type EntityRow, type ScoredEntityRow, type CountRow } from '../common/types';
import { toEntity, toScoredEntity } from '../common/mappers';

@Injectable()
export class EntityService {
  private readonly logger = new Logger(EntityService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly embedding: EmbeddingService,
  ) {}

  /**
   * Create a new entity
   */
  async create(input: CreateEntityInput): Promise<Result<Entity>> {
    const parsed = CreateEntityInputSchema.safeParse(input);
    if (!parsed.success) {
      return Err(
        createError(MemoryErrorCode.VALIDATION_ERROR, parsed.error.message, {
          context: { errors: parsed.error.errors },
        }),
      );
    }

    const validInput = parsed.data;

    try {
      // Generate embedding for entity name
      const embeddingResult = await this.embedding.embed(validInput.name);
      const vectorStr = embeddingResult.ok
        ? `[${embeddingResult.value.join(',')}]`
        : null;

      const result = await this.prisma.$queryRaw<EntityRow[]>`
        INSERT INTO entities (
          type, name, properties, user_id, source, confidence, embedding
        )
        VALUES (
          ${validInput.type},
          ${validInput.name},
          ${JSON.stringify(validInput.properties)}::jsonb,
          ${validInput.userId},
          ${validInput.source ?? null},
          ${validInput.confidence},
          ${vectorStr}::vector
        )
        ON CONFLICT (user_id, type, name) DO UPDATE SET
          properties = EXCLUDED.properties,
          confidence = GREATEST(entities.confidence, EXCLUDED.confidence),
          updated_at = NOW()
        RETURNING
          id, type, name, properties, user_id, source, confidence,
          created_at, updated_at
      `;

      const row = result[0];
      if (!row) {
        return Err(createError(MemoryErrorCode.QUERY_FAILED, 'Failed to create entity'));
      }

      return Ok(toEntity(row));
    } catch (error) {
      this.logger.error('Failed to create entity', error);
      return Err(
        createError(MemoryErrorCode.QUERY_FAILED, 'Failed to create entity', {
          cause: error instanceof Error ? error : new Error(String(error)),
        }),
      );
    }
  }

  /**
   * Create multiple entities in batch
   */
  async createBatch(inputs: CreateEntityInput[]): Promise<Result<Entity[]>> {
    const entities: Entity[] = [];

    for (const input of inputs) {
      const result = await this.create(input);
      if (!result.ok) {
        this.logger.warn(`Failed to create entity: ${input.name}`, result.error);
        continue;
      }
      entities.push(result.value);
    }

    return Ok(entities);
  }

  /**
   * Get entity by ID
   */
  async getById(id: string, userId: string): Promise<Result<Entity | null>> {
    try {
      const result = await this.prisma.$queryRaw<EntityRow[]>`
        SELECT id, type, name, properties, user_id, source, confidence,
               created_at, updated_at
        FROM entities
        WHERE id = ${id}::uuid AND user_id = ${userId}
      `;

      const row = result[0];
      return Ok(row ? toEntity(row) : null);
    } catch (error) {
      this.logger.error('Failed to get entity', error);
      return Err(
        createError(MemoryErrorCode.QUERY_FAILED, 'Failed to get entity', {
          cause: error instanceof Error ? error : new Error(String(error)),
        }),
      );
    }
  }

  /**
   * Find entity by name and type
   */
  async findByName(
    userId: string,
    name: string,
    type?: string,
  ): Promise<Result<Entity | null>> {
    try {
      let result: EntityRow[];

      if (type) {
        result = await this.prisma.$queryRaw<EntityRow[]>`
          SELECT id, type, name, properties, user_id, source, confidence,
                 created_at, updated_at
          FROM entities
          WHERE user_id = ${userId} AND name = ${name} AND type = ${type}
        `;
      } else {
        result = await this.prisma.$queryRaw<EntityRow[]>`
          SELECT id, type, name, properties, user_id, source, confidence,
                 created_at, updated_at
          FROM entities
          WHERE user_id = ${userId} AND name = ${name}
          LIMIT 1
        `;
      }

      const row = result[0];
      return Ok(row ? toEntity(row) : null);
    } catch (error) {
      this.logger.error('Failed to find entity', error);
      return Err(
        createError(MemoryErrorCode.QUERY_FAILED, 'Failed to find entity', {
          cause: error instanceof Error ? error : new Error(String(error)),
        }),
      );
    }
  }

  /**
   * Search entities by semantic similarity
   */
  async search(
    userId: string,
    query: string,
    options?: { type?: string; limit?: number; threshold?: number },
  ): Promise<Result<Array<Entity & { score: number }>>> {
    const limit = options?.limit ?? 10;
    const threshold = options?.threshold ?? 0.6;

    try {
      const embeddingResult = await this.embedding.embed(query);
      if (!embeddingResult.ok) {
        return Err(embeddingResult.error);
      }

      const vectorStr = `[${embeddingResult.value.join(',')}]`;

      let result: ScoredEntityRow[];

      if (options?.type) {
        result = await this.prisma.$queryRaw<ScoredEntityRow[]>`
          SELECT id, type, name, properties, user_id, source, confidence,
                 created_at, updated_at,
                 1 - (embedding <=> ${vectorStr}::vector) as score
          FROM entities
          WHERE user_id = ${userId}
            AND type = ${options.type}
            AND embedding IS NOT NULL
            AND 1 - (embedding <=> ${vectorStr}::vector) >= ${threshold}
          ORDER BY embedding <=> ${vectorStr}::vector
          LIMIT ${limit}
        `;
      } else {
        result = await this.prisma.$queryRaw<ScoredEntityRow[]>`
          SELECT id, type, name, properties, user_id, source, confidence,
                 created_at, updated_at,
                 1 - (embedding <=> ${vectorStr}::vector) as score
          FROM entities
          WHERE user_id = ${userId}
            AND embedding IS NOT NULL
            AND 1 - (embedding <=> ${vectorStr}::vector) >= ${threshold}
          ORDER BY embedding <=> ${vectorStr}::vector
          LIMIT ${limit}
        `;
      }

      return Ok(result.map((row: ScoredEntityRow) => toScoredEntity(row)));
    } catch (error) {
      this.logger.error('Failed to search entities', error);
      return Err(
        createError(MemoryErrorCode.QUERY_FAILED, 'Failed to search entities', {
          cause: error instanceof Error ? error : new Error(String(error)),
        }),
      );
    }
  }

  /**
   * List entities for a user
   */
  async list(
    userId: string,
    options?: { type?: string; limit?: number; offset?: number },
  ): Promise<Result<Entity[]>> {
    const limit = options?.limit ?? 50;
    const offset = options?.offset ?? 0;

    try {
      let result: EntityRow[];

      if (options?.type) {
        result = await this.prisma.$queryRaw<EntityRow[]>`
          SELECT id, type, name, properties, user_id, source, confidence,
                 created_at, updated_at
          FROM entities
          WHERE user_id = ${userId} AND type = ${options.type}
          ORDER BY name ASC
          LIMIT ${limit} OFFSET ${offset}
        `;
      } else {
        result = await this.prisma.$queryRaw<EntityRow[]>`
          SELECT id, type, name, properties, user_id, source, confidence,
                 created_at, updated_at
          FROM entities
          WHERE user_id = ${userId}
          ORDER BY name ASC
          LIMIT ${limit} OFFSET ${offset}
        `;
      }

      return Ok(result.map((row: EntityRow) => toEntity(row)));
    } catch (error) {
      this.logger.error('Failed to list entities', error);
      return Err(
        createError(MemoryErrorCode.QUERY_FAILED, 'Failed to list entities', {
          cause: error instanceof Error ? error : new Error(String(error)),
        }),
      );
    }
  }

  /**
   * Update an entity
   */
  async update(id: string, userId: string, input: UpdateEntityInput): Promise<Result<Entity>> {
    const parsed = UpdateEntityInputSchema.safeParse(input);
    if (!parsed.success) {
      return Err(
        createError(MemoryErrorCode.VALIDATION_ERROR, parsed.error.message),
      );
    }

    const validInput = parsed.data;

    // Check if there's anything to update
    if (
      validInput.name === undefined &&
      validInput.type === undefined &&
      validInput.properties === undefined &&
      validInput.confidence === undefined
    ) {
      // Nothing to update, return existing
      const existing = await this.getById(id, userId);
      if (!existing.ok) return existing;
      if (!existing.value) {
        return Err(createError(MemoryErrorCode.NOT_FOUND, 'Entity not found'));
      }
      return Ok(existing.value);
    }

    try {
      // Use COALESCE for safe partial updates
      const result = await this.prisma.$queryRaw<EntityRow[]>`
        UPDATE entities
        SET
          name = COALESCE(${validInput.name ?? null}, name),
          type = COALESCE(${validInput.type ?? null}, type),
          properties = COALESCE(${validInput.properties ? JSON.stringify(validInput.properties) : null}::jsonb, properties),
          confidence = COALESCE(${validInput.confidence ?? null}, confidence),
          updated_at = NOW()
        WHERE id = ${id}::uuid AND user_id = ${userId}
        RETURNING id, type, name, properties, user_id, source, confidence,
                  created_at, updated_at
      `;

      const row = result[0];
      if (!row) {
        return Err(createError(MemoryErrorCode.NOT_FOUND, 'Entity not found'));
      }

      return Ok(toEntity(row));
    } catch (error) {
      this.logger.error('Failed to update entity', error);
      return Err(
        createError(MemoryErrorCode.QUERY_FAILED, 'Failed to update entity', {
          cause: error instanceof Error ? error : new Error(String(error)),
        }),
      );
    }
  }

  /**
   * Delete an entity (cascades to relations)
   */
  async delete(id: string, userId: string): Promise<Result<boolean>> {
    try {
      const result = await this.prisma.$executeRaw`
        DELETE FROM entities
        WHERE id = ${id}::uuid AND user_id = ${userId}
      `;

      return Ok(result > 0);
    } catch (error) {
      this.logger.error('Failed to delete entity', error);
      return Err(
        createError(MemoryErrorCode.QUERY_FAILED, 'Failed to delete entity', {
          cause: error instanceof Error ? error : new Error(String(error)),
        }),
      );
    }
  }

  /**
   * Count entities for a user
   */
  async count(userId: string, type?: string): Promise<Result<number>> {
    try {
      let result: CountRow[];

      if (type) {
        result = await this.prisma.$queryRaw<CountRow[]>`
          SELECT COUNT(*) as count FROM entities
          WHERE user_id = ${userId} AND type = ${type}
        `;
      } else {
        result = await this.prisma.$queryRaw<CountRow[]>`
          SELECT COUNT(*) as count FROM entities
          WHERE user_id = ${userId}
        `;
      }

      const row = result[0];
      return Ok(row ? Number(row.count) : 0);
    } catch (error) {
      this.logger.error('Failed to count entities', error);
      return Err(
        createError(MemoryErrorCode.QUERY_FAILED, 'Failed to count entities', {
          cause: error instanceof Error ? error : new Error(String(error)),
        }),
      );
    }
  }
}
