import { describe, it, expect } from 'vitest';
import {
  EntityTypeSchema,
  CreateEntityInputSchema,
  UpdateEntityInputSchema,
  CreateRelationInputSchema,
  TraverseOptionsSchema,
  EntitySchema,
  RelationSchema,
  SubGraphSchema,
} from './graph.schema';

describe('EntityTypeSchema', () => {
  it('should validate valid entity types', () => {
    const types = ['person', 'organization', 'location', 'concept', 'event', 'custom'];
    for (const type of types) {
      const result = EntityTypeSchema.safeParse(type);
      expect(result.success).toBe(true);
    }
  });

  it('should reject invalid entity types', () => {
    const result = EntityTypeSchema.safeParse('invalid');
    expect(result.success).toBe(false);
  });
});

describe('CreateEntityInputSchema', () => {
  it('should validate valid input', () => {
    const result = CreateEntityInputSchema.safeParse({
      type: 'person',
      name: 'John Doe',
      userId: 'user-123',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.type).toBe('person');
      expect(result.data.name).toBe('John Doe');
      expect(result.data.properties).toEqual({}); // default
      expect(result.data.confidence).toBe(1.0); // default
    }
  });

  it('should reject empty name', () => {
    const result = CreateEntityInputSchema.safeParse({
      type: 'person',
      name: '',
      userId: 'user-123',
    });
    expect(result.success).toBe(false);
  });

  it('should reject name exceeding max length', () => {
    const result = CreateEntityInputSchema.safeParse({
      type: 'person',
      name: 'a'.repeat(256),
      userId: 'user-123',
    });
    expect(result.success).toBe(false);
  });

  it('should validate optional fields', () => {
    const result = CreateEntityInputSchema.safeParse({
      type: 'organization',
      name: 'Acme Corp',
      userId: 'user-123',
      properties: { industry: 'tech' },
      source: 'extraction',
      confidence: 0.85,
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.properties).toEqual({ industry: 'tech' });
      expect(result.data.source).toBe('extraction');
      expect(result.data.confidence).toBe(0.85);
    }
  });

  it('should validate confidence range', () => {
    const tooHigh = CreateEntityInputSchema.safeParse({
      type: 'person',
      name: 'Test',
      userId: 'user-123',
      confidence: 1.5,
    });
    expect(tooHigh.success).toBe(false);

    const tooLow = CreateEntityInputSchema.safeParse({
      type: 'person',
      name: 'Test',
      userId: 'user-123',
      confidence: -0.1,
    });
    expect(tooLow.success).toBe(false);
  });
});

