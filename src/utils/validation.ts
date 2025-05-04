import { z } from 'zod';
import type { MetadataValue } from '@/types/api';

// Base schemas
const statusEnum = z.enum(['active', 'inactive', 'archived']);
const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId format');

// Recursive metadata schema to match our TypeScript types
const metadataValueSchema: z.ZodType<MetadataValue> = z.lazy(() => 
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.null(),
    z.undefined(),
    z.record(z.string(), metadataValueSchema),
    z.array(metadataValueSchema)
  ])
);

const metadataSchema = z.record(z.string(), metadataValueSchema).optional();

// Category schemas
export const categorySchema = z.object({
  name: z.string().min(1).max(100).trim(),
  description: z.string().max(500).trim().optional(),
  metadata: metadataSchema,
  status: statusEnum.optional().default('active'),
  order: z.number().int().min(0).optional()
});

export const categoryUpdateSchema = categorySchema.partial();

export const categoryBatchSchema = z.object({
  operations: z.array(z.object({
    type: z.enum(['create', 'update', 'delete']),
    id: objectIdSchema.optional(),
    data: categorySchema.partial().optional()
  })).min(1).max(100)
});

// Description schemas
export const descriptionSchema = z.object({
  description: z.string().min(1).max(1000).trim(),
  categoryId: objectIdSchema,
  parentId: objectIdSchema.optional(),
  userId: z.string().min(1),
  metadata: metadataSchema,
  status: statusEnum.optional().default('active')
});

export const descriptionUpdateSchema = descriptionSchema.partial().extend({
  id: objectIdSchema
});

export const descriptionBatchSchema = z.object({
  operations: z.array(z.object({
    type: z.enum(['create', 'update', 'delete']),
    id: objectIdSchema.optional(),
    data: z.object({
      description: z.string().min(1).max(1000).trim().optional(),
      categoryId: objectIdSchema.optional(),
      parentId: objectIdSchema.optional(),
      status: statusEnum.optional(),
      metadata: metadataSchema
    }).optional()
  })).min(1).max(100).refine(
    (ops) => ops.every(op => 
      (op.type === 'create' && op.data && !op.id) ||
      (op.type !== 'create' && op.id)
    ),
    'Create operations require data but no ID, other operations require an ID'
  )
});

// Utility schemas
export const reorderCategoriesSchema = z.object({
  orderedIds: z.array(objectIdSchema).min(1)
});

export const queryParamsSchema = z.object({
  categoryId: objectIdSchema.optional(),
  parentId: objectIdSchema.optional(),
  status: statusEnum.optional(),
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  sortBy: z.enum(['description', 'createdAt', 'updatedAt']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  search: z.string().optional()
});