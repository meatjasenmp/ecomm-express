import express from 'express';
import publicRouter from './public.ts';

const router = express.Router();

router.use([publicRouter]);

export default router;
