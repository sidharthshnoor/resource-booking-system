import { Router } from 'express';
import { getCurrentUser, login, register } from '../controllers/authController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const authRoutes = Router();

authRoutes.post('/register', register);
authRoutes.post('/login', login);
authRoutes.get('/me', requireAuth, getCurrentUser);

export default authRoutes;
