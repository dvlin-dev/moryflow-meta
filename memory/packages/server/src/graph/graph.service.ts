import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  type Result,
  Ok,
  Err,
  createError,
  MemoryErrorCode,
  TraverseOptionsSchema,
  type TraverseOptions,
  type Entity,
  type Relation,
  type SubGraph,
} from '@moryflow/memory-core';

interface TraversalNode {
  entity: Entity;
  depth: number;
  path: string[];
}

interface TraversalResult {
  nodes: TraversalNode[];
  subGraph: SubGraph;
}

interface RawTraversalRow {
  id: string;
  type: string;
  name: string;
  properties: Record<string, unknown>;
  user_id: string;
  source: string | null;
  confidence: number;
  created_at: Date;
  updated_at: Date;
  depth: number;
  path: string[];
}

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
export class GraphService {
  private readonly logger = new Logger(GraphService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Traverse the graph from a starting entity using recursive CTE
   */
  async traverse(
    startEntityId: string,
    userId: string,
    options?: Partial<TraverseOptions>,
  ): Promise<Result<TraversalResult>> {
    const parsed = TraverseOptionsSchema.safeParse(options ?? {});
    if (!parsed.success) {
      return Err(
        createError(MemoryErrorCode.VALIDATION_ERROR, parsed.error.message),
      );
    }

    const { depth, direction, relationTypes, limit } = parsed.data;

    try {
      // Build the recursive CTE based on direction
      let traversalResult: RawTraversalRow[];

      if (direction === 'outgoing') {
        traversalResult = await this.traverseOutgoing(
          startEntityId,
          userId,
          depth,
          limit,
          relationTypes,
        );
      } else if (direction === 'incoming') {
        traversalResult = await this.traverseIncoming(
          startEntityId,
          userId,
          depth,
          limit,
          relationTypes,
        );
      } else {
        traversalResult = await this.traverseBoth(
          startEntityId,
          userId,
          depth,
          limit,
          relationTypes,
        );
      }

      // Map to entities
      const entities = traversalResult.map((row) => this.mapToEntity(row));
      const entityIds = entities.map((e) => e.id);

      // Get all relations between the traversed entities
      const relations = await this.getRelationsBetween(entityIds, userId);

      // Build traversal nodes
      const nodes: TraversalNode[] = traversalResult.map((row) => ({
        entity: this.mapToEntity(row),
        depth: row.depth,
        path: row.path,
      }));

      return Ok({
        nodes,
        subGraph: {
          entities,
          relations: relations.ok ? relations.value : [],
        },
      });
    } catch (error) {
      this.logger.error('Failed to traverse graph', error);
      return Err(
        createError(MemoryErrorCode.QUERY_FAILED, 'Failed to traverse graph', {
          cause: error instanceof Error ? error : new Error(String(error)),
        }),
      );
    }
  }

  /**
   * Get the subgraph containing specified entities and their relations
   */
  async getSubGraph(entityIds: string[], userId: string): Promise<Result<SubGraph>> {
    if (entityIds.length === 0) {
      return Ok({ entities: [], relations: [] });
    }

    try {
      // Get entities
      const entitiesResult = await this.prisma.$queryRaw<RawTraversalRow[]>`
        SELECT id, type, name, properties, user_id, source, confidence,
               created_at, updated_at, 0 as depth, ARRAY[id::text] as path
        FROM entities
        WHERE id = ANY(${entityIds}::uuid[]) AND user_id = ${userId}
      `;

      const entities = entitiesResult.map((row) => this.mapToEntity(row));

      // Get relations
      const relationsResult = await this.getRelationsBetween(entityIds, userId);

      return Ok({
        entities,
        relations: relationsResult.ok ? relationsResult.value : [],
      });
    } catch (error) {
      this.logger.error('Failed to get subgraph', error);
      return Err(
        createError(MemoryErrorCode.QUERY_FAILED, 'Failed to get subgraph', {
          cause: error instanceof Error ? error : new Error(String(error)),
        }),
      );
    }
  }

  /**
   * Find shortest path between two entities
   */
  async findPath(
    sourceId: string,
    targetId: string,
    userId: string,
    maxDepth = 5,
  ): Promise<Result<TraversalNode[] | null>> {
    try {
      const result = await this.prisma.$queryRaw<RawTraversalRow[]>`
        WITH RECURSIVE path_search AS (
          -- Start from source
          SELECT
            e.id, e.type, e.name, e.properties, e.user_id, e.source, e.confidence,
            e.created_at, e.updated_at,
            0 as depth,
            ARRAY[e.id::text] as path
          FROM entities e
          WHERE e.id = ${sourceId}::uuid AND e.user_id = ${userId}

          UNION ALL

          -- Traverse
          SELECT
            e.id, e.type, e.name, e.properties, e.user_id, e.source, e.confidence,
            e.created_at, e.updated_at,
            ps.depth + 1,
            ps.path || e.id::text
          FROM entities e
          JOIN relations r ON (r.target_id = e.id OR r.source_id = e.id)
          JOIN path_search ps ON (
            (r.source_id = ps.id AND r.target_id = e.id) OR
            (r.target_id = ps.id AND r.source_id = e.id)
          )
          WHERE ps.depth < ${maxDepth}
            AND e.user_id = ${userId}
            AND NOT (e.id::text = ANY(ps.path))
        )
        SELECT * FROM path_search
        WHERE id = ${targetId}::uuid
        ORDER BY depth ASC
        LIMIT 1
      `;

      if (result.length === 0) {
        return Ok(null);
      }

      // Reconstruct the full path
      const pathRow = result[0]!;
      const pathEntityIds = pathRow.path;

      const pathEntities = await this.prisma.$queryRaw<RawTraversalRow[]>`
        SELECT id, type, name, properties, user_id, source, confidence,
               created_at, updated_at, 0 as depth, ARRAY[id::text] as path
        FROM entities
        WHERE id = ANY(${pathEntityIds}::uuid[]) AND user_id = ${userId}
      `;

      // Order by path position
      const entityMap = new Map(pathEntities.map((e) => [e.id, e]));
      const orderedNodes: TraversalNode[] = pathEntityIds.map((id, index) => {
        const row = entityMap.get(id);
        return {
          entity: row ? this.mapToEntity(row) : ({} as Entity),
          depth: index,
          path: pathEntityIds.slice(0, index + 1),
        };
      }).filter((n) => n.entity.id);

      return Ok(orderedNodes);
    } catch (error) {
      this.logger.error('Failed to find path', error);
      return Err(
        createError(MemoryErrorCode.QUERY_FAILED, 'Failed to find path', {
          cause: error instanceof Error ? error : new Error(String(error)),
        }),
      );
    }
  }

  /**
   * Get neighbors of an entity at a specific depth
   */
  async getNeighbors(
    entityId: string,
    userId: string,
    depth = 1,
  ): Promise<Result<Entity[]>> {
    const result = await this.traverse(entityId, userId, { depth, limit: 1000 });

    if (!result.ok) {
      return Err(result.error);
    }

    // Filter to only include entities at the exact depth
    const neighbors = result.value.nodes
      .filter((n) => n.depth === depth)
      .map((n) => n.entity);

    return Ok(neighbors);
  }

  // ============ Private Helper Methods ============

  private async traverseOutgoing(
    startId: string,
    userId: string,
    maxDepth: number,
    limit: number,
    relationTypes?: string[],
  ): Promise<RawTraversalRow[]> {
    return this.prisma.$queryRaw<RawTraversalRow[]>`
      WITH RECURSIVE graph AS (
        -- Base case: starting entity
        SELECT
          e.id, e.type, e.name, e.properties, e.user_id, e.source, e.confidence,
          e.created_at, e.updated_at,
          0 as depth,
          ARRAY[e.id::text] as path
        FROM entities e
        WHERE e.id = ${startId}::uuid AND e.user_id = ${userId}

        UNION ALL

        -- Recursive case: follow outgoing relations
        SELECT
          e.id, e.type, e.name, e.properties, e.user_id, e.source, e.confidence,
          e.created_at, e.updated_at,
          g.depth + 1,
          g.path || e.id::text
        FROM entities e
        JOIN relations r ON r.target_id = e.id
        JOIN graph g ON r.source_id = g.id
        WHERE g.depth < ${maxDepth}
          AND e.user_id = ${userId}
          AND NOT (e.id::text = ANY(g.path))
          ${relationTypes && relationTypes.length > 0
            ? this.prisma.$queryRaw`AND r.type = ANY(${relationTypes}::text[])`
            : this.prisma.$queryRaw``}
      )
      SELECT DISTINCT ON (id) * FROM graph
      ORDER BY id, depth
      LIMIT ${limit}
    `;
  }

  private async traverseIncoming(
    startId: string,
    userId: string,
    maxDepth: number,
    limit: number,
    relationTypes?: string[],
  ): Promise<RawTraversalRow[]> {
    return this.prisma.$queryRaw<RawTraversalRow[]>`
      WITH RECURSIVE graph AS (
        -- Base case
        SELECT
          e.id, e.type, e.name, e.properties, e.user_id, e.source, e.confidence,
          e.created_at, e.updated_at,
          0 as depth,
          ARRAY[e.id::text] as path
        FROM entities e
        WHERE e.id = ${startId}::uuid AND e.user_id = ${userId}

        UNION ALL

        -- Recursive case: follow incoming relations
        SELECT
          e.id, e.type, e.name, e.properties, e.user_id, e.source, e.confidence,
          e.created_at, e.updated_at,
          g.depth + 1,
          g.path || e.id::text
        FROM entities e
        JOIN relations r ON r.source_id = e.id
        JOIN graph g ON r.target_id = g.id
        WHERE g.depth < ${maxDepth}
          AND e.user_id = ${userId}
          AND NOT (e.id::text = ANY(g.path))
          ${relationTypes && relationTypes.length > 0
            ? this.prisma.$queryRaw`AND r.type = ANY(${relationTypes}::text[])`
            : this.prisma.$queryRaw``}
      )
      SELECT DISTINCT ON (id) * FROM graph
      ORDER BY id, depth
      LIMIT ${limit}
    `;
  }

  private async traverseBoth(
    startId: string,
    userId: string,
    maxDepth: number,
    limit: number,
    relationTypes?: string[],
  ): Promise<RawTraversalRow[]> {
    return this.prisma.$queryRaw<RawTraversalRow[]>`
      WITH RECURSIVE graph AS (
        -- Base case
        SELECT
          e.id, e.type, e.name, e.properties, e.user_id, e.source, e.confidence,
          e.created_at, e.updated_at,
          0 as depth,
          ARRAY[e.id::text] as path
        FROM entities e
        WHERE e.id = ${startId}::uuid AND e.user_id = ${userId}

        UNION ALL

        -- Recursive case: follow both directions
        SELECT
          e.id, e.type, e.name, e.properties, e.user_id, e.source, e.confidence,
          e.created_at, e.updated_at,
          g.depth + 1,
          g.path || e.id::text
        FROM entities e
        JOIN relations r ON (r.target_id = e.id OR r.source_id = e.id)
        JOIN graph g ON (
          (r.source_id = g.id AND r.target_id = e.id) OR
          (r.target_id = g.id AND r.source_id = e.id)
        )
        WHERE g.depth < ${maxDepth}
          AND e.user_id = ${userId}
          AND NOT (e.id::text = ANY(g.path))
          ${relationTypes && relationTypes.length > 0
            ? this.prisma.$queryRaw`AND r.type = ANY(${relationTypes}::text[])`
            : this.prisma.$queryRaw``}
      )
      SELECT DISTINCT ON (id) * FROM graph
      ORDER BY id, depth
      LIMIT ${limit}
    `;
  }

  private async getRelationsBetween(
    entityIds: string[],
    userId: string,
  ): Promise<Result<Relation[]>> {
    if (entityIds.length === 0) {
      return Ok([]);
    }

    try {
      const result = await this.prisma.$queryRaw<RawRelationRow[]>`
        SELECT id, source_id, target_id, type, properties, user_id,
               confidence, valid_from, valid_to, created_at
        FROM relations
        WHERE user_id = ${userId}
          AND source_id = ANY(${entityIds}::uuid[])
          AND target_id = ANY(${entityIds}::uuid[])
      `;

      return Ok(result.map((row) => this.mapToRelation(row)));
    } catch (error) {
      this.logger.error('Failed to get relations between entities', error);
      return Err(
        createError(MemoryErrorCode.QUERY_FAILED, 'Failed to get relations', {
          cause: error instanceof Error ? error : new Error(String(error)),
        }),
      );
    }
  }

  private mapToEntity(row: RawTraversalRow): Entity {
    return {
      id: row.id,
      type: row.type as Entity['type'],
      name: row.name,
      properties: row.properties,
      userId: row.user_id,
      source: row.source,
      confidence: row.confidence,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
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
