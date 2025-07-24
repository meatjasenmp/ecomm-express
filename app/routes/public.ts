import express, { type Request, type Response } from 'express';

const publicRouter = express.Router();

publicRouter.get('/products', async (_: Request, res: Response): Promise<void> => {
  console.info('GET /products');
});

publicRouter.get('/product/:id', async (req: Request, res: Response): Promise<void> => {
  console.info('GET /product/:id');
});

export default publicRouter;
