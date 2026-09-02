import express from 'express';
import authRoutes from './routes/authRoutes.js';
import adminBookingRoutes from './routes/adminBookingRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import healthRoutes from './routes/healthRoutes.js';
import resourceRoutes from './routes/resourceRoutes.js';
import adminUserRoutes from './routes/adminUserRoutes.js';

const app = express();

app.use(express.json());
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin/bookings', adminBookingRoutes);
app.use('/api/admin/users', adminUserRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/bookings', bookingRoutes);

export default app;
