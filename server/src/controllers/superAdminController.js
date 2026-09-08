import { pool } from '../config/database.js';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { sendPasswordResetEmail } from '../utils/email.js';

function buildError(response, statusCode, message) {
  return response.status(statusCode).json({
    success: false,
    message
  });
}

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export async function listOrganizations(request, response) {
  try {
    const result = await pool.query(
      `SELECT id, name, slug, logo, status, created_at, updated_at,
        (SELECT COUNT(*) FROM users WHERE organization_id = organizations.id) AS total_users,
        (SELECT COUNT(*) FROM resources WHERE organization_id = organizations.id) AS total_resources,
        (SELECT COUNT(*) FROM bookings WHERE organization_id = organizations.id) AS total_bookings
       FROM organizations
       ORDER BY created_at DESC`
    );
    return response.json({
      success: true,
      organizations: result.rows.map((organization) => ({
        ...organization,
        counts: {
          users: parseInt(organization.total_users, 10) || 0,
          resources: parseInt(organization.total_resources, 10) || 0,
          bookings: parseInt(organization.total_bookings, 10) || 0
        }
      }))
    });
  } catch (error) {
    console.error('List Organizations Error:', error);
    return buildError(response, 500, 'Unable to fetch organizations.');
  }
}

export async function createOrganization(request, response) {
  const name = typeof request.body?.name === 'string' ? request.body.name.trim() : '';
  const slug = typeof request.body?.slug === 'string' ? request.body.slug.trim().toLowerCase() : '';
  const logo = typeof request.body?.logo === 'string' ? request.body.logo.trim() : null;
  const adminName = typeof request.body?.adminName === 'string' ? request.body.adminName.trim() : '';
  const adminEmail = typeof request.body?.adminEmail === 'string' ? request.body.adminEmail.trim().toLowerCase() : '';

  if (!name || !slug) {
    return buildError(response, 400, 'Organization name and slug are required.');
  }

  if (!adminName || !adminEmail) {
    return buildError(response, 400, 'Admin name and email are required.');
  }

  // Basic slug validation: only alphanumeric and hyphens
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return buildError(response, 400, 'Slug can only contain lowercase letters, numbers, and hyphens.');
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(adminEmail)) {
    return buildError(response, 400, 'Please provide a valid admin email address.');
  }

  try {
    const existingOrg = await pool.query('SELECT id FROM organizations WHERE slug = $1', [slug]);
    if (existingOrg.rows.length > 0) {
      return buildError(response, 409, 'An organization with this slug already exists.');
    }

    const existingUser = await pool.query('SELECT id FROM users WHERE LOWER(email) = $1', [adminEmail]);
    if (existingUser.rows.length > 0) {
      return buildError(response, 409, 'A user with this admin email already exists.');
    }

    await pool.query('BEGIN');

    const orgResult = await pool.query(
      'INSERT INTO organizations (name, slug, logo, status) VALUES ($1, $2, $3, $4) RETURNING id, name, slug, logo, status, created_at',
      [name, slug, logo, 'ACTIVE']
    );

    const newOrgId = orgResult.rows[0].id;

    // Generate a secure unguessable dummy password
    const dummyPassword = crypto.randomBytes(64).toString('hex');
    const passwordHash = await bcrypt.hash(dummyPassword, 12);

    // Create the admin user
    const insertUserResult = await pool.query(
      'INSERT INTO users (name, email, password_hash, role, organization_id) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role',
      [adminName, adminEmail, passwordHash, 'ADMIN', newOrgId]
    );

    const newUserId = insertUserResult.rows[0].id;

    // Generate a secure PASSWORD_RESET token valid for 24 hours
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await pool.query(
      `INSERT INTO auth_tokens (type, email, user_id, token_hash, expires_at, organization_id)
       VALUES ('PASSWORD_RESET', $1, $2, $3, $4, $5)`,
      [adminEmail, newUserId, tokenHash, expiresAt, newOrgId]
    );

    await pool.query('COMMIT');

    let emailSent = false;
    try {
      await sendPasswordResetEmail(adminEmail, rawToken);
      emailSent = true;
    } catch (err) {
      console.error('Failed to send provisioned admin password reset email:', err);
    }

    return response.status(201).json({
      success: true,
      organization: orgResult.rows[0],
      admin: insertUserResult.rows[0],
      message: emailSent 
        ? 'Organization created and administrator successfully provisioned.'
        : 'Organization created successfully, but there was an error sending the invitation email.'
    });

  } catch (error) {
    await pool.query('ROLLBACK');
    if (error && error.code === '23505') {
      return buildError(response, 409, 'An organization with this slug or a user with this email already exists.');
    }
    console.error('Create Organization Error:', error);
    return buildError(response, 500, 'Unable to create organization.');
  }
}

