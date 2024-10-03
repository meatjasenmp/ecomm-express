import express, { type Response } from 'express';
import db from '../db/conn';
import { PUBLIC_ROUTES } from './routes';

const publicRouter = express.Router();

publicRouter.get(`${PUBLIC_ROUTES.HOME}`, async (res: Response): Promise<void> => {
  const collection = db?.collection('comments');
  const results = await collection?.find({}).limit(10).toArray();

  console.info('Results:', results);
});

export default publicRouter;
