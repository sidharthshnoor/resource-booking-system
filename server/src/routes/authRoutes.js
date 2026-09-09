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

const authRoutes = Router();

authRoutes.post('/register/:slug', register);
authRoutes.post('/login', login);
authRoutes.get('/me', requireAuth, requireTenant, getCurrentUser);
authRoutes.post('/change-password', requireAuth, requireTenant, changePassword);

// New Auth Flow Routes
authRoutes.post('/invite', requireAuth, requireTenant, requireAdmin, inviteUser);
authRoutes.post('/create-account', createAccount);
authRoutes.post('/forgot-password', forgotPassword);
authRoutes.post('/resend-reset', resendReset);
authRoutes.post('/reset-password', resetPassword);

export default authRoutes;
