const { error } = require('../utils/apiResponse');

/**
 * Usage: requireRole('admin') or requireRole('provider') or requireRole('admin', 'moderator')
 */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return error(res, 'Unauthorized', 401);

    const isAdmin = req.user.is_admin === true || req.user.role === 'admin';
    if (isAdmin) {
      return next(); // Admins have universal permission
    }

    if (roles.includes('admin') && !isAdmin) {
      return error(res, 'Forbidden — admin access required', 403);
    }

    const userRole = req.user.role;
    const hasRole = roles.includes(userRole);
    if (!hasRole) {
      return error(res, `Forbidden — requires one of roles: [${roles.join(', ')}]`, 403);
    }

    next();
  };
}

module.exports = requireRole;
