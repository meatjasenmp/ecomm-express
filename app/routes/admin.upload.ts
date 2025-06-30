import express, { type Request, type Response } from 'express';
import Image from '../db/models/Images';
import upload from '../helpers/s3';

const uploadRoutes = express.Router();

const imageUpload = async (req: Request, res: Response): Promise<void> => {
  try {
    const images = req.files as Express.MulterS3.File[];
    if (!images || images.length === 0) {
      res.status(400).json({ error: 'No images uploaded' });
      return;
    }
    const urls = images.map((image) => ({
      url: image.location,
      key: image.key,
    }));
    const savedImages = await Image.insertMany(
      urls.map((image) => ({
        name: image.key,
        url: image.url,
        key: image.key,
      })),
    );

    res.status(201).json(savedImages);
  } catch (err) {
    res.status(500).json({ error: 'Error uploading image' });
  }
};

// Will need to update the multer upload to handle multiple files
uploadRoutes.post('/upload-images', upload.array('images'), imageUpload);
export default uploadRoutes;
