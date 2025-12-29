import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { GraphService } from './graph.service';
import type { Entity, Relation, SubGraph } from '@moryflow/memory-core';

interface TraversalNode {
  entity: Entity;
  depth: number;
  path: string[];
}

interface TraversalResult {
  nodes: TraversalNode[];
  subGraph: SubGraph;
}

class TraverseDto {
  entityId!: string;
  userId!: string;
  depth?: number;
  direction?: 'outgoing' | 'incoming' | 'both';
  relationTypes?: string[];
  limit?: number;
}

class FindPathDto {
  sourceId!: string;
  targetId!: string;
  userId!: string;
  maxDepth?: number;
}

class GetSubGraphDto {
  entityIds!: string[];
  userId!: string;
}

@ApiTags('graph')
@Controller('graph')
export class GraphController {
  constructor(private readonly graphService: GraphService) {}

  @Post('traverse')
  @ApiOperation({ summary: 'Traverse the graph from a starting entity' })
  async traverse(@Body() dto: TraverseDto): Promise<TraversalResult> {
    const result = await this.graphService.traverse(dto.entityId, dto.userId, {
      depth: dto.depth,
      direction: dto.direction,
      relationTypes: dto.relationTypes,
      limit: dto.limit,
    });

    if (!result.ok) {
      throw new BadRequestException(result.error.message);
    }

    return result.value;
  }

  @Post('path')
  @ApiOperation({ summary: 'Find shortest path between two entities' })
  async findPath(@Body() dto: FindPathDto): Promise<TraversalNode[]> {
    const result = await this.graphService.findPath(
      dto.sourceId,
      dto.targetId,
      dto.userId,
      dto.maxDepth,
    );

    if (!result.ok) {
      throw new BadRequestException(result.error.message);
    }

    if (!result.value) {
      throw new NotFoundException('No path found between entities');
    }

    return result.value;
  }

  @Post('subgraph')
  @ApiOperation({ summary: 'Get subgraph containing specified entities' })
  async getSubGraph(@Body() dto: GetSubGraphDto): Promise<SubGraph> {
    const result = await this.graphService.getSubGraph(dto.entityIds, dto.userId);

    if (!result.ok) {
      throw new BadRequestException(result.error.message);
    }

    return result.value;
  }

  @Get('neighbors/:entityId')
  @ApiOperation({ summary: 'Get neighbors of an entity' })
  @ApiQuery({ name: 'userId', required: true })
  @ApiQuery({ name: 'depth', required: false })
  async getNeighbors(
    @Param('entityId') entityId: string,
    @Query('userId') userId: string,
    @Query('depth') depth?: string,
  ): Promise<Entity[]> {
    if (!userId) {
      throw new BadRequestException('userId is required');
    }

    const result = await this.graphService.getNeighbors(
      entityId,
      userId,
      depth ? parseInt(depth, 10) : 1,
    );

    if (!result.ok) {
      throw new BadRequestException(result.error.message);
    }

    return result.value;
  }
}
