import express from 'express';
import { requireAuth, requireSuperAdmin } from '../middleware/authMiddleware.js';
import {
  listOrganizations,
  createOrganization,
  getOrganizationDetails,
  updateOrganization,
  updateOrganizationStatus,
  provisionFirstAdmin,
  updateOrganizationAdmin,
  deleteOrganizationAdmin,
  deleteOrganization
} from '../controllers/superAdminController.js';

const router = express.Router();

// All routes here require both authentication and SUPER_ADMIN role
router.use(requireAuth, requireSuperAdmin);

router.get('/organizations', listOrganizations);
router.post('/organizations', createOrganization);
router.get('/organizations/:id', getOrganizationDetails);
router.patch('/organizations/:id', updateOrganization);
router.patch('/organizations/:id/status', updateOrganizationStatus);
router.post('/organizations/:id/admins', provisionFirstAdmin);
router.patch('/organizations/:id/admins/:adminId', updateOrganizationAdmin);
router.delete('/organizations/:id/admins/:adminId', deleteOrganizationAdmin);
router.delete('/organizations/:id', deleteOrganization);

export default router;
