import { Router } from 'express';
import {
  cancelBookingHandler,
  createBookingHandler,
  getBooking,
  listBookings,
  listResourceBookings
} from '../controllers/bookingController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { requireTenant } from '../middleware/tenantMiddleware.js';

const bookingRoutes = Router();

bookingRoutes.use(requireAuth, requireTenant);
bookingRoutes.get('/', listBookings);
bookingRoutes.get('/resource/:id', listResourceBookings);
bookingRoutes.post('/', createBookingHandler);
bookingRoutes.get('/:id', getBooking);
bookingRoutes.delete('/:id', cancelBookingHandler);

export default bookingRoutes;
