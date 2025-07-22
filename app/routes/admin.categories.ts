import express, { type Request, type Response } from 'express';
import { validate, validateParams, validateQuery } from '../middleware/validation.ts';
import { IdParamsSchema } from '../validation/schemas/common.ts';
import { 
  CategorySchema, 
  CategoryUpdateSchema, 
  CategoryQuerySchema,
  type CategoryInput, 
  type CategoryUpdateInput, 
  type CategoryQueryInput 
} from '../validation/schemas/category.ts';
import categoryService from '../services/category/CategoryService.ts';
import { handleCategoryError } from '../helpers/category-error-handler.ts';

const categoryRoutes = express.Router();

categoryRoutes.get(
  '/categories',
  validateQuery(CategoryQuerySchema),
  async (_req: Request, res: Response): Promise<void> => {
    try {
      const queryParams = res.locals.parsedQuery as CategoryQueryInput;
      const result = await categoryService.getCategories(queryParams);
      res.status(200).json(result);
    } catch (err) {
      handleCategoryError(err, res);
    }
  },
);

categoryRoutes.post(
  '/create-category',
  validate(CategorySchema),
  async (req: Request, res: Response): Promise<void> => {
    const categoryData: CategoryInput = req.body;

    try {
      const savedCategory = await categoryService.createCategory(categoryData);
      res.status(201).json(savedCategory);
    } catch (err) {
      handleCategoryError(err, res);
    }
  },
);

categoryRoutes.patch(
  '/update-category/:id',
  validateParams(IdParamsSchema),
  validate(CategoryUpdateSchema),
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const updateData: CategoryUpdateInput = req.body;

    try {
      const updatedCategory = await categoryService.updateCategory(id, updateData);
      res.status(200).json(updatedCategory);
    } catch (err) {
      handleCategoryError(err, res);
    }
  },
);

categoryRoutes.delete(
  '/delete-category/:id',
  validateParams(IdParamsSchema),
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    try {
      await categoryService.deleteCategory(id);
      res.status(200).json({ message: 'Category deleted successfully' });
    } catch (err) {
      handleCategoryError(err, res);
    }
  },
);

categoryRoutes.get(
  '/categories/tree',
  async (req: Request, res: Response): Promise<void> => {
    try {
      const rootLevel = req.query.rootLevel ? parseInt(req.query.rootLevel as string) : 0;
      const includeInactive = req.query.includeInactive === 'true';
      const tree = await categoryService.getCategoryTree(rootLevel, includeInactive);
      res.status(200).json(tree);
    } catch (err) {
      handleCategoryError(err, res);
    }
  },
);

categoryRoutes.get(
  '/categories/:id/ancestors',
  validateParams(IdParamsSchema),
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    try {
      const ancestors = await categoryService.getCategoryAncestors(id);
      res.status(200).json(ancestors);
    } catch (err) {
      handleCategoryError(err, res);
    }
  },
);

categoryRoutes.get(
  '/categories/:id/descendants',
  validateParams(IdParamsSchema),
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    try {
      const descendants = await categoryService.getCategoryDescendants(id);
      res.status(200).json(descendants);
    } catch (err) {
      handleCategoryError(err, res);
    }
  },
);

export default categoryRoutes;
