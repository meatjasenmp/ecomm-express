import { z } from 'zod';

export const CategorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(100, 'Category name must be less than 100 characters'),
  description: z.string().min(1, 'Description is required').max(500, 'Description must be less than 500 characters'),
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
});

export const ImageSchema = z.object({
  name: z.string().min(1, 'Image name is required'),
  url: z.string().url('Invalid URL format'),
  key: z.string().min(1, 'Image key is required'),
  isPrimary: z.boolean().optional(),
});

export const ProductSchema = z.object({
  title: z.string().min(1, 'Product title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().min(1, 'Description is required').max(2000, 'Description must be less than 2000 characters'),
  shortDescription: z
    .string()
    .min(1, 'Short description is required')
    .max(300, 'Short description must be less than 300 characters'),
  price: z.number().min(0, 'Price must be a positive number'),
  categories: z.array(CategorySchema).min(1, 'At least one category is required'),
  images: z.array(ImageSchema).min(1, 'At least one image is required'),
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
  categories: z.array(CategorySchema).min(1, 'At least one category is required').optional(),
  images: z.array(ImageSchema).min(1, 'At least one image is required').optional(),
  discount: z.number().min(0, 'Discount must be a positive number').max(100, 'Discount cannot exceed 100%').optional(),
  isPublished: z.boolean().optional(),
});

export const ObjectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid ObjectId format');

export const IdParamsSchema = z.object({
  id: ObjectIdSchema,
});

export type CategoryInput = z.infer<typeof CategorySchema>;
export type CategoryUpdateInput = z.infer<typeof CategoryUpdateSchema>;
export type ProductInput = z.infer<typeof ProductSchema>;
export type ProductUpdateInput = z.infer<typeof ProductUpdateSchema>;
export type ImageInput = z.infer<typeof ImageSchema>;
