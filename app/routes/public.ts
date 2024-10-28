import express, { type Request, type Response } from 'express';
import Product from '../db/models/Products.ts';

const publicRouter = express.Router();

publicRouter.get('/', async (_: Request, res: Response): Promise<void> => {
  try {
    const products = await Product.find().limit(20);
    res.json(products).status(200);
  } catch (err) {
    res.status(400).send({
      message: 'Failed to fetch products',
      error: err,
    });
  }
});

export default publicRouter;
