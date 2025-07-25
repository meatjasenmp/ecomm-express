import express, { type Request, type Response, type NextFunction } from 'express';
import { ProductController } from '../../controllers/ProductController.ts';

const router = express.Router();
const productController = new ProductController();

router.get('/', (req: Request, res: Response, next: NextFunction) => 
  productController.getPublicProducts(req, res, next)
);

router.get('/:slug', (req: Request, res: Response, next: NextFunction) => 
  productController.getProductBySlug(req, res, next)
);

export default router;