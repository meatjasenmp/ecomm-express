import express from 'express';
import publicProductRoutes from './public.ts';
import adminProductRoutes from './admin.ts';

const router = express.Router();

router.use('/products', publicProductRoutes);
router.use('/admin/products', adminProductRoutes);

export default router;
