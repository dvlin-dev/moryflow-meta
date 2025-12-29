import OpenAI from 'openai';
import type { z } from 'zod';
import { zodResponseFormat } from 'openai/helpers/zod';
import {
  type Result,
  Ok,
  Err,
  createError,
  MemoryErrorCode,
} from '@moryflow/memory-core';
import type { LLMAdapter, GenerateOptions } from './llm.types';

export class OpenAIAdapter implements LLMAdapter {
  private client: OpenAI;
  private model: string;

  constructor(config: { apiKey: string; baseUrl?: string; model?: string }) {
    this.client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseUrl,
    });
    this.model = config.model ?? 'gpt-4o-mini';
  }

  async generate(prompt: string, options?: GenerateOptions): Promise<Result<string>> {
    try {
      const messages: OpenAI.ChatCompletionMessageParam[] = [];

      if (options?.systemPrompt) {
        messages.push({ role: 'system', content: options.systemPrompt });
      }
      messages.push({ role: 'user', content: prompt });

      const response = await this.client.chat.completions.create({
        model: this.model,
        messages,
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        return Err(createError(MemoryErrorCode.LLM_ERROR, 'Empty response from LLM'));
      }

      return Ok(content);
    } catch (error) {
      return Err(
        createError(MemoryErrorCode.LLM_ERROR, 'LLM generation failed', {
          cause: error instanceof Error ? error : new Error(String(error)),
        }),
      );
    }
  }

  async generateStructured<T>(
    prompt: string,
    schema: z.ZodSchema<T>,
    options?: GenerateOptions,
  ): Promise<Result<T>> {
    try {
      const messages: OpenAI.ChatCompletionMessageParam[] = [];

      if (options?.systemPrompt) {
        messages.push({ role: 'system', content: options.systemPrompt });
      }
      messages.push({ role: 'user', content: prompt });

      const response = await this.client.chat.completions.create({
        model: this.model,
        messages,
        response_format: zodResponseFormat(schema, 'result'),
        temperature: options?.temperature ?? 0.3,
        max_tokens: options?.maxTokens,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        return Err(
          createError(MemoryErrorCode.PARSE_ERROR, 'Failed to get structured response'),
        );
      }

      // Parse JSON response
      const parsed = schema.safeParse(JSON.parse(content));
      if (!parsed.success) {
        return Err(
          createError(MemoryErrorCode.PARSE_ERROR, 'Failed to parse structured response'),
        );
      }

      return Ok(parsed.data as T);
    } catch (error) {
      return Err(
        createError(MemoryErrorCode.LLM_ERROR, 'Structured generation failed', {
          cause: error instanceof Error ? error : new Error(String(error)),
        }),
      );
    }
  }
}
