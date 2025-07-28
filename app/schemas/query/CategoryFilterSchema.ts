import { z } from 'zod';
import { BaseQueryOptionsSchema } from './QuerySchemas.ts';

export const CategoryFilterSchema = z.object({
  status: z.enum(['active', 'draft', 'archived']).optional(),
  isPublished: z.boolean().optional(),
  parentId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid parent category ID').optional(),
  search: z.string().min(1, 'Search term cannot be empty').max(100, 'Search term too long').optional(),
});

export const CategoryQueryOptionsSchema = BaseQueryOptionsSchema.extend({
  sort: z.enum(['name', 'createdAt', 'updatedAt', 'sortOrder', 'publishedAt']).optional(),
});

export type CategoryFilterData = z.infer<typeof CategoryFilterSchema>;
export type CategoryQueryOptionsData = z.infer<typeof CategoryQueryOptionsSchema>;