import express, { type Request, type Response, type NextFunction } from 'express';
import { ProductController } from '../../controllers/ProductController.ts';

const router = express.Router();
const productController = new ProductController();

router.get('/', (req: Request, res: Response, next: NextFunction) =>
  productController.getAllProducts(req, res, next),
);

router.get('/:id', (req: Request, res: Response, next: NextFunction) =>
  productController.getProductById(req, res, next),
);

router.post('/', (req: Request, res: Response, next: NextFunction) =>
  productController.createProduct(req, res, next),
);

router.put('/:id', (req: Request, res: Response, next: NextFunction) =>
  productController.updateProduct(req, res, next),
);

router.delete('/:id', (req: Request, res: Response, next: NextFunction) =>
  productController.deleteProduct(req, res, next),
);

router.post('/:id/restore', (req: Request, res: Response, next: NextFunction) =>
  productController.restoreProduct(req, res, next),
);

router.post('/:id/images', (req: Request, res: Response, next: NextFunction) =>
  productController.addProductImages(req, res, next),
);

router.delete('/:id/images', (req: Request, res: Response, next: NextFunction) =>
  productController.removeProductImages(req, res, next),
);

router.put('/:id/images', (req: Request, res: Response, next: NextFunction) =>
  productController.replaceProductImages(req, res, next),
);

export default router;
