import { z } from 'zod';

// ============ Entity Type Enum ============

export const EntityTypeSchema = z.enum([
  'person',
  'organization',
  'location',
  'concept',
  'event',
  'custom',
]);

// ============ Create Entity Input Schema ============

export const CreateEntityInputSchema = z.object({
  type: EntityTypeSchema,
  name: z.string().min(1).max(255),
  properties: z.record(z.string(), z.unknown()).default({}),
  userId: z.string().min(1),
  source: z.string().optional(),
  confidence: z.number().min(0).max(1).default(1.0),
});

// ============ Update Entity Input Schema ============

export const UpdateEntityInputSchema = z.object({
  type: EntityTypeSchema.optional(),
  name: z.string().min(1).max(255).optional(),
  properties: z.record(z.string(), z.unknown()).optional(),
  confidence: z.number().min(0).max(1).optional(),
});

// ============ Create Relation Input Schema ============

export const CreateRelationInputSchema = z.object({
  sourceId: z.string().uuid(),
  targetId: z.string().uuid(),
  type: z.string().min(1).max(64),
  properties: z.record(z.string(), z.unknown()).default({}),
  userId: z.string().min(1),
  confidence: z.number().min(0).max(1).default(1.0),
  validFrom: z.coerce.date().optional(),
  validTo: z.coerce.date().optional(),
});

// ============ Traverse Options Schema ============

export const TraverseDirectionSchema = z.enum(['outgoing', 'incoming', 'both']);

export const TraverseOptionsSchema = z.object({
  depth: z.number().min(1).max(5).default(2),
  direction: TraverseDirectionSchema.default('both'),
  relationTypes: z.array(z.string()).optional(),
  limit: z.number().min(1).max(1000).default(100),
});

// ============ Entity Schema (for responses) ============

export const EntitySchema = z.object({
  id: z.string().uuid(),
  type: EntityTypeSchema,
  name: z.string(),
  properties: z.record(z.string(), z.unknown()),
  userId: z.string(),
  source: z.string().nullable(),
  confidence: z.number(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

// ============ Relation Schema (for responses) ============

export const RelationSchema = z.object({
  id: z.string().uuid(),
  sourceId: z.string().uuid(),
  targetId: z.string().uuid(),
  type: z.string(),
  properties: z.record(z.string(), z.unknown()),
  userId: z.string(),
  confidence: z.number(),
  validFrom: z.coerce.date().nullable(),
  validTo: z.coerce.date().nullable(),
  createdAt: z.coerce.date(),
});

// ============ SubGraph Schema ============

export const SubGraphSchema = z.object({
  entities: z.array(EntitySchema),
  relations: z.array(RelationSchema),
});

// ============ Type Exports ============

export type EntityType = z.infer<typeof EntityTypeSchema>;
export type CreateEntityInput = z.infer<typeof CreateEntityInputSchema>;
export type UpdateEntityInput = z.infer<typeof UpdateEntityInputSchema>;
export type CreateRelationInput = z.infer<typeof CreateRelationInputSchema>;
export type TraverseDirection = z.infer<typeof TraverseDirectionSchema>;
export type TraverseOptions = z.infer<typeof TraverseOptionsSchema>;
export type Entity = z.infer<typeof EntitySchema>;
export type Relation = z.infer<typeof RelationSchema>;
export type SubGraph = z.infer<typeof SubGraphSchema>;
