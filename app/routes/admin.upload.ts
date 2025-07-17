import express, { type Request, type Response } from 'express';
import Image from '../db/models/Images';
import upload from '../helpers/s3';
import type { ImageInput } from '../validation/schemas.ts';

const uploadRoutes = express.Router();

const uploadError = (err: Error, res: Response): void => {
  console.error('Upload error:', err);
  res.status(500).json({ error: 'Error uploading file' });
};

const createImages = async (files: Express.MulterS3.File[], res: Response): Promise<void> => {
  const imageData: ImageInput[] = files.map((i) => ({
    name: i.originalname,
    url: i.location,
    key: i.key,
  }));
  const images = await Image.insertMany(imageData);
  res.status(201).json(images);
};

const imageUpload = async (req: Request, res: Response): Promise<void> => {
  try {
    const images = req.files as Express.MulterS3.File[];
    if (!images || images.length === 0) return uploadError(new Error('No images uploaded'), res);
    await createImages(images, res);
  } catch (err) {
    uploadError(err as Error, res);
  }
};

uploadRoutes.post('/upload-images', upload.array('images'), imageUpload);
export default uploadRoutes;
