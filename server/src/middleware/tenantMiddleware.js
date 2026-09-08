import { pool } from '../config/database.js';

export async function requireTenant(request, response, next) {
  if (!request.user || !request.user.organization_id) {
    return response.status(401).json({
      success: false,
      message: 'Organization context is missing from authenticated session.'
    });
  }

  try {
    const result = await pool.query('SELECT status FROM organizations WHERE id = $1', [request.user.organization_id]);
    if (result.rows.length === 0) {
      return response.status(403).json({ success: false, message: 'Organization not found.' });
    }
    
    if (result.rows[0].status === 'DEACTIVATED') {
      return response.status(403).json({ success: false, message: 'Organization is deactivated.' });
    }

    // Bind the tenant ID strictly to the user's JWT context.
    request.organizationId = request.user.organization_id;
    return next();
  } catch (error) {
    return response.status(500).json({ success: false, message: 'Unable to verify organization.' });
  }
}
