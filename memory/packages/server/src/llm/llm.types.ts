import type { z } from 'zod';
import type { Result } from '@moryflow/memory-core';

export interface LLMConfig {
  provider: 'openai' | 'anthropic' | 'custom';
  apiKey: string;
  baseUrl?: string;
  model?: string;
}

export interface GenerateOptions {
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
}

export interface LLMAdapter {
  /**
   * Generate text response
   */
  generate(prompt: string, options?: GenerateOptions): Promise<Result<string>>;

  /**
   * Generate structured output (JSON)
   */
  generateStructured<T>(
    prompt: string,
    schema: z.ZodSchema<T>,
    options?: GenerateOptions,
  ): Promise<Result<T>>;
}
