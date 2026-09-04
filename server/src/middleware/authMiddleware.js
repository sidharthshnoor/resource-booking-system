import jwt from 'jsonwebtoken';
import { pool } from '../config/database.js';
import { env } from '../config/env.js';
import { sanitizeUser } from '../utils/user.js';

export async function requireAuth(request, response, next) {
  const authorizationHeader = request.headers.authorization || '';
  const match = authorizationHeader.match(/^Bearer\s+(.+)$/i);

  if (!match) {
    return response.status(401).json({
      success: false,
      message: 'Authentication token is required.'
    });
  }

  const token = match[1];

  try {
    const payload = jwt.verify(token, env.jwtSecret);

    if (!payload || !payload.sub) {
      return response.status(401).json({
        success: false,
        message: 'Invalid or expired token.'
      });
    }

    const result = await pool.query(
      'SELECT id, name, email, role, created_at, updated_at FROM users WHERE id = $1',
      [payload.sub]
    );

    if (result.rows.length === 0) {
      return response.status(401).json({
        success: false,
        message: 'Invalid or expired token.'
      });
    }

    request.user = sanitizeUser(result.rows[0]);
    return next();
  } catch (error) {
    return response.status(401).json({
      success: false,
      message: 'Invalid or expired token.'
    });
  }
}

export function requireAdmin(request, response, next) {
  if (!request.user || request.user.role !== 'ADMIN') {
    return response.status(403).json({
      success: false,
      message: 'Access denied. Administrator privileges required.'
    });
  }
  return next();
}
