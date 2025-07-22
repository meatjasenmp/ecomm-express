import { z } from 'zod';
import { ObjectIdSchema } from './common.ts';

export const CategorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(100, 'Category name must be less than 100 characters'),
  description: z.string().min(1, 'Description is required').max(500, 'Description must be less than 500 characters'),
  parentId: z.union([ObjectIdSchema, z.null()]).default(null),
  level: z.number().int().min(0, 'Level must be at least 0').max(2, 'Level cannot exceed 2').default(0),
  sortOrder: z.number().int().min(0, 'Sort order must be a positive number').default(0),
});

export const CategoryUpdateSchema = z.object({
  name: z
    .string()
    .min(1, 'Category name is required')
    .max(100, 'Category name must be less than 100 characters')
    .optional(),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  parentId: z.union([ObjectIdSchema, z.null()]).optional(),
  level: z.number().int().min(0, 'Level must be at least 0').max(2, 'Level cannot exceed 2').optional(),
  sortOrder: z.number().int().min(0, 'Sort order must be a positive number').optional(),
});

export const CategoryQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1).optional(),
  limit: z.coerce.number().int().positive().max(100).default(50).optional(),
  level: z.coerce.number().int().min(0).max(2).optional(),
  parentId: ObjectIdSchema.optional(),
  isActive: z.enum(['true', 'false']).transform((val) => val === 'true').optional(),
  search: z.string().min(1).optional(),
});

export type CategoryInput = z.infer<typeof CategorySchema>;
export type CategoryUpdateInput = z.infer<typeof CategoryUpdateSchema>;
export type CategoryQueryInput = z.infer<typeof CategoryQuerySchema>;