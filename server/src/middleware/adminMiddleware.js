export function requireAdmin(request, response, next) {
  if (request.user?.role !== 'ADMIN') {
    return response.status(403).json({
      success: false,
      message: 'Admin access is required.'
    });
  }

  return next();
}
