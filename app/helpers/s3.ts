import { S3Client } from '@aws-sdk/client-s3';
import type { FileFilterCallback } from 'multer';
import multer from 'multer';
import multerS3 from 'multer-s3';
import path from 'path';

const sanitizeFiles = (file: Express.Multer.File, cb: FileFilterCallback) => {
  const fileTypes = ['.jpeg', '.jpg', '.png', '.gif', '.mp4'];
  const mimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4'];

  const isAllowed = fileTypes.includes(path.extname(file.originalname).toLowerCase());
  const isMimeTypeAllowed = mimeTypes.includes(file.mimetype);

  if (isAllowed && isMimeTypeAllowed) return cb(null, true);
  cb(new Error('Invalid file type'));
};

const s3 = new S3Client({
  region: 'us-east-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY || '',
    secretAccessKey: process.env.AWS_SECRET || '',
  },
});

const s3Storage = multerS3({
  s3,
  bucket: process.env.AWS_BUCKET || '',
  acl: 'public-read',
  metadata: function (req, file, cb) {
    cb(null, { fieldName: file.fieldname });
  },
  key: function (_req, file, cb) {
    cb(null, `uploads/${Date.now()}_${file.originalname}`);
  },
});

const upload = multer({
  storage: s3Storage,
  fileFilter: function (_req, file, cb) {
    sanitizeFiles(file, cb);
  },
});

export default upload;
