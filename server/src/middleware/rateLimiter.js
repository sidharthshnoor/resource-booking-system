import { rateLimit } from 'express-rate-limit';

function rateLimitHandler(request, response, next, options) {
  response.status(options.statusCode).json({
    success: false,
    error: 'TOO_MANY_REQUESTS',
    message: options.message
  });
}


export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: 'Too many requests. Please wait a few minutes and try again.',
  handler: rateLimitHandler
});


export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  message: 'Too many login attempts. Please try again later.',
  handler: rateLimitHandler
});


export const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: 'Too many registration attempts. Please try again later.',
  handler: rateLimitHandler
});


export const passwordResetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: 'Too many password reset requests. Please try again later.',
  handler: rateLimitHandler
});
