import * as multer from 'multer';
import * as multerS3 from 'multer-s3';
import { s3Client, S3_CONFIG } from '../config/aws.ts';
import {
  ALLOWED_IMAGE_TYPES,
  MAX_FILE_SIZE,
  MAX_FILES_PER_UPLOAD,
} from '../schemas/images/ImageSchemas.ts';
import { ValidationError } from '../errors/ErrorTypes.ts';

const generateS3Key = (originalname: string): string => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = originalname.split('.').pop()?.toLowerCase() || '';
  return `images/${timestamp}-${randomString}.${extension}`;
};

export const uploadToS3 = multer({
  storage: multerS3({
    s3: s3Client as any, // AWS SDK version compatibility issue
    bucket: S3_CONFIG.bucket,
    key: (_req, file, cb) => {
      const s3Key = generateS3Key(file.originalname);
      cb(null, s3Key);
    },
    contentType: multerS3.AUTO_CONTENT_TYPE,
    metadata: (_req, file, cb) => {
      cb(null, {
        originalName: file.originalname,
        uploadedAt: new Date().toISOString(),
      });
    },
  }),
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: MAX_FILES_PER_UPLOAD,
  },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype as (typeof ALLOWED_IMAGE_TYPES)[number])) {
      return cb(
        new ValidationError(
          `Invalid file type. Allowed types: ${ALLOWED_IMAGE_TYPES.join(', ')}`,
          { field: 'file', mimeType: file.mimetype },
        ),
      );
    }
    cb(null, true);
  },
});

export const uploadSingle = uploadToS3.single('image');
export const uploadMultiple = uploadToS3.array('images', MAX_FILES_PER_UPLOAD);
export const uploadFields = uploadToS3.fields([
  { name: 'images', maxCount: MAX_FILES_PER_UPLOAD },
]);
