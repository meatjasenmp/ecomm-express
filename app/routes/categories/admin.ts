import express, { type Request, type Response, type NextFunction } from 'express';
import { CategoryController } from '../../controllers/CategoryController.ts';

const router = express.Router();
const categoryController = new CategoryController();

router.get('/', (req: Request, res: Response, next: NextFunction) =>
  categoryController.getAllCategories(req, res, next),
);

router.get('/:id', (req: Request, res: Response, next: NextFunction) =>
  categoryController.getCategoryById(req, res, next),
);

router.post('/', (req: Request, res: Response, next: NextFunction) =>
  categoryController.createCategory(req, res, next),
);

router.put('/:id', (req: Request, res: Response, next: NextFunction) =>
  categoryController.updateCategory(req, res, next),
);

router.delete('/:id', (req: Request, res: Response, next: NextFunction) =>
  categoryController.deleteCategory(req, res, next),
);

router.post('/:id/restore', (req: Request, res: Response, next: NextFunction) =>
  categoryController.restoreCategory(req, res, next),
);

router.put('/:id/image', (req: Request, res: Response, next: NextFunction) =>
  categoryController.setCategoryImage(req, res, next),
);

router.delete('/:id/image', (req: Request, res: Response, next: NextFunction) =>
  categoryController.removeCategoryImage(req, res, next),
);

export default router;