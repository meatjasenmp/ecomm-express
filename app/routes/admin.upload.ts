import express, { type Request, type Response } from 'express';

import upload from '../helpers/s3';

const uploadRoutes = express.Router();

uploadRoutes.put('/upload-image', upload.single('image'), async (req: Request, res: Response): Promise<void> => {
  try {
    const file = req.file as Express.MulterS3.File;
    console.info('File:', file);
    res.json({ message: 'Image uploaded successfully' }).status(201);
  } catch (err) {
    res.status(400).send({ message: 'Failed to upload image', error: err });
  }
});

uploadRoutes.put('/upload-video', upload.single('video'), async (_req: Request, res: Response): Promise<void> => {
  try {
    res.json({ message: 'Video uploaded successfully' }).status(201);
  } catch (err) {
    res.status(400).send({ message: 'Failed to upload video', error: err });
  }
});
