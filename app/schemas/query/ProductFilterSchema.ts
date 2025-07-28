import { z } from 'zod';
import { BaseQueryOptionsSchema } from './QuerySchemas.ts';

export const ProductFilterSchema = z.object({
  status: z.enum(['active', 'draft', 'archived']).optional(),
  productType: z.enum(['shoes', 'clothing', 'accessories']).optional(),
  gender: z.enum(['mens', 'womens', 'unisex', 'kids']).optional(),
  isPublished: z.boolean().optional(),
  brand: z.string().min(1, 'Brand cannot be empty').optional(),
  categories: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid category ID')).optional(),
  search: z.string().min(1, 'Search term cannot be empty').max(100, 'Search term too long').optional(),
  minPrice: z.number().min(0, 'Minimum price cannot be negative').optional(),
  maxPrice: z.number().min(0, 'Maximum price cannot be negative').optional(),
}).refine(
  (data) => {
    if (data.minPrice !== undefined && data.maxPrice !== undefined) {
      return data.minPrice <= data.maxPrice;
    }
    return true;
  },
  {
    message: 'Minimum price cannot be greater than maximum price',
    path: ['minPrice'],
  }
);

export const ProductQueryOptionsSchema = BaseQueryOptionsSchema.extend({
  sort: z.enum(['title', 'createdAt', 'updatedAt', 'price', 'brand', 'publishedAt']).optional(),
});

export type ProductFilterData = z.infer<typeof ProductFilterSchema>;
export type ProductQueryOptionsData = z.infer<typeof ProductQueryOptionsSchema>;