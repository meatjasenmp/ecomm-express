import express, { type Request, type Response, type NextFunction } from 'express';
import { AdminProductController } from '../../controllers/AdminProductController.ts';

const router = express.Router();
const adminProductController = new AdminProductController();

router.get('/', (req: Request, res: Response, next: NextFunction) =>
  adminProductController.getAllProducts(req, res, next),
);

router.get('/:id', (req: Request, res: Response, next: NextFunction) =>
  adminProductController.getProductById(req, res, next),
);

router.post('/', (req: Request, res: Response, next: NextFunction) =>
  adminProductController.createProduct(req, res, next),
);

router.put('/:id', (req: Request, res: Response, next: NextFunction) =>
  adminProductController.updateProduct(req, res, next),
);

router.delete('/:id', (req: Request, res: Response, next: NextFunction) =>
  adminProductController.deleteProduct(req, res, next),
);

router.post('/:id/restore', (req: Request, res: Response, next: NextFunction) =>
  adminProductController.restoreProduct(req, res, next),
);

router.post('/:id/images', (req: Request, res: Response, next: NextFunction) =>
  adminProductController.addProductImages(req, res, next),
);

router.delete('/:id/images', (req: Request, res: Response, next: NextFunction) =>
  adminProductController.removeProductImages(req, res, next),
);

router.put('/:id/images', (req: Request, res: Response, next: NextFunction) =>
  adminProductController.replaceProductImages(req, res, next),
);

export default router;
