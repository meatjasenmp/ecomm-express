import { z } from 'zod';

export const ImageCreateSchema = z.object({
  filename: z.string().min(1, 'Filename is required'),
  originalName: z.string().min(1, 'Original name is required'),
  mimeType: z.string().regex(/^image\/(jpeg|jpg|png|gif|webp)$/, 'Invalid image format'),
  size: z.number().min(1, 'File size must be greater than 0').max(10 * 1024 * 1024, 'File size cannot exceed 10MB'),
  s3Key: z.string().min(1, 'S3 key is required'),
  s3Bucket: z.string().min(1, 'S3 bucket is required'),
  width: z.number().min(1, 'Width must be greater than 0').optional(),
  height: z.number().min(1, 'Height must be greater than 0').optional(),
  altText: z.string().max(255, 'Alt text cannot exceed 255 characters').optional(),
  title: z.string().max(255, 'Title cannot exceed 255 characters').optional(),
});

export const ImageUpdateSchema = ImageCreateSchema.partial().omit({
  filename: true,
  s3Key: true,
  s3Bucket: true,
  size: true,
  mimeType: true,
});

export type ImageCreateData = z.infer<typeof ImageCreateSchema>;
export type ImageUpdateData = z.infer<typeof ImageUpdateSchema>;

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'] as const;
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_FILES_PER_UPLOAD = 10;