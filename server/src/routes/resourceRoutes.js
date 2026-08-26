import { Router } from 'express';
import {
  createResourceHandler,
  deleteResourceHandler,
  getResource,
  listResources,
  updateResourceHandler
} from '../controllers/resourceController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const resourceRoutes = Router();

resourceRoutes.get('/', listResources);
resourceRoutes.get('/:id', getResource);
resourceRoutes.post('/', requireAuth, createResourceHandler);
resourceRoutes.put('/:id', requireAuth, updateResourceHandler);
resourceRoutes.delete('/:id', requireAuth, deleteResourceHandler);

export default resourceRoutes;