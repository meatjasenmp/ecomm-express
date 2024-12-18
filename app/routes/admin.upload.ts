import express, { type Request, type Response } from 'express';
import multer from 'multer';
import multerS3 from 'multer-s3';
import { S3Client } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: 'us-east-1',
  credentials: {
    accessKeyId: 'YOUR_ACCESS_KEY_ID',
    secretAccessKey: 'YOUR_SECRET_ACCESS_KEY',
  },
});

const upload = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: 'your-s3-bucket-name',
    acl: 'public-read', // Make the uploaded file public
    key: function (_req, file, cb) {
      cb(null, Date.now().toString() + '-' + file.originalname);
    },
  }),
});

const uploadRoutes = express.Router();

uploadRoutes.put('/upload-images', upload.array('images', 10), async (req: Request, res: Response): Promise<void> => {
  try {
    res.json({ message: 'Images uploaded successfully' }).status(200);
  } catch (err) {
    res.status(400).send({
      message: 'Failed to upload images',
      error: err,
    });
  }
});

uploadRoutes.put('/upload-video', upload.single('video'), async (_req: Request, res: Response): Promise<void> => {
  try {
    res.json({ message: 'Video uploaded successfully' }).status(200);
  } catch (err) {
    res.status(400).send({
      message: 'Failed to upload video',
      error: err,
    });
  }
});
