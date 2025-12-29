import { Injectable, Logger } from '@nestjs/common';
import { z } from 'zod';
import {
  type Result,
  Ok,
  Err,
  createError,
  MemoryErrorCode,
  type ExtractedEntity,
  type ExtractedRelation,
  type ExtractionResult,
} from '@moryflow/memory-core';
import { LLMService } from '../llm/llm.service.js';
import {
  ENTITY_EXTRACTION_SYSTEM_PROMPT,
  RELATION_EXTRACTION_SYSTEM_PROMPT,
  buildEntityExtractionPrompt,
  buildRelationExtractionPrompt,
} from './prompts.js';

// Zod schemas for LLM structured output
const ExtractedEntitySchema = z.object({
  type: z.enum(['person', 'organization', 'location', 'concept', 'event', 'custom']),
  name: z.string(),
  properties: z.record(z.string(), z.unknown()).optional(),
  confidence: z.number().min(0).max(1),
});

const EntityExtractionResultSchema = z.object({
  entities: z.array(ExtractedEntitySchema),
});

const ExtractedRelationSchema = z.object({
  sourceEntity: z.string(),
  targetEntity: z.string(),
  type: z.string(),
  properties: z.record(z.string(), z.unknown()).optional(),
  confidence: z.number().min(0).max(1),
});

const RelationExtractionResultSchema = z.object({
  relations: z.array(ExtractedRelationSchema),
});

@Injectable()
export class ExtractService {
  private readonly logger = new Logger(ExtractService.name);

  constructor(private readonly llm: LLMService) {}

  /**
   * Extract entities from text
   */
  async extractEntities(text: string): Promise<Result<ExtractedEntity[]>> {
    if (!text.trim()) {
      return Ok([]);
    }

    try {
      const prompt = buildEntityExtractionPrompt(text);
      const result = await this.llm.generateStructured(
        prompt,
        EntityExtractionResultSchema,
        {
          systemPrompt: ENTITY_EXTRACTION_SYSTEM_PROMPT,
          temperature: 0.1,
        },
      );

      if (!result.ok) {
        return Err(result.error);
      }

      const entities: ExtractedEntity[] = result.value.entities.map((e) => ({
        type: e.type,
        name: e.name,
        properties: e.properties,
        confidence: e.confidence,
      }));

      this.logger.debug(`Extracted ${entities.length} entities from text`);
      return Ok(entities);
    } catch (error) {
      this.logger.error('Entity extraction failed', error);
      return Err(
        createError(MemoryErrorCode.EXTRACTION_FAILED, 'Failed to extract entities', {
          cause: error instanceof Error ? error : new Error(String(error)),
        }),
      );
    }
  }

  /**
   * Extract relations from text given a list of entities
   */
  async extractRelations(
    text: string,
    entities: ExtractedEntity[],
  ): Promise<Result<ExtractedRelation[]>> {
    if (!text.trim() || entities.length < 2) {
      return Ok([]);
    }

    try {
      const entityNames = entities.map((e) => e.name);
      const prompt = buildRelationExtractionPrompt(text, entityNames);

      const result = await this.llm.generateStructured(
        prompt,
        RelationExtractionResultSchema,
        {
          systemPrompt: RELATION_EXTRACTION_SYSTEM_PROMPT,
          temperature: 0.1,
        },
      );

      if (!result.ok) {
        return Err(result.error);
      }

      // Filter relations to only include known entities
      const entityNameSet = new Set(entityNames.map((n) => n.toLowerCase()));
      const relations: ExtractedRelation[] = result.value.relations
        .filter(
          (r) =>
            entityNameSet.has(r.sourceEntity.toLowerCase()) &&
            entityNameSet.has(r.targetEntity.toLowerCase()),
        )
        .map((r) => ({
          sourceEntity: r.sourceEntity,
          targetEntity: r.targetEntity,
          type: r.type,
          properties: r.properties,
          confidence: r.confidence,
        }));

      this.logger.debug(`Extracted ${relations.length} relations from text`);
      return Ok(relations);
    } catch (error) {
      this.logger.error('Relation extraction failed', error);
      return Err(
        createError(MemoryErrorCode.EXTRACTION_FAILED, 'Failed to extract relations', {
          cause: error instanceof Error ? error : new Error(String(error)),
        }),
      );
    }
  }

  /**
   * Extract both entities and relations from text
   */
  async extract(text: string): Promise<Result<ExtractionResult>> {
    // First extract entities
    const entitiesResult = await this.extractEntities(text);
    if (!entitiesResult.ok) {
      return Err(entitiesResult.error);
    }

    const entities = entitiesResult.value;

    // Then extract relations if we have at least 2 entities
    let relations: ExtractedRelation[] = [];
    if (entities.length >= 2) {
      const relationsResult = await this.extractRelations(text, entities);
      if (relationsResult.ok) {
        relations = relationsResult.value;
      } else {
        this.logger.warn('Relation extraction failed, continuing with entities only');
      }
    }

    return Ok({ entities, relations });
  }
}
