import express from 'express';
import publicCategoryRoutes from './public.ts';
import adminCategoryRoutes from './admin.ts';

const router = express.Router();

router.use('/categories', publicCategoryRoutes);
router.use('/admin/categories', adminCategoryRoutes);

export default router;