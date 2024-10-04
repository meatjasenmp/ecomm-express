import express, { type Request, type Response } from 'express';
import Product, { type ProductInterface, type ProductRequest } from '../db/models/Product';

const adminRouter = express.Router();

adminRouter.post('/create-product', async (req: Request<ProductInterface>, res: Response): Promise<void> => {
  const product = new Product({ ...req.body });

  try {
    const savedProduct = await product.save();
    res.json(savedProduct).status(201);
  } catch (err) {
    res.status(400).send({
      message: 'Failed to create product',
      error: err,
    });
  }
});

adminRouter.patch(
  '/update-product/products/:id',
  async (req: Request<ProductRequest>, res: Response): Promise<void> => {
    const { id } = req.params;

    try {
      const updatedProduct = await Product.updateOne({ _id: id, ...req.body });
      res.json(updatedProduct).status(200);
    } catch (err) {
      res.status(400).send({
        message: 'Failed to update product',
        error: err,
      });
    }
  },
);

adminRouter.delete('/delete-product/products/:id', async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    await Product.deleteOne({ _id: id });
  } catch (err) {
    res.status(400).send({
      message: 'Failed to delete product',
      error: err,
    });
  }
});

export default adminRouter;
