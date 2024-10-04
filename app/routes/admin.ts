import express, { type Request, type Response } from 'express';
import Product, { type ProductInterface, type ProductRequest } from '../db/models/Product';

const adminRouter = express.Router();

adminRouter.post('/create-products', async (_: Request<ProductInterface>, res: Response): Promise<void> => {
  await Product.create({
    title: 'New Product',
    description: 'This is a new product.',
  })
    .then((product) => {
      res.json(product).status(201);
    })
    .catch(() => {
      res.status(400).send('Failed to create product');
    });
});

adminRouter.patch(
  '/update-products/products/:id',
  async (req: Request<ProductRequest>, res: Response): Promise<void> => {
    const { id, ...rest } = req.params;

    await Product.updateOne({ _id: id }, rest)
      .then((product) => {
        res.json(product).status(200);
      })
      .catch(() => {
        res.status(400).send('Failed to update product');
      });
  },
);

export default adminRouter;
