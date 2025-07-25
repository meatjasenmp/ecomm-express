import express from 'express';
import productRoutes from './products/index.ts';

const router = express.Router();

router.use(productRoutes);

export default router;
