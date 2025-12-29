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
import { EntityService } from './entity.service';
import { ZodValidationPipe } from '../pipes/zod-validation.pipe';
import {
  CreateEntityRequestSchema,
  UpdateEntityRequestSchema,
  SearchEntityRequestSchema,
  type CreateEntityRequest,
  type UpdateEntityRequest,
  type SearchEntityRequest,
} from './dto';
import type { CreateEntityInput, UpdateEntityInput, Entity } from '@moryflow/memory-core';

@ApiTags('entities')
@Controller('entities')
export class EntityController {
  constructor(private readonly entityService: EntityService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new entity' })
  @ApiResponse({ status: 201, description: 'Entity created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  async create(
    @Body(new ZodValidationPipe(CreateEntityRequestSchema))
    dto: CreateEntityRequest,
  ): Promise<Entity> {
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
  @ApiResponse({ status: 200, description: 'Search results' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  async search(
    @Body(new ZodValidationPipe(SearchEntityRequestSchema))
    dto: SearchEntityRequest,
  ): Promise<Array<Entity & { score: number }>> {
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
  @ApiResponse({ status: 200, description: 'Entity found' })
  @ApiResponse({ status: 404, description: 'Entity not found' })
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
  @ApiResponse({ status: 200, description: 'List of entities' })
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
  @ApiResponse({ status: 200, description: 'Entity updated' })
  @ApiResponse({ status: 404, description: 'Entity not found' })
  async update(
    @Param('id') id: string,
    @Query('userId') userId: string,
    @Body(new ZodValidationPipe(UpdateEntityRequestSchema))
    dto: UpdateEntityRequest,
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
  @ApiResponse({ status: 204, description: 'Entity deleted' })
  @ApiResponse({ status: 404, description: 'Entity not found' })
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
