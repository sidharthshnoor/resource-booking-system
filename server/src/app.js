import express from 'express';
import authRoutes from './routes/authRoutes.js';
import adminBookingRoutes from './routes/adminBookingRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import healthRoutes from './routes/healthRoutes.js';
import resourceRoutes from './routes/resourceRoutes.js';
import adminUserRoutes from './routes/adminUserRoutes.js';
import organizationRoutes from './routes/organizationRoutes.js';
import superAdminRoutes from './routes/superAdminRoutes.js';
import { env } from './config/env.js';
import { apiLimiter } from './middleware/rateLimiter.js';

const app = express();
app.set('trust proxy', 1);

app.use((request, response, next) => {
	const requestOrigin = request.headers.origin;
	const allowedOrigins = [env.frontendUrl, 'http://localhost:5173'];

	if (requestOrigin && allowedOrigins.includes(requestOrigin)) {
		response.setHeader('Access-Control-Allow-Origin', requestOrigin);
		response.setHeader('Vary', 'Origin');
		response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
		response.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
	}

	if (request.method === 'OPTIONS') {
		return response.sendStatus(requestOrigin && allowedOrigins.includes(requestOrigin) ? 204 : 403);
	}

	return next();
});

app.use(express.json());

app.use('/api', apiLimiter);

app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin/bookings', adminBookingRoutes);
app.use('/api/admin/users', adminUserRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/organizations', organizationRoutes);
app.use('/api/super-admin', superAdminRoutes);

export default app;
