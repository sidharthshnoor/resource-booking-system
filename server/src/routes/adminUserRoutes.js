import { Router } from 'express';
import { listUsers, updateUserStatus } from '../controllers/userController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { requireAdmin } from '../middleware/adminMiddleware.js';

const adminUserRoutes = Router();
adminUserRoutes.use(requireAuth, requireAdmin);
adminUserRoutes.get('/', listUsers);
adminUserRoutes.patch('/:id/status', updateUserStatus);
export default adminUserRoutes;