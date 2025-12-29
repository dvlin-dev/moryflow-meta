import { describe, it, expect } from 'vitest';
import {
  MemoryMetadataSchema,
  AddMemoryInputSchema,
  SearchOptionsSchema,
} from './memory.schema';

describe('MemoryMetadataSchema', () => {
  it('should validate valid metadata', () => {
    const result = MemoryMetadataSchema.safeParse({
      userId: 'user-123',
      source: 'conversation',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.userId).toBe('user-123');
      expect(result.data.source).toBe('conversation');
      expect(result.data.importance).toBe(0.5); // default
      expect(result.data.tags).toEqual([]); // default
    }
  });

  it('should reject empty userId', () => {
    const result = MemoryMetadataSchema.safeParse({
      userId: '',
      source: 'conversation',
    });

    expect(result.success).toBe(false);
  });

  it('should reject invalid source', () => {
    const result = MemoryMetadataSchema.safeParse({
      userId: 'user-123',
      source: 'invalid',
    });

    expect(result.success).toBe(false);
  });

  it('should validate optional fields', () => {
    const result = MemoryMetadataSchema.safeParse({
      userId: 'user-123',
      agentId: 'agent-456',
      sessionId: 'session-789',
      source: 'document',
      importance: 0.8,
      tags: ['important', 'work'],
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.agentId).toBe('agent-456');
      expect(result.data.sessionId).toBe('session-789');
      expect(result.data.importance).toBe(0.8);
      expect(result.data.tags).toEqual(['important', 'work']);
    }
  });

  it('should clamp importance to valid range', () => {
    const tooHigh = MemoryMetadataSchema.safeParse({
      userId: 'user-123',
      importance: 1.5,
    });
    expect(tooHigh.success).toBe(false);

    const tooLow = MemoryMetadataSchema.safeParse({
      userId: 'user-123',
      importance: -0.5,
    });
    expect(tooLow.success).toBe(false);
  });
});

describe('AddMemoryInputSchema', () => {
  it('should validate valid input', () => {
    const result = AddMemoryInputSchema.safeParse({
      content: 'Test memory content',
      metadata: {
        userId: 'user-123',
      },
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.content).toBe('Test memory content');
      expect(result.data.extractEntities).toBe(false); // default
      expect(result.data.extractRelations).toBe(false); // default
    }
  });

  it('should reject empty content', () => {
    const result = AddMemoryInputSchema.safeParse({
      content: '',
      metadata: {
        userId: 'user-123',
      },
    });

    expect(result.success).toBe(false);
  });

  it('should validate extraction flags', () => {
    const result = AddMemoryInputSchema.safeParse({
      content: 'Test content',
      metadata: { userId: 'user-123' },
      extractEntities: true,
      extractRelations: true,
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.extractEntities).toBe(true);
      expect(result.data.extractRelations).toBe(true);
    }
  });
});

describe('SearchOptionsSchema', () => {
  it('should validate valid options', () => {
    const result = SearchOptionsSchema.safeParse({
      userId: 'user-123',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.userId).toBe('user-123');
      expect(result.data.limit).toBe(10); // default
      expect(result.data.threshold).toBe(0.7); // default
      expect(result.data.includeGraph).toBe(false); // default
      expect(result.data.graphDepth).toBe(2); // default
    }
  });

  it('should validate limit range', () => {
    const tooHigh = SearchOptionsSchema.safeParse({
      userId: 'user-123',
      limit: 150,
    });
    expect(tooHigh.success).toBe(false);

    const tooLow = SearchOptionsSchema.safeParse({
      userId: 'user-123',
      limit: 0,
    });
    expect(tooLow.success).toBe(false);

    const valid = SearchOptionsSchema.safeParse({
      userId: 'user-123',
      limit: 50,
    });
    expect(valid.success).toBe(true);
  });

  it('should validate threshold range', () => {
    const tooHigh = SearchOptionsSchema.safeParse({
      userId: 'user-123',
      threshold: 1.5,
    });
    expect(tooHigh.success).toBe(false);

    const tooLow = SearchOptionsSchema.safeParse({
      userId: 'user-123',
      threshold: -0.1,
    });
    expect(tooLow.success).toBe(false);
  });

  it('should validate filter options', () => {
    const result = SearchOptionsSchema.safeParse({
      userId: 'user-123',
      filter: {
        agentId: 'agent-456',
        source: 'conversation',
        tags: ['tag1', 'tag2'],
      },
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.filter?.agentId).toBe('agent-456');
      expect(result.data.filter?.source).toBe('conversation');
      expect(result.data.filter?.tags).toEqual(['tag1', 'tag2']);
    }
  });
});
