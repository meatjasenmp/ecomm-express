import express from 'express';
import publicRouter from './public';
import productRoutes from './admin.products.ts';
import categoryRoutes from './admin.categories.ts';
import uploadRoutes from './admin.upload.ts';

const router = express.Router();

router.use([publicRouter, productRoutes, categoryRoutes, uploadRoutes]);

export default router;
