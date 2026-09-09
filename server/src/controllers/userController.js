import bcrypt from 'bcrypt';
import { pool } from '../config/database.js';
import { findUsers, updateUserStatus as updateStatusInDb, getUserById, deleteUserById, createAdmin as createAdminInDb } from '../models/userModel.js';

const validRoles = new Set(['USER', 'ADMIN']);
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function createAdmin(request, response) {
  const name = typeof request.body?.name === 'string' ? request.body.name.trim() : '';
  const email = typeof request.body?.email === 'string' ? request.body.email.trim().toLowerCase() : '';
  const password = typeof request.body?.password === 'string' ? request.body.password : '';

  if (!name || !email || !password) {
    return response.status(400).json({ success: false, message: 'Name, email, and password are required.' });
  }
  if (!emailPattern.test(email)) {
    return response.status(400).json({ success: false, message: 'Please provide a valid email address.' });
  }
  if (password.length < 8) {
    return response.status(400).json({ success: false, message: 'Password must be at least 8 characters long.' });
  }

  try {
    const existingUser = await pool.query('SELECT id FROM users WHERE LOWER(email) = $1', [email]);
    if (existingUser.rows.length > 0) {
      return response.status(409).json({ success: false, message: 'A user with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const admin = await createAdminInDb({ name, email, passwordHash, organizationId: request.organizationId });
    return response.status(201).json({
      success: true,
      admin,
      message: 'Admin account created successfully. Share the temporary login credentials securely with the administrator.'
    });
  } catch (error) {
    if (error?.code === '23505') {
      return response.status(409).json({ success: false, message: 'A user with this email already exists.' });
    }
    return response.status(500).json({ success: false, message: 'Unable to create admin account.' });
  }
}

export async function listUsers(request, response) {
  const search = typeof request.query.search === 'string' ? request.query.search.trim() : '';
  const roleValue = typeof request.query.role === 'string' ? request.query.role.trim().toUpperCase() : '';
  const role = roleValue && roleValue !== 'ALL' ? roleValue : null;
  if (role && !validRoles.has(role)) return response.status(400).json({ success: false, message: 'Role must be USER, ADMIN, or ALL.' });
  try {
    return response.json({ success: true, users: await findUsers({ search, role, organizationId: request.organizationId }) });
  } catch (_error) {
    return response.status(500).json({ success: false, message: 'Unable to retrieve users at this time.' });
  }
}

export async function updateUserStatus(request, response) {
  const { id } = request.params;
  const { status } = request.body;
  if (status !== 'ACTIVE' && status !== 'DEACTIVATED') {
    return response.status(400).json({ success: false, message: 'Invalid status provided.' });
  }
  
  try {
    const updatedUser = await updateStatusInDb(id, status, request.organizationId);
    if (!updatedUser) {
      return response.status(404).json({ success: false, message: 'User not found.' });
    }
    return response.json({ success: true, user: updatedUser });
  } catch (_error) {
    return response.status(500).json({ success: false, message: 'Unable to update user status.' });
  }
}

export async function deleteUser(request, response) {
  const { id } = request.params;
  const currentUserId = request.user?.id; // Assuming authMiddleware sets request.user

  if (String(id) === String(currentUserId)) {
    return response.status(403).json({ success: false, message: 'You cannot delete your own account.' });
  }

  try {
    const userToDel = await getUserById(id, request.organizationId);
    if (!userToDel) {
      return response.status(404).json({ success: false, message: 'User not found.' });
    }

    if (userToDel.role === 'ADMIN' || userToDel.role === 'SUPER_ADMIN') {
      return response.status(403).json({ success: false, message: 'Administrator accounts cannot be deleted here.' });
    }

    await deleteUserById(id, userToDel.email, request.organizationId);
    return response.json({ success: true, message: 'User deleted successfully.' });
  } catch (error) {
    console.error('Delete user error:', error);
    return response.status(500).json({ success: false, message: 'Unable to delete user.' });
  }
}