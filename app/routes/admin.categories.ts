import express, { type Request, type Response } from 'express';
import Category, { type CategoryInterface, type CategoryRequest } from '../db/models/Categories.ts';

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

categoryRoutes.post('/create-category', async (req: Request<CategoryInterface>, res: Response): Promise<void> => {
  const category = new Category(req.body);

  try {
    const savedCategory: CategoryInterface = await category.save();
    res.status(201).json(savedCategory);
  } catch (err) {
    res.status(400).send({
      message: 'Failed to create category',
      error: err,
    });
  }
});

categoryRoutes.patch('/update-category/:id', async (req: Request<CategoryRequest>, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    await Category.updateOne({ _id: id }, req.body);
    const updateCategory: CategoryInterface | null = await Category.findById(id);
    res.status(200).json(updateCategory);
  } catch (err) {
    res.status(400).send({
      message: 'Failed to update category',
      error: err,
    });
  }
});

categoryRoutes.delete('/delete-category/:id', async (req: Request, res: Response): Promise<void> => {
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
});

export default categoryRoutes;
