import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { pool } from '../config/database.js';
import { env } from '../config/env.js';
import { sanitizeUser } from '../utils/user.js';
import { updateLastLogin, updatePassword as updatePasswordInDb } from '../models/userModel.js';
import { sendInvitationEmail, sendPasswordResetEmail } from '../utils/email.js';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function buildError(response, statusCode, message) {
  return response.status(statusCode).json({
    success: false,
    message
  });
}

export async function register(request, response) {
  const organizationSlug = typeof request.params?.slug === 'string' ? request.params.slug.trim() : '';
  const name = typeof request.body?.name === 'string' ? request.body.name.trim() : '';
  const email = typeof request.body?.email === 'string' ? request.body.email.trim() : '';
  const password = typeof request.body?.password === 'string' ? request.body.password : '';

  if (!organizationSlug) {
    return buildError(response, 400, 'Organization is required.');
  }

  if (!name || !email || !password) {
    return buildError(response, 400, 'Name, email, and password are required.');
  }

  if (!emailPattern.test(email)) {
    return buildError(response, 400, 'Please provide a valid email address.');
  }

  if (password.length < 8) {
    return buildError(response, 400, 'Password must be at least 8 characters long.');
  }

  try {
    const organizationResult = await pool.query(
      'SELECT id, status FROM organizations WHERE LOWER(slug) = LOWER($1)',
      [organizationSlug]
    );

    if (organizationResult.rows.length === 0) {
      return buildError(response, 404, 'Organization not found.');
    }

    const organization = organizationResult.rows[0];
    if (organization.status !== 'ACTIVE') {
      return buildError(response, 403, 'Organization is inactive.');
    }

    const existingUser = await pool.query(
      'SELECT id, status FROM users WHERE LOWER(email) = LOWER($1)',
      [email]
    );

    if (existingUser.rows.length > 0) {
      if (existingUser.rows[0].status === 'DEACTIVATED') {
        return buildError(response, 403, 'This email has been blocked. Please contact the organization.');
      }
      return buildError(response, 409, 'A user with this email already exists.');
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash, role, status, organization_id)
       VALUES ($1, $2, $3, 'USER', 'ACTIVE', $4)
       RETURNING id, name, email, role, status, organization_id, created_at, updated_at`,
      [name, email, passwordHash, organization.id]
    );

    return response.status(201).json({
      success: true,
      user: sanitizeUser(result.rows[0])
    });
  } catch (error) {
    if (error && error.code === '23505') {
      return buildError(response, 409, 'A user with this email already exists.');
    }

    return buildError(response, 500, 'Unable to register user at this time.');
  }
}

export async function login(request, response) {
  const email = typeof request.body?.email === 'string' ? request.body.email.trim() : '';
  const password = typeof request.body?.password === 'string' ? request.body.password : '';
  const organizationSlug = typeof request.body?.organizationSlug === 'string' ? request.body.organizationSlug.trim() : null;

  if (!email || !password) {
    return buildError(response, 400, 'Email and password are required.');
  }

  if (!emailPattern.test(email)) {
    return buildError(response, 401, 'Invalid email or password.');
  }

  try {
    const result = await pool.query(
      'SELECT u.*, o.slug as org_slug, o.status as org_status FROM users u JOIN organizations o ON o.id = u.organization_id WHERE LOWER(u.email) = LOWER($1)',
      [email]
    );

    const user = result.rows[0];

    if (!user) {
      return buildError(response, 401, 'Invalid email or password.');
    }

    if (user.status === 'DEACTIVATED') {
      return buildError(response, 403, "User doesn't exist. Please contact the organization.");
    }
    
    if (user.org_status === 'DEACTIVATED') {
      return buildError(response, 403, "Organization is currently unavailable.");
    }

    if (organizationSlug && user.org_slug !== organizationSlug) {
       return buildError(response, 401, 'Invalid email or password for this organization.');
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return buildError(response, 401, 'Invalid email or password.');
    }

    await updateLastLogin(user.id);

    const token = jwt.sign(
      { sub: user.id, role: user.role, organization_id: user.organization_id },
      env.jwtSecret,
      { expiresIn: '1h' }
    );

    const organizationSlugToReturn = user.org_slug;

    // Remove raw fields we added for checks
    delete user.org_slug;
    delete user.org_status;

    return response.json({
      success: true,
      token,
      user: sanitizeUser(user),
      organizationSlug: organizationSlugToReturn
    });
  } catch (error) {
    console.error('Login Error:', error);
    return buildError(response, 500, 'Unable to log in at this time.');
  }
}

export function getCurrentUser(request, response) {
  return response.json({
    success: true,
    user: request.user
  });
}

export async function changePassword(request, response) {
  const currentPassword = typeof request.body?.currentPassword === 'string' ? request.body.currentPassword : '';
  const newPassword = typeof request.body?.newPassword === 'string' ? request.body.newPassword : '';

  if (!currentPassword || !newPassword) {
    return buildError(response, 400, 'Current password and new password are required.');
  }
  if (newPassword.length < 8) {
    return buildError(response, 400, 'Password must be at least 8 characters long.');
  }

  try {
    const result = await pool.query(
      'SELECT password_hash FROM users WHERE id = $1 AND organization_id = $2',
      [request.user.id, request.organizationId]
    );
    if (result.rows.length === 0) return buildError(response, 404, 'User not found.');

    const isValidPassword = await bcrypt.compare(currentPassword, result.rows[0].password_hash);
    if (!isValidPassword) return buildError(response, 401, 'Current password is incorrect.');

    const passwordHash = await bcrypt.hash(newPassword, 12);
    const user = await updatePasswordInDb(request.user.id, request.organizationId, passwordHash);
    if (!user) return buildError(response, 404, 'User not found.');
    return response.json({ success: true, message: 'Password updated successfully.', user: sanitizeUser(user) });
  } catch (_error) {
    return buildError(response, 500, 'Unable to update password at this time.');
  }
}

// Helper to hash tokens
function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export async function inviteUser(request, response) {
  const email = typeof request.body?.email === 'string' ? request.body.email.trim().toLowerCase() : '';

  if (!email || !emailPattern.test(email)) {
    return buildError(response, 400, 'Please provide a valid email address.');
  }

  try {
    const existingUser = await pool.query('SELECT id FROM users WHERE LOWER(email) = $1', [email]);
    if (existingUser.rows.length > 0) {
      return buildError(response, 409, 'A user with this email already exists.');
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = hashToken(rawToken);
    
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    const orgId = request.organizationId || request.user?.organization_id;

    if (!orgId) {
      return buildError(response, 403, 'Organization context missing.');
    }

    const organizationResult = await pool.query('SELECT slug FROM organizations WHERE id = $1', [orgId]);
    if (organizationResult.rows.length === 0) {
      return buildError(response, 404, 'Organization not found.');
    }

    await pool.query(
      `INSERT INTO auth_tokens (type, email, token_hash, expires_at, organization_id)
       VALUES ('INVITATION', $1, $2, $3, $4)`,
      [email, tokenHash, expiresAt, orgId]
    );

    await sendInvitationEmail(email, rawToken, organizationResult.rows[0].slug);

    return response.json({ success: true, message: 'Invitation sent successfully.' });
  } catch (error) {
    console.error('Invite Error:', error);
    return buildError(response, 500, 'Unable to invite user at this time.');
  }
}

export async function createAccount(request, response) {
  const { token, name, password } = request.body;
  
  if (!token || !name || !password) {
    return buildError(response, 400, 'Missing required fields.');
  }

  if (password.length < 8) {
    return buildError(response, 400, 'Password must be at least 8 characters long.');
  }

  const client = await pool.connect();
  try {
    const tokenHash = hashToken(token);
    const tokenResult = await client.query(
      `SELECT id, email, expires_at, used_at, organization_id FROM auth_tokens
       WHERE token_hash = $1 AND type = 'INVITATION'`,
      [tokenHash]
    );

    if (tokenResult.rows.length === 0) {
      return buildError(response, 400, 'Invalid invitation link.');
    }

    const invite = tokenResult.rows[0];

    if (invite.used_at) {
      return buildError(response, 400, 'Invitation link has already been used.');
    }

    if (new Date() > new Date(invite.expires_at)) {
      return buildError(response, 400, 'Invitation link has expired.');
    }

    // Double check email isn't already taken just in case
    const existingUser = await client.query('SELECT id FROM users WHERE LOWER(email) = $1', [invite.email]);
    if (existingUser.rows.length > 0) {
      return buildError(response, 409, 'A user with this email already exists.');
    }

    const passwordHash = await bcrypt.hash(password, 12);
    await client.query('BEGIN');
    const lockedToken = await client.query(
      `SELECT id, email, expires_at, used_at, organization_id FROM auth_tokens
       WHERE id = $1 AND used_at IS NULL
       FOR UPDATE`,
      [invite.id]
    );
    if (lockedToken.rows.length === 0) {
      await client.query('ROLLBACK');
      return buildError(response, 400, 'Invitation link has already been used.');
    }

    await client.query(
      'INSERT INTO users (name, email, password_hash, organization_id) VALUES ($1, $2, $3, $4)',
      [name, invite.email, passwordHash, invite.organization_id]
    );

    await client.query(
      'UPDATE auth_tokens SET used_at = NOW() WHERE id = $1',
      [invite.id]
    );

    await client.query('COMMIT');

    return response.status(201).json({ success: true, message: 'Account created successfully.' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create Account Error:', error);
    return buildError(response, 500, 'Unable to create account.');
  } finally {
    client.release();
  }
}

export async function forgotPassword(request, response) {
  const email = typeof request.body?.email === 'string' ? request.body.email.trim().toLowerCase() : '';
  
  if (!email || !emailPattern.test(email)) {
    return response.json({ success: true, message: 'If an account exists for this email, a password reset link has been sent.' });
  }

  try {
    const userResult = await pool.query('SELECT id, organization_id FROM users WHERE LOWER(email) = $1 AND status != \'DEACTIVATED\'', [email]);
    
    if (userResult.rows.length > 0) {
      const user = userResult.rows[0];
      
      const rateLimitResult = await pool.query(
        `SELECT created_at FROM auth_tokens 
         WHERE type = 'PASSWORD_RESET' AND user_id = $1 
         ORDER BY created_at DESC LIMIT 1`,
        [user.id]
      );

      if (rateLimitResult.rows.length > 0) {
        const lastCreated = new Date(rateLimitResult.rows[0].created_at);
        if (Date.now() - lastCreated.getTime() < 60000) {
          // It's less than a minute, return generic success but don't send email
          return response.json({ success: true, message: 'If an account exists for this email, a password reset link has been sent.' });
        }
      }

      const rawToken = crypto.randomBytes(32).toString('hex');
      const tokenHash = hashToken(rawToken);
      const expiresAt = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes

      // Invalidate existing active reset tokens
      await pool.query(
        `UPDATE auth_tokens SET used_at = NOW() 
         WHERE type = 'PASSWORD_RESET' AND user_id = $1 AND used_at IS NULL`,
        [user.id]
      );

      await pool.query(
        `INSERT INTO auth_tokens (type, email, user_id, token_hash, expires_at, organization_id)
         VALUES ('PASSWORD_RESET', $1, $2, $3, $4, $5)`,
        [email, user.id, tokenHash, expiresAt, user.organization_id]
      );

      // Send email but don't crash if it fails, just log it securely
      sendPasswordResetEmail(email, rawToken).catch(err => {
        console.error('Failed to send password reset email (technical issue):', err);
      });
    }

    return response.json({ success: true, message: 'If an account exists for this email, a password reset link has been sent.' });
  } catch (error) {
    console.error('Forgot Password Error:', error);
    return response.json({ success: true, message: 'If an account exists for this email, a password reset link has been sent.' });
  }
}

export async function resendReset(request, response) {
  const email = typeof request.body?.email === 'string' ? request.body.email.trim().toLowerCase() : '';

  if (!email || !emailPattern.test(email)) {
    return response.json({ success: true, message: 'If an account exists for this email, a password reset link has been sent.' });
  }

  // The logic is exactly the same as forgot password, we just reuse it
  return forgotPassword(request, response);
}

export async function resetPassword(request, response) {
  const { token, password } = request.body;
  
  if (!token || !password) {
    return buildError(response, 400, 'Missing required fields.');
  }

  if (password.length < 8) {
    return buildError(response, 400, 'Password must be at least 8 characters long.');
  }

  const client = await pool.connect();
  try {
    const tokenHash = hashToken(token);
    const tokenResult = await client.query(
      `SELECT id, user_id, organization_id, expires_at, used_at FROM auth_tokens 
       WHERE token_hash = $1 AND type = 'PASSWORD_RESET'`,
      [tokenHash]
    );

    if (tokenResult.rows.length === 0) {
      return buildError(response, 400, 'Invalid password reset link.');
    }

    const resetToken = tokenResult.rows[0];

    if (resetToken.used_at) {
      return buildError(response, 400, 'This password reset link has already been used.');
    }

    if (new Date() > new Date(resetToken.expires_at)) {
      return buildError(response, 400, 'This password reset link has expired.');
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await client.query('BEGIN');
    const lockedToken = await client.query(
      `SELECT id FROM auth_tokens WHERE id = $1 AND used_at IS NULL FOR UPDATE`,
      [resetToken.id]
    );
    if (lockedToken.rows.length === 0) {
      await client.query('ROLLBACK');
      return buildError(response, 400, 'This password reset link has already been used.');
    }

    const updatedUser = await client.query(
      `UPDATE users SET password_hash = $1, updated_at = NOW()
       WHERE id = $2 AND organization_id = $3`,
      [passwordHash, resetToken.user_id, resetToken.organization_id]
    );
    if (updatedUser.rowCount === 0) {
      await client.query('ROLLBACK');
      return buildError(response, 404, 'User not found.');
    }

    await client.query(
      'UPDATE auth_tokens SET used_at = NOW() WHERE id = $1',
      [resetToken.id]
    );

    await client.query('COMMIT');

    return response.json({ success: true, message: 'Password updated successfully.' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Reset Password Error:', error);
    return buildError(response, 500, 'Unable to reset password.');
  } finally {
    client.release();
  }
}
