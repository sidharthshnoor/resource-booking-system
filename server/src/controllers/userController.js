import { findUsers, updateUserStatus as updateStatusInDb } from '../models/userModel.js';

const validRoles = new Set(['USER', 'ADMIN']);

export async function listUsers(request, response) {
  const search = typeof request.query.search === 'string' ? request.query.search.trim() : '';
  const roleValue = typeof request.query.role === 'string' ? request.query.role.trim().toUpperCase() : '';
  const role = roleValue && roleValue !== 'ALL' ? roleValue : null;
  if (role && !validRoles.has(role)) return response.status(400).json({ success: false, message: 'Role must be USER, ADMIN, or ALL.' });
  try {
    return response.json({ success: true, users: await findUsers({ search, role }) });
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
    const updatedUser = await updateStatusInDb(id, status);
    if (!updatedUser) {
      return response.status(404).json({ success: false, message: 'User not found.' });
    }
    return response.json({ success: true, user: updatedUser });
  } catch (_error) {
    return response.status(500).json({ success: false, message: 'Unable to update user status.' });
  }
}