import { z } from 'zod';
import { ObjectIdSchema } from './common.ts';

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

export type ProductInput = z.infer<typeof ProductSchema>;
export type ProductUpdateInput = z.infer<typeof ProductUpdateSchema>;