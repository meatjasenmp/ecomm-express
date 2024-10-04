import express, { type Request, type Response } from 'express';
import mongoose from 'mongoose';
import Product from '../db/models/Product';
import { ADMIN_ROUTES } from './types.ts';

const adminRouter = express.Router();

adminRouter.post(`${ADMIN_ROUTES.CREATE_PRODUCT}`, async (_: Request, res: Response): Promise<void> => {});
