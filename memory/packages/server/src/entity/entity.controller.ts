import {
  Controller,
  Get,
  Post,
  Put,
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
import { EntityService } from './entity.service.js';
import type { CreateEntityInput, UpdateEntityInput, Entity } from '@moryflow/memory-core';

class CreateEntityDto {
  type!: 'person' | 'organization' | 'location' | 'concept' | 'event' | 'custom';
  name!: string;
  properties?: Record<string, unknown>;
  userId!: string;
  source?: string;
  confidence?: number;
}

class UpdateEntityDto {
  type?: 'person' | 'organization' | 'location' | 'concept' | 'event' | 'custom';
  name?: string;
  properties?: Record<string, unknown>;
  confidence?: number;
}

class SearchEntityDto {
  query!: string;
  userId!: string;
  type?: string;
  limit?: number;
  threshold?: number;
}

@ApiTags('entities')
@Controller('entities')
export class EntityController {
  constructor(private readonly entityService: EntityService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new entity' })
  @ApiResponse({ status: 201, description: 'Entity created successfully' })
  async create(@Body() dto: CreateEntityDto): Promise<Entity> {
    const input: CreateEntityInput = {
      type: dto.type,
      name: dto.name,
      properties: dto.properties ?? {},
      userId: dto.userId,
      source: dto.source,
      confidence: dto.confidence ?? 1.0,
    };

    const result = await this.entityService.create(input);

    if (!result.ok) {
      throw new BadRequestException(result.error.message);
    }

    return result.value;
  }

  @Post('search')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Search entities by semantic similarity' })
  async search(@Body() dto: SearchEntityDto): Promise<Array<Entity & { score: number }>> {
    const result = await this.entityService.search(dto.userId, dto.query, {
      type: dto.type,
      limit: dto.limit,
      threshold: dto.threshold,
    });

    if (!result.ok) {
      throw new BadRequestException(result.error.message);
    }

    return result.value;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get entity by ID' })
  @ApiQuery({ name: 'userId', required: true })
  async getById(
    @Param('id') id: string,
    @Query('userId') userId: string,
  ): Promise<Entity> {
    if (!userId) {
      throw new BadRequestException('userId is required');
    }

    const result = await this.entityService.getById(id, userId);

    if (!result.ok) {
      throw new BadRequestException(result.error.message);
    }

    if (!result.value) {
      throw new NotFoundException('Entity not found');
    }

    return result.value;
  }

  @Get()
  @ApiOperation({ summary: 'List entities' })
  @ApiQuery({ name: 'userId', required: true })
  @ApiQuery({ name: 'type', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'offset', required: false })
  async list(
    @Query('userId') userId: string,
    @Query('type') type?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ): Promise<Entity[]> {
    if (!userId) {
      throw new BadRequestException('userId is required');
    }

    const result = await this.entityService.list(userId, {
      type,
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined,
    });

    if (!result.ok) {
      throw new BadRequestException(result.error.message);
    }

    return result.value;
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an entity' })
  @ApiQuery({ name: 'userId', required: true })
  async update(
    @Param('id') id: string,
    @Query('userId') userId: string,
    @Body() dto: UpdateEntityDto,
  ): Promise<Entity> {
    if (!userId) {
      throw new BadRequestException('userId is required');
    }

    const input: UpdateEntityInput = {
      type: dto.type,
      name: dto.name,
      properties: dto.properties,
      confidence: dto.confidence,
    };

    const result = await this.entityService.update(id, userId, input);

    if (!result.ok) {
      if (result.error.code === 'NOT_FOUND') {
        throw new NotFoundException(result.error.message);
      }
      throw new BadRequestException(result.error.message);
    }

    return result.value;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an entity' })
  @ApiQuery({ name: 'userId', required: true })
  async delete(
    @Param('id') id: string,
    @Query('userId') userId: string,
  ): Promise<void> {
    if (!userId) {
      throw new BadRequestException('userId is required');
    }

    const result = await this.entityService.delete(id, userId);

    if (!result.ok) {
      throw new BadRequestException(result.error.message);
    }

    if (!result.value) {
      throw new NotFoundException('Entity not found');
    }
  }
}
