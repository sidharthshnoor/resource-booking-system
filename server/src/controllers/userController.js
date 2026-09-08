import { findUsers, updateUserStatus as updateStatusInDb, getUserById, deleteUserById } from '../models/userModel.js';

const validRoles = new Set(['USER', 'ADMIN']);

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

    if (userToDel.role === 'ADMIN') {
      return response.status(403).json({ success: false, message: 'Admin users cannot be deleted.' });
    }

    await deleteUserById(id, userToDel.email, request.organizationId);
    return response.json({ success: true, message: 'User deleted successfully.' });
  } catch (error) {
    console.error('Delete user error:', error);
    return response.status(500).json({ success: false, message: 'Unable to delete user.' });
  }
}