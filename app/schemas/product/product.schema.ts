import { z } from 'zod';
import { objectIdSchema } from '../common/objectId.schema';

export const productSchema = z.object({
  title: z
    .string()
    .min(1, 'Title must be at least 1 character')
    .max(200, 'Title cannot exceed 200 characters')
    .trim(),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(5000, 'Description cannot exceed 5000 characters')
    .trim(),
  price: z
    .number()
    .int('Price must be an integer (in cents)')
    .nonnegative('Price cannot be negative'),
  discountPrice: z
    .number()
    .int('Discount price must be an integer (in cents)')
    .nonnegative('Discount price cannot be negative')
    .optional(),
  images: z.array(objectIdSchema).default([]),
  categories: z.array(objectIdSchema).default([]),
});

export type ProductSchema = z.infer<typeof productSchema>;