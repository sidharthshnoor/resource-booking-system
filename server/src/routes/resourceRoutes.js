import { Router } from 'express';
import {
  createResourceHandler,
  deleteResourceHandler,
  getResource,
  listResources,
  updateResourceHandler
} from '../controllers/resourceController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { requireTenant } from '../middleware/tenantMiddleware.js';

const resourceRoutes = Router();

resourceRoutes.use(requireAuth, requireTenant);

resourceRoutes.get('/', listResources);
resourceRoutes.get('/:id', getResource);
resourceRoutes.post('/', createResourceHandler);
resourceRoutes.put('/:id', updateResourceHandler);
resourceRoutes.delete('/:id', deleteResourceHandler);

export default resourceRoutes;