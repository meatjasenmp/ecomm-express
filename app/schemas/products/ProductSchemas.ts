import { z } from 'zod';

export const ProductStatusSchema = z.enum(['active', 'draft', 'archived']);
export const ProductTypeSchema = z.enum(['shoes', 'clothing', 'accessories']);
export const GenderSchema = z.enum(['mens', 'womens', 'unisex', 'kids']);

export const ProductVariantSchema = z.object({
  _id: z.string().optional(),
  sku: z.string().min(1, 'Variant SKU is required'),
  size: z.string().min(1, 'Size is required'),
  color: z.string().min(1, 'Color is required'),
  price: z.number().min(0, 'Price must be non-negative'),
  compareAtPrice: z.number().min(0).optional(),
  cost: z.number().min(0).optional(),
  quantity: z.number().int().min(0, 'Quantity must be non-negative').default(0),
  weight: z.number().min(0).optional(),
  isActive: z.boolean().default(true),
});

export const ProductCreateSchema = z.object({
  title: z.string().min(1, 'Product title is required').max(255),
  description: z.string().min(1, 'Product description is required'),
  shortDescription: z.string().max(500).optional(),
  brand: z.string().min(1, 'Brand is required'),
  productType: ProductTypeSchema,
  gender: GenderSchema,
  categories: z.array(z.string()).min(1, 'At least one category is required'),
  tags: z.array(z.string()).optional(),
  metaTitle: z.string().max(70).optional(),
  metaDescription: z.string().max(160).optional(),
  searchKeywords: z.array(z.string()).optional(),
  variants: z.array(ProductVariantSchema).min(1, 'At least one variant is required'),
  images: z.array(z.string()).optional(), // Array of image IDs
  status: ProductStatusSchema.default('draft'),
  isPublished: z.boolean().default(false),
  publishedAt: z.date().optional(),
  sortOrder: z.number().int().default(0),
});

export const ProductUpdateSchema = ProductCreateSchema.partial().extend({
  updatedAt: z.date().optional(),
});

export type ProductStatus = z.infer<typeof ProductStatusSchema>;
export type ProductType = z.infer<typeof ProductTypeSchema>;
export type Gender = z.infer<typeof GenderSchema>;
export type ProductVariant = z.infer<typeof ProductVariantSchema>;
export type ProductCreateData = z.infer<typeof ProductCreateSchema>;
export type ProductUpdateData = z.infer<typeof ProductUpdateSchema>;
