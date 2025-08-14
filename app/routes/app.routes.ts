import express from 'express';
import productRoutes from './products/index.ts';
import categoryRoutes from './categories/index.ts';
import imageRoutes from './images/index.ts';

const router = express.Router();

export default router;
