import express, { type Request, type Response } from 'express';
import Product from '../db/models/Product.ts';

const publicRouter = express.Router();

publicRouter.get('/', async (_: Request, res: Response): Promise<void> => {
  const products = await Product.find();
  res.json(products);
});

export default publicRouter;
