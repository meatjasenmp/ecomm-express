import express, { type Request, type Response } from 'express';
import Category, { type CategoryInterface, type CategoryRequest } from '../db/models/Categories.ts';

const categoryRoutes = express.Router();

categoryRoutes.post('/create-category', async (req: Request<CategoryInterface>, res: Response): Promise<void> => {
  const category = new Category(req.body);

  try {
    const savedCategory = await category.save();
    res.json(savedCategory).status(201);
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
    const updateCategory = await Category.findById(id);
    res.json(updateCategory).status(200);
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
    const deletedCategorry = await Category.deleteOne({ _id: id });
    res.json(deletedCategorry).status(200);
  } catch (err) {
    res.status(400).send({
      message: 'Failed to delete category',
      error: err,
    });
  }
});

export default categoryRoutes;
