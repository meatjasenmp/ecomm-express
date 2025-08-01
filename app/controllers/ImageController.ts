import { type Request, type Response, type NextFunction } from 'express';
import { ImageService } from '../services/ImageService.ts';

export class ImageController {
  private imageService = new ImageService();

  uploadSingle = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({ error: 'No file provided' });
        return;
      }

      const file = req.file as Express.Multer.File & { key: string; location: string };
      const image = await this.imageService.createFromUpload(file);
      res.status(201).json(image);
    } catch (error) {
      next(error);
    }
  };

  uploadMultiple = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        res.status(400).json({ error: 'No files provided' });
        return;
      }

      const files = req.files as (Express.Multer.File & { key: string; location: string })[];
      const images = await this.imageService.createMultipleFromUploads(files);
      res.status(201).json(images);
    } catch (error) {
      next(error);
    }
  };

  getImageById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const image = await this.imageService.findById(id);
      res.json(image);
    } catch (error) {
      next(error);
    }
  };

  getAllImages = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await this.imageService.findAll({}, { page, limit });
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  deleteImage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      await this.imageService.delete(id);

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}
