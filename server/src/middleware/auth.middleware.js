const { verifyToken } = require('../utils/tokenUtils');
const { error } = require('../utils/apiResponse');

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return error(res, 'Unauthorized — no token provided', 401);
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch {
    return error(res, 'Unauthorized — invalid or expired token', 401);
  }
}

module.exports = authMiddleware;
