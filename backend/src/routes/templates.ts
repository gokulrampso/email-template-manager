import { Router } from 'express';
import * as templateController from '../controllers/templateController.js';
import * as sampleDataController from '../controllers/sampleDataController.js';

const router = Router();

// Check name availability (must be before /:id routes)
router.get('/check-name', templateController.checkName);

// Sample data routes (must be before /:id routes)
router.get('/:id/sample-data', sampleDataController.get);
router.put('/:id/sample-data', sampleDataController.update);
router.delete('/:id/sample-data', sampleDataController.remove);

// Template CRUD routes
router.post('/', templateController.create);
router.get('/', templateController.list);
router.get('/:id', templateController.getById);
router.put('/:id', templateController.update);
router.delete('/:id', templateController.deleteTemplate);

// Version routes
router.get('/:id/versions', templateController.listVersions);
router.get('/:id/versions/:v', templateController.getVersion);
router.post('/:id/versions/:v/restore', templateController.restore);

export default router;

