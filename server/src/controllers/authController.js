import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../config/database.js';
import { env } from '../config/env.js';
import { sanitizeUser } from '../utils/user.js';
import { updateLastLogin } from '../models/userModel.js';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function buildError(response, statusCode, message) {
  return response.status(statusCode).json({
    success: false,
    message
  });
}

export async function register(request, response) {
  const name = typeof request.body?.name === 'string' ? request.body.name.trim() : '';
  const email = typeof request.body?.email === 'string' ? request.body.email.trim() : '';
  const password = typeof request.body?.password === 'string' ? request.body.password : '';

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
      'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email, role, created_at, updated_at',
      [name, email, passwordHash]
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

  if (!email || !password) {
    return buildError(response, 400, 'Email and password are required.');
  }

  if (!emailPattern.test(email)) {
    return buildError(response, 401, 'Invalid email or password.');
  }

  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE LOWER(email) = LOWER($1)',
      [email]
    );

    const user = result.rows[0];

    if (!user) {
      return buildError(response, 401, 'Invalid email or password.');
    }

    if (user.status === 'DEACTIVATED') {
      return buildError(response, 403, "User doesn't exist. Please contact the organization.");
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return buildError(response, 401, 'Invalid email or password.');
    }

    await updateLastLogin(user.id);

    const token = jwt.sign(
      { sub: user.id, role: user.role },
      env.jwtSecret,
      { expiresIn: '1h' }
    );

    return response.json({
      success: true,
      token,
      user: sanitizeUser(user)
    });
  } catch (error) {
    return buildError(response, 500, 'Unable to log in at this time.');
  }
}

export function getCurrentUser(request, response) {
  return response.json({
    success: true,
    user: request.user
  });
}
