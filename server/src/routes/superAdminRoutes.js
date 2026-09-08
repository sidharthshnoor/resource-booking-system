import express from 'express';
import { requireAuth, requireSuperAdmin } from '../middleware/authMiddleware.js';
import {
  listOrganizations,
  createOrganization,
  getOrganizationDetails,
  updateOrganizationStatus,
  provisionFirstAdmin,
  deleteOrganization
} from '../controllers/superAdminController.js';

const router = express.Router();

// All routes here require both authentication and SUPER_ADMIN role
router.use(requireAuth, requireSuperAdmin);

// Organization Management
router.get('/organizations', listOrganizations);
router.post('/organizations', createOrganization);
router.get('/organizations/:id', getOrganizationDetails);
router.patch('/organizations/:id/status', updateOrganizationStatus);
router.post('/organizations/:id/admins', provisionFirstAdmin);
router.delete('/organizations/:id', deleteOrganization);

export default router;
