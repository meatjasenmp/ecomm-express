import express, { type Request, type Response } from 'express';

import upload from '../helpers/s3';

const uploadRoutes = express.Router();

uploadRoutes.put('/upload-images', upload.array('images', 10), async (req: Request, res: Response): Promise<void> => {
  try {
    const files = req?.files as Express.MulterS3.File[];
    const urls = files.map((file) => file.location);
    console.log(urls);
    res.json({ message: 'Images uploaded successfully' }).status(201);
  } catch (err) {
    res.status(400).send({
      message: 'Failed to upload images',
      error: err,
    });
  }
});

uploadRoutes.put('/upload-video', upload.single('video'), async (_req: Request, res: Response): Promise<void> => {
  try {
    res.json({ message: 'Video uploaded successfully' }).status(201);
  } catch (err) {
    res.status(400).send({
      message: 'Failed to upload video',
      error: err,
    });
  }
});
