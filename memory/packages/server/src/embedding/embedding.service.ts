import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';
import {
  type Result,
  Ok,
  Err,
  createError,
  MemoryErrorCode,
  type EmbeddingResult,
} from '@moryflow/memory-core';

export interface EmbeddingServiceConfig {
  apiKey: string;
  baseUrl?: string;
  model?: string;
  dimension?: number;
  batchSize?: number;
}

@Injectable()
export class EmbeddingService {
  private readonly logger = new Logger(EmbeddingService.name);
  private readonly client: OpenAI;
  private readonly model: string;
  private readonly dimension: number;
  private readonly batchSize: number;

  constructor() {
    const apiKey = process.env.EMBEDDING_API_KEY;
    const baseUrl =
      process.env.EMBEDDING_BASE_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1';
    this.model = process.env.EMBEDDING_MODEL || 'text-embedding-v4';
    this.dimension = parseInt(process.env.EMBEDDING_DIMENSION || '1024', 10);
    this.batchSize = 10; // DashScope limit

    if (!apiKey) {
      throw new Error('EMBEDDING_API_KEY environment variable is required');
    }

    this.client = new OpenAI({
      apiKey,
      baseURL: baseUrl,
    });

    this.logger.log(`Embedding service initialized with model: ${this.model}, dimension: ${this.dimension}`);
  }

  /**
   * Generate embedding for a single text
   */
  async embed(text: string): Promise<Result<number[]>> {
    const result = await this.embedBatch([text]);
    if (!result.ok) {
      return result;
    }

    const firstEmbedding = result.value[0];
    if (!firstEmbedding) {
      return Err(
        createError(MemoryErrorCode.EMBEDDING_FAILED, 'No embedding returned'),
      );
    }

    return Ok(firstEmbedding.embedding);
  }

  /**
   * Generate embeddings for multiple texts
   */
  async embedBatch(texts: string[]): Promise<Result<EmbeddingResult[]>> {
    if (texts.length === 0) {
      return Ok([]);
    }

    try {
      const results: EmbeddingResult[] = [];

      // Process in batches due to API limits
      for (let i = 0; i < texts.length; i += this.batchSize) {
        const batch = texts.slice(i, i + this.batchSize);
        const batchResults = await this.processBatch(batch);

        if (!batchResults.ok) {
          return batchResults;
        }

        results.push(...batchResults.value);
      }

      return Ok(results);
    } catch (error) {
      this.logger.error('Failed to generate embeddings', error);
      return Err(
        createError(MemoryErrorCode.EMBEDDING_FAILED, 'Failed to generate embeddings', {
          cause: error instanceof Error ? error : new Error(String(error)),
        }),
      );
    }
  }

  /**
   * Process a single batch of texts
   */
  private async processBatch(texts: string[]): Promise<Result<EmbeddingResult[]>> {
    try {
      const response = await this.client.embeddings.create({
        model: this.model,
        input: texts,
        dimensions: this.dimension,
      });

      const results: EmbeddingResult[] = response.data.map((item) => ({
        embedding: item.embedding,
        model: response.model,
        usage: response.usage
          ? {
              promptTokens: response.usage.prompt_tokens,
              totalTokens: response.usage.total_tokens,
            }
          : undefined,
      }));

      return Ok(results);
    } catch (error) {
      this.logger.error('Batch embedding failed', error);

      if (error instanceof OpenAI.APIError) {
        if (error.status === 429) {
          return Err(
            createError(MemoryErrorCode.RATE_LIMITED, 'Rate limit exceeded', {
              cause: error,
              context: { status: error.status },
            }),
          );
        }
      }

      return Err(
        createError(MemoryErrorCode.EMBEDDING_FAILED, 'Batch embedding failed', {
          cause: error instanceof Error ? error : new Error(String(error)),
        }),
      );
    }
  }

  /**
   * Get the configured dimension
   */
  getDimension(): number {
    return this.dimension;
  }

  /**
   * Get the configured model
   */
  getModel(): string {
    return this.model;
  }
}
