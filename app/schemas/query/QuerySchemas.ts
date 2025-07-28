import { z } from 'zod';

export const PaginationSchema = z.object({
  page: z
    .number()
    .int()
    .min(1, 'Page must be at least 1')
    .max(1000, 'Page cannot exceed 1000')
    .optional()
    .default(1),
  limit: z
    .number()
    .int()
    .min(1, 'Limit must be at least 1')
    .max(100, 'Limit cannot exceed 100')
    .optional()
    .default(20),
});

export const SortSchema = z
  .string()
  .min(1, 'Sort field cannot be empty')
  .optional();

export const SelectSchema = z
  .string()
  .min(1, 'Select fields cannot be empty')
  .optional();

export const PopulateSchema = z
  .union([z.string(), z.array(z.string())])
  .optional();

export const BaseQueryOptionsSchema = z.object({
  page: PaginationSchema.shape.page,
  limit: PaginationSchema.shape.limit,
  sort: SortSchema,
  select: SelectSchema,
  populate: PopulateSchema,
});

export type PaginationData = z.infer<typeof PaginationSchema>;
export type BaseQueryOptionsData = z.infer<typeof BaseQueryOptionsSchema>;