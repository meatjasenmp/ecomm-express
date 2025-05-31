import express, { type Request, type Response } from 'express';
import Image from '../db/models/Images';

import upload from '../helpers/s3';

const uploadRoutes = express.Router();

const imageUpload = async (req: Request, res: Response): Promise<void> => {
  console.info('image', req.file);
  try {
    const { originalname, location, key } = req.file as Express.MulterS3.File;
    const image = new Image({ name: originalname, url: location, key });
    const savedImage = await image.save();
    res.send(savedImage).status(201);
  } catch (err) {
    res.status(500).json({ error: 'Error uploading image' });
  }
};

uploadRoutes.post('/upload-images', upload.single('images'), imageUpload);

export default uploadRoutes;
