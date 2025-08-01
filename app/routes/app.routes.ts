import express from 'express';
import productRoutes from './products/index.ts';
import categoryRoutes from './categories/index.ts';
import imageRoutes from './images/index.ts';

const router = express.Router();

router.use(productRoutes);
router.use(categoryRoutes);
router.use('/images', imageRoutes);

export default router;
