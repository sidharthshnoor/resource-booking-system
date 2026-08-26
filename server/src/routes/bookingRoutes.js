import { Router } from 'express';
import {
  cancelBookingHandler,
  createBookingHandler,
  getBooking,
  listBookings
} from '../controllers/bookingController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const bookingRoutes = Router();

bookingRoutes.use(requireAuth);
bookingRoutes.get('/', listBookings);
bookingRoutes.post('/', createBookingHandler);
bookingRoutes.get('/:id', getBooking);
bookingRoutes.delete('/:id', cancelBookingHandler);

export default bookingRoutes;
