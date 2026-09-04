import { Router } from 'express';
import { 
  getCurrentUser, 
  login, 
  register,
  inviteUser,
  createAccount,
  forgotPassword,
  resendReset,
  resetPassword
} from '../controllers/authController.js';
import { requireAuth, requireAdmin } from '../middleware/authMiddleware.js';

const authRoutes = Router();

authRoutes.post('/register', register);
authRoutes.post('/login', login);
authRoutes.get('/me', requireAuth, getCurrentUser);

// New Auth Flow Routes
authRoutes.post('/invite', requireAuth, requireAdmin, inviteUser);
authRoutes.post('/create-account', createAccount);
authRoutes.post('/forgot-password', forgotPassword);
authRoutes.post('/resend-reset', resendReset);
authRoutes.post('/reset-password', resetPassword);

export default authRoutes;
