import { z } from 'zod';

export const ObjectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid ObjectId format');

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

export const ImageSchema = z.object({
  name: z.string().min(1, 'Image name is required'),
  url: z.url('Invalid URL format for image'),
  key: z.string().min(1, 'Image key is required'),
});

export const ProductSchema = z.object({
  title: z.string().min(1, 'Product title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().min(1, 'Description is required').max(2000, 'Description must be less than 2000 characters'),
  shortDescription: z
    .string()
    .min(1, 'Short description is required')
    .max(300, 'Short description must be less than 300 characters'),
  price: z.number().min(0, 'Price must be a positive number'),
  categories: z.array(ObjectIdSchema).min(1, 'At least one category is required'),
  images: z.array(ObjectIdSchema).default([]),
  discount: z.number().min(0, 'Discount must be a positive number').max(100, 'Discount cannot exceed 100%').optional(),
  isPublished: z.boolean().optional(),
});

export const ProductUpdateSchema = z.object({
  title: z.string().min(1, 'Product title is required').max(200, 'Title must be less than 200 characters').optional(),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(2000, 'Description must be less than 2000 characters')
    .optional(),
  shortDescription: z
    .string()
    .min(1, 'Short description is required')
    .max(300, 'Short description must be less than 300 characters')
    .optional(),
  price: z.number().min(0, 'Price must be a positive number').optional(),
  categories: z.array(ObjectIdSchema).min(1, 'At least one category is required').optional(),
  images: z.array(ObjectIdSchema).default([]).optional(),
  discount: z.number().min(0, 'Discount must be a positive number').max(100, 'Discount cannot exceed 100%').optional(),
  isPublished: z.boolean().optional(),
});

export const IdParamsSchema = z.object({
  id: ObjectIdSchema,
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
export type ProductInput = z.infer<typeof ProductSchema>;
export type ProductUpdateInput = z.infer<typeof ProductUpdateSchema>;
export type ImageInput = z.infer<typeof ImageSchema>;
