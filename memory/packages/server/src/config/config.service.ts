/**
 * Configuration Service
 * Centralized management of environment variables
 */
import { Injectable } from '@nestjs/common';

export interface DatabaseConfig {
  url: string;
  poolMax: number;
  idleTimeoutMs: number;
  connectionTimeoutMs: number;
}

export interface EmbeddingConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
  dimension: number;
  batchSize: number;
}

export interface LLMConfig {
  provider: 'openai' | 'anthropic' | 'custom';
  apiKey: string | undefined;
  baseUrl: string | undefined;
  model: string | undefined;
}

export interface ServerConfig {
  port: number;
  corsOrigin: string;
}

@Injectable()
export class ConfigService {
  private readonly env = process.env;

  get database(): DatabaseConfig {
    const url = this.env.DATABASE_URL;
    if (!url) {
      throw new Error('DATABASE_URL environment variable is required');
    }

    return {
      url,
      poolMax: this.getNumber('DATABASE_POOL_MAX', 20),
      idleTimeoutMs: this.getNumber('DATABASE_IDLE_TIMEOUT_MS', 30000),
      connectionTimeoutMs: this.getNumber('DATABASE_CONNECTION_TIMEOUT_MS', 5000),
    };
  }

  get embedding(): EmbeddingConfig {
    const apiKey = this.env.EMBEDDING_API_KEY;
    if (!apiKey) {
      throw new Error('EMBEDDING_API_KEY environment variable is required');
    }

    return {
      apiKey,
      baseUrl: this.env.EMBEDDING_BASE_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1',
      model: this.env.EMBEDDING_MODEL || 'text-embedding-v4',
      dimension: this.getNumber('EMBEDDING_DIMENSION', 1024),
      batchSize: 10, // DashScope limit
    };
  }

  get llm(): LLMConfig {
    return {
      provider: (this.env.LLM_PROVIDER as LLMConfig['provider']) ?? 'openai',
      apiKey: this.env.LLM_API_KEY,
      baseUrl: this.env.LLM_BASE_URL,
      model: this.env.LLM_MODEL,
    };
  }

  get server(): ServerConfig {
    return {
      port: this.getNumber('PORT', 3000),
      corsOrigin: this.env.CORS_ORIGIN ?? '*',
    };
  }

  private getNumber(key: string, defaultValue: number): number {
    const value = this.env[key];
    if (value === undefined) {
      return defaultValue;
    }
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? defaultValue : parsed;
  }
}
