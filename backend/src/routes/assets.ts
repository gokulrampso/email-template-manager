import { Router } from 'express';
import multer from 'multer';
import * as assetController from '../controllers/assetController.js';

const router = Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Asset upload route
router.post('/upload', upload.single('file'), assetController.upload);

export default router;


