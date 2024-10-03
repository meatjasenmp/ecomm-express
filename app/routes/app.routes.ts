import express from 'express';
import publicRouter from './public';

const router = express.Router();

router.use(publicRouter);

export default router;