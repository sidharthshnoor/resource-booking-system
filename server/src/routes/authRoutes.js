import { Router } from 'express';
import { 
  getCurrentUser, 
  login, 
  register,
  changePassword,
  inviteUser,
  createAccount,
  forgotPassword,
  resendReset,
  resetPassword
} from '../controllers/authController.js';
import { requireAuth, requireAdmin } from '../middleware/authMiddleware.js';
import { requireTenant } from '../middleware/tenantMiddleware.js';
import { loginLimiter, registerLimiter, passwordResetLimiter } from '../middleware/rateLimiter.js';

const authRoutes = Router();

authRoutes.post('/register/:slug', registerLimiter, register);
authRoutes.post('/login', loginLimiter, login);
authRoutes.get('/me', requireAuth, requireTenant, getCurrentUser);
authRoutes.post('/change-password', requireAuth, requireTenant, changePassword);

// New Auth Flow Routes
authRoutes.post('/invite', requireAuth, requireTenant, requireAdmin, inviteUser);
authRoutes.post('/create-account', createAccount);
authRoutes.post('/forgot-password', passwordResetLimiter, forgotPassword);
authRoutes.post('/resend-reset', passwordResetLimiter, resendReset);
authRoutes.post('/reset-password', resetPassword);

export default authRoutes;
