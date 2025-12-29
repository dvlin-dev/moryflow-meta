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
import { RelationService } from './relation.service';
import type { CreateRelationInput, Relation } from '@moryflow/memory-core';

class CreateRelationDto {
  sourceId!: string;
  targetId!: string;
  type!: string;
  properties?: Record<string, unknown>;
  userId!: string;
  confidence?: number;
  validFrom?: string;
  validTo?: string;
}

@ApiTags('relations')
@Controller('relations')
export class RelationController {
  constructor(private readonly relationService: RelationService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new relation' })
  @ApiResponse({ status: 201, description: 'Relation created successfully' })
  async create(@Body() dto: CreateRelationDto): Promise<Relation> {
    const input: CreateRelationInput = {
      sourceId: dto.sourceId,
      targetId: dto.targetId,
      type: dto.type,
      properties: dto.properties ?? {},
      userId: dto.userId,
      confidence: dto.confidence ?? 1.0,
      validFrom: dto.validFrom ? new Date(dto.validFrom) : undefined,
      validTo: dto.validTo ? new Date(dto.validTo) : undefined,
    };

    const result = await this.relationService.create(input);

    if (!result.ok) {
      throw new BadRequestException(result.error.message);
    }

    return result.value;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get relation by ID' })
  @ApiQuery({ name: 'userId', required: true })
  async getById(
    @Param('id') id: string,
    @Query('userId') userId: string,
  ): Promise<Relation> {
    if (!userId) {
      throw new BadRequestException('userId is required');
    }

    const result = await this.relationService.getById(id, userId);

    if (!result.ok) {
      throw new BadRequestException(result.error.message);
    }

    if (!result.value) {
      throw new NotFoundException('Relation not found');
    }

    return result.value;
  }

  @Get()
  @ApiOperation({ summary: 'List relations' })
  @ApiQuery({ name: 'userId', required: true })
  @ApiQuery({ name: 'entityId', required: false, description: 'Filter by entity ID' })
  @ApiQuery({ name: 'direction', required: false, enum: ['outgoing', 'incoming', 'both'] })
  @ApiQuery({ name: 'type', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'offset', required: false })
  async list(
    @Query('userId') userId: string,
    @Query('entityId') entityId?: string,
    @Query('direction') direction?: 'outgoing' | 'incoming' | 'both',
    @Query('type') type?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ): Promise<Relation[]> {
    if (!userId) {
      throw new BadRequestException('userId is required');
    }

    if (entityId) {
      const result = await this.relationService.getByEntityId(entityId, userId, {
        direction,
        type,
      });

      if (!result.ok) {
        throw new BadRequestException(result.error.message);
      }

      return result.value;
    }

    const result = await this.relationService.list(userId, {
      type,
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined,
    });

    if (!result.ok) {
      throw new BadRequestException(result.error.message);
    }

    return result.value;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a relation' })
  @ApiQuery({ name: 'userId', required: true })
  async delete(
    @Param('id') id: string,
    @Query('userId') userId: string,
  ): Promise<void> {
    if (!userId) {
      throw new BadRequestException('userId is required');
    }

    const result = await this.relationService.delete(id, userId);

    if (!result.ok) {
      throw new BadRequestException(result.error.message);
    }

    if (!result.value) {
      throw new NotFoundException('Relation not found');
    }
  }
}
