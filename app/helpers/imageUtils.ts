import { ALLOWED_IMAGE_TYPES, MAX_FILE_SIZE } from '../schemas/images/ImageSchemas.ts';

export const validateImageFile = (
  file: Express.Multer.File,
): { isValid: boolean; error?: string } => {
  if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype as any)) {
    return {
      isValid: false,
      error: `Invalid file type: ${file.mimetype}. Allowed types: ${ALLOWED_IMAGE_TYPES.join(', ')}`,
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: `File size too large: ${file.size} bytes. Maximum allowed: ${MAX_FILE_SIZE} bytes`,
    };
  }

  return { isValid: true };
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// TODO: Add Sharp
export const getImageDimensions = async (
  file: Express.Multer.File,
): Promise<{ width?: number; height?: number }> => {
  // This would require an image processing library like 'sharp' for actual implementation
  // For now, return empty dimensions - can be enhanced later
  return { width: undefined, height: undefined };
};

export const generateImageVariants = (
  s3Key: string,
): { thumbnail: string; medium: string; large: string } => {
  const basePath = s3Key.replace(/\.[^/.]+$/, ''); // Remove extension
  const extension = s3Key.split('.').pop();

  return {
    thumbnail: `${basePath}_thumb.${extension}`,
    medium: `${basePath}_med.${extension}`,
    large: `${basePath}_large.${extension}`,
  };
};
