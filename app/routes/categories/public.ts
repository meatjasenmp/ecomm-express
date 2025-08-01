import express, { type Request, type Response, type NextFunction } from 'express';
import { CategoryController } from '../../controllers/CategoryController.ts';

const router = express.Router();
const categoryController = new CategoryController();

router.get('/', (req: Request, res: Response, next: NextFunction) => {
  req.query.isPublished = 'true';
  return categoryController.getAllCategories(req, res, next);
});

router.get('/:slug', (req: Request, res: Response, next: NextFunction) =>
  categoryController.getCategoryBySlug(req, res, next),
);

export default router;