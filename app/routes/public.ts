import express, { type Request, type Response } from 'express';
import db from '../db/conn';
import { PUBLIC_ROUTES } from './types.ts';

const publicRouter = express.Router();

publicRouter.get(`${PUBLIC_ROUTES.HOME}`, async (_: Request, res: Response): Promise<void> => {
  const collection = db?.collection('products');
  const results = await collection?.find({}).limit(10).toArray();

  res.send(results);
});

export default publicRouter;
