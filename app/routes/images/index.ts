import express, { type Request, type Response, type NextFunction } from 'express';
import { ImageController } from '../../controllers/ImageController.ts';
import { uploadSingle, uploadMultiple } from '../../middleware/upload.ts';

const router = express.Router();
const imageController = new ImageController();

router.post('/', uploadSingle, (req: Request, res: Response, next: NextFunction) =>
  imageController.uploadSingle(req, res, next),
);

router.post('/multiple', uploadMultiple, (req: Request, res: Response, next: NextFunction) =>
  imageController.uploadMultiple(req, res, next),
);

router.get('/:id', (req: Request, res: Response, next: NextFunction) =>
  imageController.getImageById(req, res, next),
);

router.get('/', (req: Request, res: Response, next: NextFunction) =>
  imageController.getAllImages(req, res, next),
);

router.delete('/:id', (req: Request, res: Response, next: NextFunction) =>
  imageController.deleteImage(req, res, next),
);


export default router;
