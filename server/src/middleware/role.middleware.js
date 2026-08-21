const { error } = require('../utils/apiResponse');

/**
 * Usage: requireRole('admin') or requireRole('admin', 'moderator')
 */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return error(res, 'Unauthorized', 401);
    if (roles.includes('admin') && !req.user.is_admin) {
      return error(res, 'Forbidden — admin access required', 403);
    }
    next();
  };
}

module.exports = requireRole;
