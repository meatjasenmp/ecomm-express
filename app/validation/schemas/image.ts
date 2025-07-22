import { z } from 'zod';

export const ImageSchema = z.object({
  name: z.string().min(1, 'Image name is required'),
  url: z.url('Invalid URL format for image'),
  key: z.string().min(1, 'Image key is required'),
});

export type ImageInput = z.infer<typeof ImageSchema>;