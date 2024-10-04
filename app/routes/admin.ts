import express, { type Request, type Response } from 'express';
import Product, { type ProductInterface, type ProductRequest } from '../db/models/Product';

const adminRouter = express.Router();

adminRouter.post('/create-products', async (req: Request<ProductInterface>, res: Response): Promise<void> => {
  const product = new Product({
    title: req.body.title,
    description: req.body.description,
  });

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
  '/update-products/products/:id',
  async (req: Request<ProductRequest>, res: Response): Promise<void> => {
    const { id, ...rest } = req.params;

    try {
      const updatedProduct = await Product.updateOne({ _id: id, ...rest });
      res.json(updatedProduct).status(200);
    } catch (err) {
      res.status(400).send({
        message: 'Failed to update product',
        error: err,
      });
    }
  },
);

export default adminRouter;
