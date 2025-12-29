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
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { GraphService } from './graph.service';
import { ZodValidationPipe } from '../pipes/zod-validation.pipe';
import {
  TraverseRequestSchema,
  FindPathRequestSchema,
  GetSubGraphRequestSchema,
  type TraverseRequest,
  type FindPathRequest,
  type GetSubGraphRequest,
  type TraversalNode,
  type TraversalResult,
} from './dto';
import type { Entity, SubGraph } from '@moryflow/memory-core';

@ApiTags('graph')
@Controller('graph')
export class GraphController {
  constructor(private readonly graphService: GraphService) {}

  @Post('traverse')
  @ApiOperation({ summary: 'Traverse the graph from a starting entity' })
  @ApiResponse({ status: 200, description: 'Traversal result' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  async traverse(
    @Body(new ZodValidationPipe(TraverseRequestSchema))
    dto: TraverseRequest,
  ): Promise<TraversalResult> {
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
  @ApiResponse({ status: 200, description: 'Path found' })
  @ApiResponse({ status: 404, description: 'No path found' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  async findPath(
    @Body(new ZodValidationPipe(FindPathRequestSchema))
    dto: FindPathRequest,
  ): Promise<TraversalNode[]> {
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
  @ApiResponse({ status: 200, description: 'Subgraph result' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  async getSubGraph(
    @Body(new ZodValidationPipe(GetSubGraphRequestSchema))
    dto: GetSubGraphRequest,
  ): Promise<SubGraph> {
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
  @ApiResponse({ status: 200, description: 'List of neighbor entities' })
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
