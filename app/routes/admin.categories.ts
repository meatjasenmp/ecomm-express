import express, { type Request, type Response } from 'express';
import Category, { type CategoryInterface } from '../db/models/Categories.ts';
import { validate, validateParams } from '../middleware/validation.ts';
import { CategorySchema, CategoryUpdateSchema, IdParamsSchema } from '../validation/schemas.ts';
import type { CategoryInput, CategoryUpdateInput } from '../validation/schemas.ts';

const categoryRoutes = express.Router();

categoryRoutes.get('/categories', async (_req: Request, res: Response): Promise<void> => {
  try {
    const categories: CategoryInterface[] = await Category.find();
    res.status(200).json(categories);
  } catch (err) {
    res.status(400).send({
      message: 'Failed to fetch categories',
      error: err,
    });
  }
});

categoryRoutes.post(
  '/create-category',
  validate(CategorySchema),
  async (req: Request, res: Response): Promise<void> => {
    const categoryData: CategoryInput = req.body;
    const category = new Category(categoryData);

    try {
      const savedCategory: CategoryInterface = await category.save();
      res.status(201).json(savedCategory);
    } catch (err) {
      res.status(400).send({
        message: 'Failed to create category',
        error: err,
      });
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
