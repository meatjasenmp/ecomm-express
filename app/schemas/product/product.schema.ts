import { z } from 'zod';
import { objectIdSchema } from '../common/objectId.schema';

export const PRODUCT_VALIDATION_MESSAGES = {
  TITLE: {
    MIN_LENGTH: 'Title must be at least 1 character',
    MAX_LENGTH: 'Title cannot exceed 200 characters',
  },
  DESCRIPTION: {
    MIN_LENGTH: 'Description must be at least 10 characters',
    MAX_LENGTH: 'Description cannot exceed 5000 characters',
  },
  PRICE: {
    MUST_BE_INTEGER: 'Price must be an integer (in cents)',
    MIN_VALUE: 'Price must be at least $0.01',
  },
  DISCOUNT_PRICE: {
    MUST_BE_INTEGER: 'Discount price must be an integer (in cents)',
    MIN_VALUE: 'Price must be at least $0.01',
    LESS_THAN_PRICE: 'Discount price must be less than regular price',
  },
} as const;

export const productSchema = z.object({
  title: z.preprocess(
    (val) => (typeof val === 'string' ? val.trim() : val),
    z
      .string()
      .min(1, PRODUCT_VALIDATION_MESSAGES.TITLE.MIN_LENGTH)
      .max(200, PRODUCT_VALIDATION_MESSAGES.TITLE.MAX_LENGTH),
  ),
  description: z
    .string()
    .min(10, PRODUCT_VALIDATION_MESSAGES.DESCRIPTION.MIN_LENGTH)
    .max(5000, PRODUCT_VALIDATION_MESSAGES.DESCRIPTION.MAX_LENGTH)
    .trim(),
  price: z
    .number()
    .int(PRODUCT_VALIDATION_MESSAGES.PRICE.MUST_BE_INTEGER)
    .min(1, PRODUCT_VALIDATION_MESSAGES.PRICE.MIN_VALUE),
  discountPrice: z
    .number()
    .int(PRODUCT_VALIDATION_MESSAGES.DISCOUNT_PRICE.MUST_BE_INTEGER)
    .min(1, PRODUCT_VALIDATION_MESSAGES.DISCOUNT_PRICE.MIN_VALUE)
    .optional(),
  images: z.array(objectIdSchema).default([]),
  categories: z.array(objectIdSchema).default([]),
});

export const productCreateSchema = productSchema.refine(
  (data) => !data.discountPrice || data.discountPrice < data.price,
  {
    message: PRODUCT_VALIDATION_MESSAGES.DISCOUNT_PRICE.LESS_THAN_PRICE,
    path: ['discountPrice'],
  },
);

export const productUpdateSchema = productSchema.partial().refine(
  (data) => {
    if (data.price !== undefined && data.discountPrice !== undefined) {
      return data.discountPrice < data.price;
    }
    return true;
  },
  {
    message: PRODUCT_VALIDATION_MESSAGES.DISCOUNT_PRICE.LESS_THAN_PRICE,
    path: ['discountPrice'],
  },
);

export type ProductSchema = z.infer<typeof productSchema>;
export type ProductCreateSchema = z.infer<typeof productCreateSchema>;
export type ProductUpdateSchema = z.infer<typeof productUpdateSchema>;
