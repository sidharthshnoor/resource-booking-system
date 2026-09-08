import { Router } from 'express';
import { changeBookingStatus, listAdminBookings } from '../controllers/adminBookingController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { requireAdmin } from '../middleware/adminMiddleware.js';
import { requireTenant } from '../middleware/tenantMiddleware.js';

const adminBookingRoutes = Router();

adminBookingRoutes.use(requireAuth, requireTenant, requireAdmin);
adminBookingRoutes.get('/', listAdminBookings);
adminBookingRoutes.put('/:id/:action(approve|reject)', changeBookingStatus);

export default adminBookingRoutes;