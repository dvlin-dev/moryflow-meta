import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  type Result,
  Ok,
  Err,
  createError,
  MemoryErrorCode,
  CreateRelationInputSchema,
  type CreateRelationInput,
  type Relation,
} from '@moryflow/memory-core';

interface RawRelationRow {
  id: string;
  source_id: string;
  target_id: string;
  type: string;
  properties: Record<string, unknown>;
  user_id: string;
  confidence: number;
  valid_from: Date | null;
  valid_to: Date | null;
  created_at: Date;
}

@Injectable()
export class RelationService {
  private readonly logger = new Logger(RelationService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new relation between entities
   */
  async create(input: CreateRelationInput): Promise<Result<Relation>> {
    const parsed = CreateRelationInputSchema.safeParse(input);
    if (!parsed.success) {
      return Err(
        createError(MemoryErrorCode.VALIDATION_ERROR, parsed.error.message, {
          context: { errors: parsed.error.errors },
        }),
      );
    }

    const validInput = parsed.data;

    try {
      // Verify both entities exist and belong to the user
      const entityCheck = await this.prisma.$queryRaw<{ id: string }[]>`
        SELECT id FROM entities
        WHERE id IN (${validInput.sourceId}::uuid, ${validInput.targetId}::uuid)
          AND user_id = ${validInput.userId}
      `;

      if (entityCheck.length !== 2) {
        return Err(
          createError(MemoryErrorCode.ENTITY_NOT_FOUND, 'One or both entities not found'),
        );
      }

      // Check for self-reference
      if (validInput.sourceId === validInput.targetId) {
        return Err(
          createError(MemoryErrorCode.INVALID_RELATION, 'Cannot create relation to self'),
        );
      }

      const result = await this.prisma.$queryRaw<RawRelationRow[]>`
        INSERT INTO relations (
          source_id, target_id, type, properties, user_id,
          confidence, valid_from, valid_to
        )
        VALUES (
          ${validInput.sourceId}::uuid,
          ${validInput.targetId}::uuid,
          ${validInput.type},
          ${JSON.stringify(validInput.properties)}::jsonb,
          ${validInput.userId},
          ${validInput.confidence},
          ${validInput.validFrom ?? null},
          ${validInput.validTo ?? null}
        )
        RETURNING
          id, source_id, target_id, type, properties, user_id,
          confidence, valid_from, valid_to, created_at
      `;

      const row = result[0];
      if (!row) {
        return Err(createError(MemoryErrorCode.QUERY_FAILED, 'Failed to create relation'));
      }

      return Ok(this.mapToRelation(row));
    } catch (error) {
      this.logger.error('Failed to create relation', error);
      return Err(
        createError(MemoryErrorCode.QUERY_FAILED, 'Failed to create relation', {
          cause: error instanceof Error ? error : new Error(String(error)),
        }),
      );
    }
  }

  /**
   * Create multiple relations in batch
   */
  async createBatch(inputs: CreateRelationInput[]): Promise<Result<Relation[]>> {
    const relations: Relation[] = [];

    for (const input of inputs) {
      const result = await this.create(input);
      if (!result.ok) {
        this.logger.warn(`Failed to create relation: ${input.type}`, result.error);
        continue;
      }
      relations.push(result.value);
    }

    return Ok(relations);
  }

  /**
   * Get relation by ID
   */
  async getById(id: string, userId: string): Promise<Result<Relation | null>> {
    try {
      const result = await this.prisma.$queryRaw<RawRelationRow[]>`
        SELECT id, source_id, target_id, type, properties, user_id,
               confidence, valid_from, valid_to, created_at
        FROM relations
        WHERE id = ${id}::uuid AND user_id = ${userId}
      `;

      const row = result[0];
      return Ok(row ? this.mapToRelation(row) : null);
    } catch (error) {
      this.logger.error('Failed to get relation', error);
      return Err(
        createError(MemoryErrorCode.QUERY_FAILED, 'Failed to get relation', {
          cause: error instanceof Error ? error : new Error(String(error)),
        }),
      );
    }
  }

  /**
   * Get all relations for an entity
   */
  async getByEntityId(
    entityId: string,
    userId: string,
    options?: { direction?: 'outgoing' | 'incoming' | 'both'; type?: string },
  ): Promise<Result<Relation[]>> {
    const direction = options?.direction ?? 'both';

    try {
      let result: RawRelationRow[];

      if (direction === 'outgoing') {
        result = await this.prisma.$queryRaw<RawRelationRow[]>`
          SELECT id, source_id, target_id, type, properties, user_id,
                 confidence, valid_from, valid_to, created_at
          FROM relations
          WHERE source_id = ${entityId}::uuid AND user_id = ${userId}
          ${options?.type ? this.prisma.$queryRaw`AND type = ${options.type}` : this.prisma.$queryRaw``}
          ORDER BY created_at DESC
        `;
      } else if (direction === 'incoming') {
        result = await this.prisma.$queryRaw<RawRelationRow[]>`
          SELECT id, source_id, target_id, type, properties, user_id,
                 confidence, valid_from, valid_to, created_at
          FROM relations
          WHERE target_id = ${entityId}::uuid AND user_id = ${userId}
          ${options?.type ? this.prisma.$queryRaw`AND type = ${options.type}` : this.prisma.$queryRaw``}
          ORDER BY created_at DESC
        `;
      } else {
        result = await this.prisma.$queryRaw<RawRelationRow[]>`
          SELECT id, source_id, target_id, type, properties, user_id,
                 confidence, valid_from, valid_to, created_at
          FROM relations
          WHERE (source_id = ${entityId}::uuid OR target_id = ${entityId}::uuid)
            AND user_id = ${userId}
          ${options?.type ? this.prisma.$queryRaw`AND type = ${options.type}` : this.prisma.$queryRaw``}
          ORDER BY created_at DESC
        `;
      }

      return Ok(result.map((row) => this.mapToRelation(row)));
    } catch (error) {
      this.logger.error('Failed to get relations', error);
      return Err(
        createError(MemoryErrorCode.QUERY_FAILED, 'Failed to get relations', {
          cause: error instanceof Error ? error : new Error(String(error)),
        }),
      );
    }
  }

  /**
   * Find relation between two entities
   */
  async findBetween(
    sourceId: string,
    targetId: string,
    userId: string,
    type?: string,
  ): Promise<Result<Relation | null>> {
    try {
      let result: RawRelationRow[];

      if (type) {
        result = await this.prisma.$queryRaw<RawRelationRow[]>`
          SELECT id, source_id, target_id, type, properties, user_id,
                 confidence, valid_from, valid_to, created_at
          FROM relations
          WHERE source_id = ${sourceId}::uuid
            AND target_id = ${targetId}::uuid
            AND user_id = ${userId}
            AND type = ${type}
          LIMIT 1
        `;
      } else {
        result = await this.prisma.$queryRaw<RawRelationRow[]>`
          SELECT id, source_id, target_id, type, properties, user_id,
                 confidence, valid_from, valid_to, created_at
          FROM relations
          WHERE source_id = ${sourceId}::uuid
            AND target_id = ${targetId}::uuid
            AND user_id = ${userId}
          LIMIT 1
        `;
      }

      const row = result[0];
      return Ok(row ? this.mapToRelation(row) : null);
    } catch (error) {
      this.logger.error('Failed to find relation', error);
      return Err(
        createError(MemoryErrorCode.QUERY_FAILED, 'Failed to find relation', {
          cause: error instanceof Error ? error : new Error(String(error)),
        }),
      );
    }
  }

  /**
   * List all relations for a user
   */
  async list(
    userId: string,
    options?: { type?: string; limit?: number; offset?: number },
  ): Promise<Result<Relation[]>> {
    const limit = options?.limit ?? 50;
    const offset = options?.offset ?? 0;

    try {
      let result: RawRelationRow[];

      if (options?.type) {
        result = await this.prisma.$queryRaw<RawRelationRow[]>`
          SELECT id, source_id, target_id, type, properties, user_id,
                 confidence, valid_from, valid_to, created_at
          FROM relations
          WHERE user_id = ${userId} AND type = ${options.type}
          ORDER BY created_at DESC
          LIMIT ${limit} OFFSET ${offset}
        `;
      } else {
        result = await this.prisma.$queryRaw<RawRelationRow[]>`
          SELECT id, source_id, target_id, type, properties, user_id,
                 confidence, valid_from, valid_to, created_at
          FROM relations
          WHERE user_id = ${userId}
          ORDER BY created_at DESC
          LIMIT ${limit} OFFSET ${offset}
        `;
      }

      return Ok(result.map((row) => this.mapToRelation(row)));
    } catch (error) {
      this.logger.error('Failed to list relations', error);
      return Err(
        createError(MemoryErrorCode.QUERY_FAILED, 'Failed to list relations', {
          cause: error instanceof Error ? error : new Error(String(error)),
        }),
      );
    }
  }

  /**
   * Delete a relation
   */
  async delete(id: string, userId: string): Promise<Result<boolean>> {
    try {
      const result = await this.prisma.$executeRaw`
        DELETE FROM relations
        WHERE id = ${id}::uuid AND user_id = ${userId}
      `;

      return Ok(result > 0);
    } catch (error) {
      this.logger.error('Failed to delete relation', error);
      return Err(
        createError(MemoryErrorCode.QUERY_FAILED, 'Failed to delete relation', {
          cause: error instanceof Error ? error : new Error(String(error)),
        }),
      );
    }
  }

  /**
   * Count relations for a user
   */
  async count(userId: string, type?: string): Promise<Result<number>> {
    try {
      let result: { count: bigint }[];

      if (type) {
        result = await this.prisma.$queryRaw<{ count: bigint }[]>`
          SELECT COUNT(*) as count FROM relations
          WHERE user_id = ${userId} AND type = ${type}
        `;
      } else {
        result = await this.prisma.$queryRaw<{ count: bigint }[]>`
          SELECT COUNT(*) as count FROM relations
          WHERE user_id = ${userId}
        `;
      }

      const row = result[0];
      return Ok(row ? Number(row.count) : 0);
    } catch (error) {
      this.logger.error('Failed to count relations', error);
      return Err(
        createError(MemoryErrorCode.QUERY_FAILED, 'Failed to count relations', {
          cause: error instanceof Error ? error : new Error(String(error)),
        }),
      );
    }
  }

  private mapToRelation(row: RawRelationRow): Relation {
    return {
      id: row.id,
      sourceId: row.source_id,
      targetId: row.target_id,
      type: row.type,
      properties: row.properties,
      userId: row.user_id,
      confidence: row.confidence,
      validFrom: row.valid_from,
      validTo: row.valid_to,
      createdAt: row.created_at,
    };
  }
}
