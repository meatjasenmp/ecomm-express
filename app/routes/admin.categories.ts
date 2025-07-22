import express, { type Request, type Response } from 'express';
import Category, { type CategoryInterface } from '../db/models/Categories.ts';
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
import {
  createCategoryWithHierarchy,
  getCategoriesPaginated,
} from '../helpers/category-utils.ts';
import { handleCategoryError } from '../helpers/category-error-handler.ts';

const categoryRoutes = express.Router();

categoryRoutes.get(
  '/categories',
  validateQuery(CategoryQuerySchema),
  async (_req: Request, res: Response): Promise<void> => {
    try {
      const queryParams = res.locals.parsedQuery as CategoryQueryInput;
      const result = await getCategoriesPaginated(queryParams);
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
      const savedCategory = await createCategoryWithHierarchy(categoryData);
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
      await Category.updateOne({ _id: id }, updateData);
      const updateCategory: CategoryInterface | null = await Category.findById(id);
      res.status(200).json(updateCategory);
    } catch (err) {
      res.status(400).send({
        message: 'Failed to update category',
        error: err,
      });
    }
  },
);

categoryRoutes.delete(
  '/delete-category/:id',
  validateParams(IdParamsSchema),
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    try {
      const deletedCategory = await Category.deleteOne({ _id: id });
      res.status(200).json(deletedCategory);
    } catch (err) {
      res.status(400).send({
        message: 'Failed to delete category',
        error: err,
      });
    }
  },
);

export default categoryRoutes;