describe('UpdateEntityInputSchema', () => {
  it('should allow partial updates', () => {
    const result = UpdateEntityInputSchema.safeParse({
      name: 'Updated Name',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe('Updated Name');
      expect(result.data.type).toBeUndefined();
    }
  });

  it('should allow empty object', () => {
    const result = UpdateEntityInputSchema.safeParse({});
    expect(result.success).toBe(true);
  });
});

describe('CreateRelationInputSchema', () => {
  it('should validate valid input', () => {
    const result = CreateRelationInputSchema.safeParse({
      sourceId: '550e8400-e29b-41d4-a716-446655440000',
      targetId: '550e8400-e29b-41d4-a716-446655440001',
      type: 'works_at',
      userId: 'user-123',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.type).toBe('works_at');
      expect(result.data.properties).toEqual({}); // default
      expect(result.data.confidence).toBe(1.0); // default
    }
  });

  it('should reject invalid UUID', () => {
    const result = CreateRelationInputSchema.safeParse({
      sourceId: 'not-a-uuid',
      targetId: '550e8400-e29b-41d4-a716-446655440001',
      type: 'works_at',
      userId: 'user-123',
    });
    expect(result.success).toBe(false);
  });

  it('should reject empty type', () => {
    const result = CreateRelationInputSchema.safeParse({
      sourceId: '550e8400-e29b-41d4-a716-446655440000',
      targetId: '550e8400-e29b-41d4-a716-446655440001',
      type: '',
      userId: 'user-123',
    });
    expect(result.success).toBe(false);
  });

  it('should reject type exceeding max length', () => {
    const result = CreateRelationInputSchema.safeParse({
      sourceId: '550e8400-e29b-41d4-a716-446655440000',
      targetId: '550e8400-e29b-41d4-a716-446655440001',
      type: 'a'.repeat(65),
      userId: 'user-123',
    });
    expect(result.success).toBe(false);
  });

  it('should validate optional date fields', () => {
    const result = CreateRelationInputSchema.safeParse({
      sourceId: '550e8400-e29b-41d4-a716-446655440000',
      targetId: '550e8400-e29b-41d4-a716-446655440001',
      type: 'employed_at',
      userId: 'user-123',
      validFrom: '2020-01-01',
      validTo: '2024-12-31',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.validFrom).toBeInstanceOf(Date);
      expect(result.data.validTo).toBeInstanceOf(Date);
    }
  });
});

describe('TraverseOptionsSchema', () => {
  it('should validate with defaults', () => {
    const result = TraverseOptionsSchema.safeParse({});

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.depth).toBe(2); // default
      expect(result.data.direction).toBe('both'); // default
      expect(result.data.limit).toBe(100); // default
    }
  });

  it('should validate depth range', () => {
    const tooHigh = TraverseOptionsSchema.safeParse({ depth: 10 });
    expect(tooHigh.success).toBe(false);

    const tooLow = TraverseOptionsSchema.safeParse({ depth: 0 });
    expect(tooLow.success).toBe(false);

    const valid = TraverseOptionsSchema.safeParse({ depth: 3 });
    expect(valid.success).toBe(true);
  });

  it('should validate direction', () => {
    const directions = ['outgoing', 'incoming', 'both'];
    for (const direction of directions) {
      const result = TraverseOptionsSchema.safeParse({ direction });
      expect(result.success).toBe(true);
    }

    const invalid = TraverseOptionsSchema.safeParse({ direction: 'invalid' });
    expect(invalid.success).toBe(false);
  });

  it('should validate limit range', () => {
    const tooHigh = TraverseOptionsSchema.safeParse({ limit: 1001 });
    expect(tooHigh.success).toBe(false);

    const tooLow = TraverseOptionsSchema.safeParse({ limit: 0 });
    expect(tooLow.success).toBe(false);
  });

  it('should validate relation types filter', () => {
    const result = TraverseOptionsSchema.safeParse({
      relationTypes: ['works_at', 'knows'],
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.relationTypes).toEqual(['works_at', 'knows']);
    }
  });
});

describe('EntitySchema', () => {
  it('should validate complete entity', () => {
    const result = EntitySchema.safeParse({
      id: '550e8400-e29b-41d4-a716-446655440000',
      type: 'person',
      name: 'John Doe',
      properties: { age: 30 },
      userId: 'user-123',
      source: 'extraction',
      confidence: 0.9,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.id).toBe('550e8400-e29b-41d4-a716-446655440000');
      expect(result.data.createdAt).toBeInstanceOf(Date);
    }
  });

  it('should allow null source', () => {
    const result = EntitySchema.safeParse({
      id: '550e8400-e29b-41d4-a716-446655440000',
      type: 'person',
      name: 'John Doe',
      properties: {},
      userId: 'user-123',
      source: null,
      confidence: 1.0,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.source).toBeNull();
    }
  });
});

describe('RelationSchema', () => {
  it('should validate complete relation', () => {
    const result = RelationSchema.safeParse({
      id: '550e8400-e29b-41d4-a716-446655440000',
      sourceId: '550e8400-e29b-41d4-a716-446655440001',
      targetId: '550e8400-e29b-41d4-a716-446655440002',
      type: 'works_at',
      properties: { role: 'engineer' },
      userId: 'user-123',
      confidence: 0.95,
      validFrom: null,
      validTo: null,
      createdAt: '2024-01-01T00:00:00Z',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.type).toBe('works_at');
      expect(result.data.validFrom).toBeNull();
    }
  });
});

describe('SubGraphSchema', () => {
  it('should validate complete subgraph', () => {
    const result = SubGraphSchema.safeParse({
      entities: [
        {
          id: '550e8400-e29b-41d4-a716-446655440000',
          type: 'person',
          name: 'John',
          properties: {},
          userId: 'user-123',
          source: null,
          confidence: 1.0,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      ],
      relations: [],
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.entities).toHaveLength(1);
      expect(result.data.relations).toHaveLength(0);
    }
  });

  it('should allow empty arrays', () => {
    const result = SubGraphSchema.safeParse({
      entities: [],
      relations: [],
    });

    expect(result.success).toBe(true);
  });
});
