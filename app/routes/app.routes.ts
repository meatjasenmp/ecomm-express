import express from 'express';
import publicRouter from './public';
import adminRouter from './admin';

const router = express.Router();

router.use([publicRouter, adminRouter]);

export default router;
