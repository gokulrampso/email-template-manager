import { Router } from 'express';
import templateRoutes from './templates.js';
import assetRoutes from './assets.js';

const router = Router();

// Mount routes
router.use('/templates', templateRoutes);
router.use('/assets', assetRoutes);

export default router;

