import express, { type Request, type Response } from 'express';
import Product from '../db/models/Product';
import { ADMIN_ROUTES } from './types.ts';

const adminRouter = express.Router();

adminRouter.post(`${ADMIN_ROUTES.CREATE_PRODUCTS}`, async (_: Request, res: Response): Promise<void> => {
  const product = await Product.create({
    title: 'New Product',
    description: 'This is a new product.',
  });
  res.json(product);
});

export default adminRouter;
