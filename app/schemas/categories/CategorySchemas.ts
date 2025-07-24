import { z } from 'zod';

export const CategoryStatusSchema = z.enum(['active', 'draft', 'archived']);

export const CategoryCreateSchema = z.object({
  name: z.string().min(1, 'Category name is required').max(100),
  description: z.string().optional(),
  shortDescription: z.string().max(200).optional(),
  slug: z.string().optional(),
  metaTitle: z.string().max(70).optional(),
  metaDescription: z.string().max(160).optional(),
  parentId: z.string().optional(),
  image: z.string().optional(),
  status: CategoryStatusSchema.default('draft'),
  isPublished: z.boolean().default(false),
  publishedAt: z.date().optional(),
  sortOrder: z.number().int().default(0),
});

export const CategoryUpdateSchema = CategoryCreateSchema.partial().extend({
  updatedAt: z.date().optional(),
});

export type CategoryStatus = z.infer<typeof CategoryStatusSchema>;
export type CategoryCreateData = z.infer<typeof CategoryCreateSchema>;
export type CategoryUpdateData = z.infer<typeof CategoryUpdateSchema>;