export async function getOrganizationDetails(request, response) {
  const orgId = request.params.id;

  try {
    const orgResult = await pool.query(
      'SELECT id, name, slug, logo, status, created_at, updated_at FROM organizations WHERE id = $1',
      [orgId]
    );

    if (orgResult.rows.length === 0) {
      return buildError(response, 404, 'Organization not found.');
    }

    const adminResult = await pool.query(
      'SELECT id, name, email, role, status, created_at FROM users WHERE organization_id = $1 AND role = $2',
      [orgId, 'ADMIN']
    );

    const countsResult = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM users WHERE organization_id = $1 AND role = 'USER') as total_users,
        (SELECT COUNT(*) FROM users WHERE organization_id = $1 AND role = 'ADMIN') as total_admins,
        (SELECT COUNT(*) FROM resources WHERE organization_id = $1) as total_resources,
        (SELECT COUNT(*) FROM bookings WHERE organization_id = $1) as total_bookings
    `, [orgId]);

    const counts = countsResult.rows[0];

    return response.json({
      success: true,
      organization: orgResult.rows[0],
      admins: adminResult.rows,
      counts: {
        users: parseInt(counts.total_users, 10) || 0,
        admins: parseInt(counts.total_admins, 10) || 0,
        resources: parseInt(counts.total_resources, 10) || 0,
        bookings: parseInt(counts.total_bookings, 10) || 0
      }
    });
  } catch (error) {
    console.error('Get Organization Error:', error);
    return buildError(response, 500, 'Unable to fetch organization details.');
  }
}

export async function updateOrganizationStatus(request, response) {
  const orgId = request.params.id;
  const status = request.body?.status;

  if (status !== 'ACTIVE' && status !== 'DEACTIVATED') {
    return buildError(response, 400, 'Invalid status.');
  }

  if (orgId === '1' || orgId === 1) {
     const checkDefault = await pool.query('SELECT slug FROM organizations WHERE id = $1', [orgId]);
     if (checkDefault.rows.length > 0 && checkDefault.rows[0].slug === 'default') {
        return buildError(response, 400, 'Cannot deactivate the default organization.');
     }
  }

  try {
    const result = await pool.query(
      'UPDATE organizations SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING id, name, slug, status',
      [status, orgId]
    );

    if (result.rows.length === 0) {
      return buildError(response, 404, 'Organization not found.');
    }

    return response.json({
      success: true,
      organization: result.rows[0],
      message: `Organization ${status.toLowerCase()} successfully.`
    });
  } catch (error) {
    console.error('Update Organization Status Error:', error);
    return buildError(response, 500, 'Unable to update organization status.');
  }
}

export async function updateOrganization(request, response) {
  const orgId = request.params.id;
  const name = typeof request.body?.name === 'string' ? request.body.name.trim() : '';
  const slug = typeof request.body?.slug === 'string' ? request.body.slug.trim().toLowerCase() : '';
  const logo = typeof request.body?.logo === 'string' ? request.body.logo.trim() : null;

  if (!name || !slug) return buildError(response, 400, 'Organization name and slug are required.');
  if (!/^[a-z0-9-]+$/.test(slug)) return buildError(response, 400, 'Slug can only contain lowercase letters, numbers, and hyphens.');

  try {
    const result = await pool.query(
      `UPDATE organizations SET name = $1, slug = $2, logo = $3, updated_at = NOW()
       WHERE id = $4 RETURNING id, name, slug, logo, status, created_at, updated_at`,
      [name, slug, logo || null, orgId]
    );
    if (result.rows.length === 0) return buildError(response, 404, 'Organization not found.');
    return response.json({ success: true, organization: result.rows[0], message: 'Organization details updated successfully.' });
  } catch (error) {
    if (error?.code === '23505') return buildError(response, 409, 'An organization with this slug already exists.');
    console.error('Update Organization Error:', error);
    return buildError(response, 500, 'Unable to update organization details.');
  }
}

export async function provisionFirstAdmin(request, response) {
  const orgId = request.params.id;
  const name = typeof request.body?.name === 'string' ? request.body.name.trim() : '';
  const email = typeof request.body?.email === 'string' ? request.body.email.trim().toLowerCase() : '';

  if (!name || !email) {
    return buildError(response, 400, 'Name and email are required.');
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    return buildError(response, 400, 'Please provide a valid email address.');
  }

  try {
    const orgResult = await pool.query('SELECT id, status FROM organizations WHERE id = $1', [orgId]);
    if (orgResult.rows.length === 0) {
      return buildError(response, 404, 'Organization not found.');
    }
    
    if (orgResult.rows[0].status === 'DEACTIVATED') {
      return buildError(response, 400, 'Cannot provision admin for a deactivated organization.');
    }

    // Check if user email already exists globally
    const existingUser = await pool.query('SELECT id FROM users WHERE LOWER(email) = $1', [email]);
    if (existingUser.rows.length > 0) {
      return buildError(response, 409, 'A user with this email already exists.');
    }

    await pool.query('BEGIN');

    // Generate a secure unguessable dummy password
    const dummyPassword = crypto.randomBytes(64).toString('hex');
    const passwordHash = await bcrypt.hash(dummyPassword, 12);

    // Create the admin user
    const insertUserResult = await pool.query(
      'INSERT INTO users (name, email, password_hash, role, organization_id) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role, status, created_at',
      [name, email, passwordHash, 'ADMIN', orgId]
    );

    const newUserId = insertUserResult.rows[0].id;

    // Generate a secure PASSWORD_RESET token valid for 24 hours
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await pool.query(
      `INSERT INTO auth_tokens (type, email, user_id, token_hash, expires_at, organization_id)
       VALUES ('PASSWORD_RESET', $1, $2, $3, $4, $5)`,
      [email, newUserId, tokenHash, expiresAt, orgId]
    );

    await pool.query('COMMIT');

    // Fire and forget email
    sendPasswordResetEmail(email, rawToken).catch(err => {
      console.error('Failed to send provisioned admin password reset email:', err);
    });

    return response.status(201).json({
      success: true,
      admin: insertUserResult.rows[0],
      message: 'Administrator successfully added. A password setup email has been sent.'
    });

  } catch (error) {
    await pool.query('ROLLBACK');
    if (error?.code === '23505') {
      return buildError(response, 409, 'A user with this email already exists.');
    }
    console.error('Provision Admin Error:', error);
    return buildError(response, 500, 'Unable to provision administrator.');
  }
}

export async function updateOrganizationAdmin(request, response) {
  const organizationId = request.params.id;
  const adminId = request.params.adminId;
  const name = typeof request.body?.name === 'string' ? request.body.name.trim() : '';
  const email = typeof request.body?.email === 'string' ? request.body.email.trim().toLowerCase() : '';
  const status = request.body?.status;

  if (!name || !email) return buildError(response, 400, 'Name and email are required.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return buildError(response, 400, 'Please provide a valid email address.');
  if (status && !['ACTIVE', 'DEACTIVATED'].includes(status)) return buildError(response, 400, 'Invalid administrator status.');

  try {
    const result = await pool.query(
      `UPDATE users SET name = $1, email = $2, status = COALESCE($3, status), updated_at = NOW()
       WHERE id = $4 AND organization_id = $5 AND role = 'ADMIN'
       RETURNING id, name, email, role, status, created_at`,
      [name, email, status || null, adminId, organizationId]
    );
    if (result.rows.length === 0) return buildError(response, 404, 'Administrator not found in this organization.');
    return response.json({ success: true, admin: result.rows[0], message: 'Administrator updated successfully.' });
  } catch (error) {
    if (error?.code === '23505') return buildError(response, 409, 'A user with this email already exists.');
    console.error('Update Organization Admin Error:', error);
    return buildError(response, 500, 'Unable to update administrator.');
  }
}

export async function deleteOrganizationAdmin(request, response) {
  const organizationId = request.params.id;
  const adminId = request.params.adminId;

  try {
    const result = await pool.query(
      `DELETE FROM users WHERE id = $1 AND organization_id = $2 AND role = 'ADMIN'
       RETURNING id`,
      [adminId, organizationId]
    );
    if (result.rows.length === 0) return buildError(response, 404, 'Administrator not found in this organization.');
    return response.json({ success: true, message: 'Administrator removed successfully.' });
  } catch (error) {
    console.error('Delete Organization Admin Error:', error);
    return buildError(response, 500, 'Unable to remove administrator.');
  }
}

export async function deleteOrganization(request, response) {
  const orgId = request.params.id;

  if (!orgId) {
    return buildError(response, 400, 'Organization ID is required.');
  }

  try {
    const orgResult = await pool.query('SELECT id, slug FROM organizations WHERE id = $1', [orgId]);
    
    if (orgResult.rows.length === 0) {
      return buildError(response, 404, 'Organization not found.');
    }

    const org = orgResult.rows[0];

    if (org.slug === 'default' || org.id.toString() === '1') {
      return buildError(response, 400, 'Cannot delete the default organization.');
    }

    const superAdminResult = await pool.query(
      'SELECT id FROM users WHERE organization_id = $1 AND role = $2',
      [orgId, 'SUPER_ADMIN']
    );

    if (superAdminResult.rows.length > 0) {
      return buildError(response, 400, 'Cannot delete an organization that contains SUPER_ADMIN accounts.');
    }

    await pool.query('BEGIN');

    await pool.query('DELETE FROM organizations WHERE id = $1', [orgId]);

    await pool.query('COMMIT');

    return response.json({
      success: true,
      message: 'Organization and all related data successfully deleted.'
    });
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Delete Organization Error:', error);
    return buildError(response, 500, 'Unable to delete organization.');
  }
}
