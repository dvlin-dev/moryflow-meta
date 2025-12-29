import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { MemoryService } from './memory.service';
import { ZodValidationPipe } from '../pipes/zod-validation.pipe';
import {
  AddMemoryRequestSchema,
  SearchMemoryRequestSchema,
  type AddMemoryRequest,
  type SearchMemoryRequest,
  type MemoryItemResponse,
  type SearchResultResponse,
} from './dto';
import type { AddMemoryInput, SearchOptions } from '@moryflow/memory-core';

@ApiTags('memories')
@Controller('memories')
export class MemoryController {
  constructor(private readonly memoryService: MemoryService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add a new memory' })
  @ApiResponse({ status: 201, description: 'Memory created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  async add(
    @Body(new ZodValidationPipe(AddMemoryRequestSchema))
    dto: AddMemoryRequest,
  ): Promise<MemoryItemResponse> {
    const input: AddMemoryInput = {
      content: dto.content,
      metadata: {
        userId: dto.metadata.userId,
        agentId: dto.metadata.agentId,
        sessionId: dto.metadata.sessionId,
        source: dto.metadata.source ?? 'conversation',
        importance: dto.metadata.importance ?? 0.5,
        tags: dto.metadata.tags ?? [],
      },
      extractEntities: dto.extractEntities ?? false,
      extractRelations: dto.extractRelations ?? false,
    };

    const result = await this.memoryService.add(input);

    if (!result.ok) {
      throw new BadRequestException(result.error.message);
    }

    return this.toResponse(result.value);
  }

  @Post('search')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Search memories by semantic similarity' })
  @ApiResponse({ status: 200, description: 'Search results' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  async search(
    @Body(new ZodValidationPipe(SearchMemoryRequestSchema))
    dto: SearchMemoryRequest,
  ): Promise<SearchResultResponse> {
    const options: SearchOptions = {
      userId: dto.userId,
      limit: dto.limit ?? 10,
      threshold: dto.threshold ?? 0.7,
      includeGraph: dto.includeGraph ?? false,
      graphDepth: dto.graphDepth ?? 2,
      filter: dto.filter,
    };

    const result = await this.memoryService.search(dto.query, options);

    if (!result.ok) {
      throw new BadRequestException(result.error.message);
    }

    return {
      items: result.value.items.map((item) => ({
        ...this.toResponse(item),
        score: item.score,
        source: item.source,
      })),
      took: result.value.took,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a memory by ID' })
  @ApiQuery({ name: 'userId', required: true })
  @ApiResponse({ status: 200, description: 'Memory found' })
  @ApiResponse({ status: 404, description: 'Memory not found' })
  async getById(
    @Param('id') id: string,
    @Query('userId') userId: string,
  ): Promise<MemoryItemResponse> {
    if (!userId) {
      throw new BadRequestException('userId is required');
    }

    const result = await this.memoryService.getById(id, userId);

    if (!result.ok) {
      throw new BadRequestException(result.error.message);
    }

    if (!result.value) {
      throw new NotFoundException('Memory not found');
    }

    return this.toResponse(result.value);
  }

  @Get()
  @ApiOperation({ summary: 'List memories for a user' })
  @ApiQuery({ name: 'userId', required: true })
  @ApiQuery({ name: 'agentId', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'offset', required: false })
  @ApiResponse({ status: 200, description: 'List of memories' })
  async list(
    @Query('userId') userId: string,
    @Query('agentId') agentId?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ): Promise<MemoryItemResponse[]> {
    if (!userId) {
      throw new BadRequestException('userId is required');
    }

    const result = await this.memoryService.list(userId, {
      agentId,
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined,
    });

    if (!result.ok) {
      throw new BadRequestException(result.error.message);
    }

    return result.value.map((item) => this.toResponse(item));
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a memory' })
  @ApiQuery({ name: 'userId', required: true })
  @ApiResponse({ status: 204, description: 'Memory deleted' })
  @ApiResponse({ status: 404, description: 'Memory not found' })
  async delete(
    @Param('id') id: string,
    @Query('userId') userId: string,
  ): Promise<void> {
    if (!userId) {
      throw new BadRequestException('userId is required');
    }

    const result = await this.memoryService.delete(id, userId);

    if (!result.ok) {
      throw new BadRequestException(result.error.message);
    }

    if (!result.value) {
      throw new NotFoundException('Memory not found');
    }
  }

  private toResponse(item: {
    id: string;
    content: string;
    metadata: {
      userId: string;
      agentId?: string;
      sessionId?: string;
      source?: string;
      importance?: number;
      tags?: string[];
    };
    createdAt: Date;
    updatedAt: Date;
  }): MemoryItemResponse {
    return {
      id: item.id,
      content: item.content,
      metadata: {
        userId: item.metadata.userId,
        agentId: item.metadata.agentId,
        sessionId: item.metadata.sessionId,
        source: (item.metadata.source as 'conversation' | 'document' | 'extraction') ?? 'conversation',
        importance: item.metadata.importance,
        tags: item.metadata.tags,
      },
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    };
  }
}
