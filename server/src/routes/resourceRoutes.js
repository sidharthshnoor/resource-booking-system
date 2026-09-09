import { Router } from 'express';
import {
  createResourceHandler,
  deleteResourceHandler,
  getResource,
  listResources,
  updateResourceHandler
} from '../controllers/resourceController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { requirePasswordChangeComplete } from '../middleware/authMiddleware.js';
import { requireTenantUser } from '../middleware/tenantMiddleware.js';
import { requireAdmin } from '../middleware/adminMiddleware.js';

const resourceRoutes = Router();

resourceRoutes.use(requireAuth, requireTenantUser);

resourceRoutes.get('/', listResources);
resourceRoutes.get('/:id', getResource);
resourceRoutes.post('/', requireAdmin, requirePasswordChangeComplete, createResourceHandler);
resourceRoutes.put('/:id', requireAdmin, requirePasswordChangeComplete, updateResourceHandler);
resourceRoutes.delete('/:id', requireAdmin, requirePasswordChangeComplete, deleteResourceHandler);

export default resourceRoutes;