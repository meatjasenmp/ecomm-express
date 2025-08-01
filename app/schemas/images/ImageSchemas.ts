import { z } from 'zod';

const ImageVariantSchema = z.object({
  s3Key: z.string().min(1, 'S3 key is required'),
  s3Url: z.string().url('S3 URL must be valid'),
  width: z.number().min(1, 'Width must be greater than 0'),
  height: z.number().min(1, 'Height must be greater than 0'),
  size: z.number().min(1, 'Size must be greater than 0'),
});

const ImageVariantsSchema = z.object({
  original: ImageVariantSchema,
  thumbnail: ImageVariantSchema,
  medium: ImageVariantSchema,
  large: ImageVariantSchema,
});

export const ImageCreateSchema = z.object({
  filename: z.string().min(1, 'Filename is required'),
  originalName: z.string().min(1, 'Original name is required'),
  mimeType: z.string().regex(/^image\/(jpeg|jpg|png|gif|webp)$/, 'Invalid image format'),
  variants: ImageVariantsSchema,
  altText: z.string().max(255, 'Alt text cannot exceed 255 characters').optional(),
  title: z.string().max(255, 'Title cannot exceed 255 characters').optional(),
});

export const ImageUpdateSchema = ImageCreateSchema.partial().omit({
  filename: true,
  mimeType: true,
  variants: true,
});

export type ImageCreateData = z.infer<typeof ImageCreateSchema>;
export type ImageUpdateData = z.infer<typeof ImageUpdateSchema>;

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'] as const;
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_FILES_PER_UPLOAD = 10;