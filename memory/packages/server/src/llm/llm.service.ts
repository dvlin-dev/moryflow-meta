import { Injectable, Logger } from '@nestjs/common';
import type { z } from 'zod';
import type { Result } from '@moryflow/memory-core';
import type { LLMAdapter, GenerateOptions } from './llm.types';
import { OpenAIAdapter } from './openai.adapter';

@Injectable()
export class LLMService implements LLMAdapter {
  private readonly logger = new Logger(LLMService.name);
  private readonly adapter: LLMAdapter;

  constructor() {
    const provider = process.env.LLM_PROVIDER ?? 'openai';
    const apiKey = process.env.LLM_API_KEY;
    const baseUrl = process.env.LLM_BASE_URL;
    const model = process.env.LLM_MODEL;

    if (!apiKey) {
      this.logger.warn('LLM_API_KEY not set, extraction features will be disabled');
      // Create a dummy adapter that returns errors
      this.adapter = {
        generate: async () => ({ ok: false, error: { code: 'LLM_ERROR', message: 'LLM not configured' } } as any),
        generateStructured: async () => ({ ok: false, error: { code: 'LLM_ERROR', message: 'LLM not configured' } } as any),
      };
      return;
    }

    switch (provider) {
      case 'openai':
      default:
        this.adapter = new OpenAIAdapter({ apiKey, baseUrl, model });
        break;
    }

    this.logger.log(`LLM service initialized with provider: ${provider}, model: ${model ?? 'default'}`);
  }

  async generate(prompt: string, options?: GenerateOptions): Promise<Result<string>> {
    return this.adapter.generate(prompt, options);
  }

  async generateStructured<T>(
    prompt: string,
    schema: z.ZodSchema<T>,
    options?: GenerateOptions,
  ): Promise<Result<T>> {
    return this.adapter.generateStructured(prompt, schema, options);
  }
}
