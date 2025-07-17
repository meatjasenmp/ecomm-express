import express, { type Request, type Response } from 'express';
import Product from '../db/models/Products.ts';

const publicRouter = express.Router();

publicRouter.get('/', async (_: Request, res: Response): Promise<void> => {
  try {
    const products = await Product.find().limit(20);
    res.status(200).json(products);
  } catch (err) {
    res.status(400).send({
      message: 'Failed to fetch products',
      error: err,
    });
  }
});

publicRouter.get('/product/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await Product.findById(req.params.id);
    res.status(200).json(product);
  } catch (err) {
    res.status(400).send({
      message: 'Failed to fetch product',
      error: err,
    });
  }
});

export default publicRouter;
