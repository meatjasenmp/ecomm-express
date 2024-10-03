import express, { NextFunction, Request, Response } from 'express';
import { PUBLIC_ROUTES } from './routes';

const publicRouter = express.Router();

publicRouter.get(`${PUBLIC_ROUTES.HOME}`, async (_: Request, res: Response, next: NextFunction): Promise<void> => {
  res.json({ message: 'Home Page' });
});

export default publicRouter;
