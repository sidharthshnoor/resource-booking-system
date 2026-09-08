import { Router } from 'express';
import { listUsers, updateUserStatus, deleteUser } from '../controllers/userController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { requireAdmin } from '../middleware/adminMiddleware.js';
import { requireTenant } from '../middleware/tenantMiddleware.js';

const adminUserRoutes = Router();
adminUserRoutes.use(requireAuth, requireTenant, requireAdmin);
adminUserRoutes.get('/', listUsers);
adminUserRoutes.patch('/:id/status', updateUserStatus);
adminUserRoutes.delete('/:id', deleteUser);
export default adminUserRoutes;