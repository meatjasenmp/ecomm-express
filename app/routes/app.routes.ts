import express from 'express';
import productRoutes from './products/index.ts';
import categoryRoutes from './categories/index.ts';
import imageRoutes from './images/index.ts';

const router = express.Router();

router.use('/api', productRoutes);
router.use('/api', categoryRoutes);
router.use('/api/images', imageRoutes);

export default router;
