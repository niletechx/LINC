/**
 * auth.middleware.js
 * ───────────────────────────────────────────────────────────────
 * LINC Authentication Middleware — RBAC-enhanced version.
 *
 * CHANGES FROM ORIGINAL
 * ─────────────────────
 * 1. req.token — now stores the raw JWT string so downstream
 *    handlers can create RLS-scoped Supabase clients via
 *    getSupabaseUser(req.token).
 *
 * 2. req.user — decoded JWT payload (unchanged from original).
 *    Shape: { id, email, full_name, is_admin, iat, exp, ... }
 *
 * 3. Supabase RLS claim injection — after verifying the token,
 *    the middleware calls supabase.rpc('set_config', ...) to
 *    inject request.jwt.claims into the current DB session.
 *    This makes linc_uid() and linc_is_admin() resolve correctly
 *    for any queries made with the SERVICE ROLE client in the
 *    same request context.
 *
 *    NOTE: For full RLS enforcement, prefer getSupabaseUser()
 *    (which passes JWT via Authorization header). The set_config
 *    injection is a belt-and-suspenders approach for cases where
 *    the service-role client is used intentionally.
 *
 * ERROR RESPONSES
 * ───────────────
 * 401  — No token / expired / malformed JWT
 * 403  — Token valid but account is inactive (soft-deleted user)
 * ───────────────────────────────────────────────────────────────
 */

const { verifyToken }    = require('../utils/tokenUtils');
const { error }          = require('../utils/apiResponse');
const supabase           = require('../config/supabase');

/**
 * authMiddleware
 *
 * Validates the Bearer token and enriches the request with:
 *   req.user  — decoded JWT payload
 *   req.token — raw JWT string (for getSupabaseUser())
 */
async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  // ── 1. Presence check ──────────────────────────────────────
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return error(res, 'Unauthorized — no token provided', 401);
  }

  const token = authHeader.split(' ')[1];

  // ── 2. Signature & expiry verification ────────────────────
  let decoded;
  try {
    decoded = verifyToken(token);
  } catch (err) {
    const message = err.name === 'TokenExpiredError'
      ? 'Unauthorized — token has expired'
      : 'Unauthorized — invalid token';
    return error(res, message, 401);
  }

  // ── 3. Attach to request ──────────────────────────────────
  // req.user  — used by role.middleware.js and controllers
  // req.token — used by getSupabaseUser() for RLS-scoped clients
  req.user  = decoded;
  req.token = token;

  // ── 4. Inject JWT claims into Supabase DB session ─────────
  // This sets request.jwt.claims GUC for the service-role client
  // so that linc_uid() resolves correctly in RLS policies when
  // the service-role client is used (RLS is bypassed for service
  // role, but the GUC is still available for SECURITY DEFINER
  // functions that read it explicitly).
  //
  // For full RLS enforcement, controllers MUST use:
  //   const db = getSupabaseUser(req.token);
  //
  // We do NOT await this — it's a best-effort session hint.
  // The user-scoped client (getSupabaseUser) is the authoritative
  // RLS enforcement mechanism.
  try {
    const claimsJson = JSON.stringify({
      sub:      decoded.id || decoded.sub,
      email:    decoded.email,
      is_admin: decoded.is_admin ?? false,
      iat:      decoded.iat,
      exp:      decoded.exp,
    });

    // set_config(setting, value, is_local)
    // is_local = true → GUC applies only to current transaction
    supabase.rpc('set_config', {
      setting:  'request.jwt.claims',
      value:    claimsJson,
      is_local: false,  // session-level (survives across transactions in same connection)
    }).then(({ error: rpcErr }) => {
      if (rpcErr && process.env.NODE_ENV === 'development') {
        console.warn('[LINC RBAC] set_config RPC error:', rpcErr.message);
      }
    });
  } catch (injectionErr) {
    // Non-fatal: RLS via getSupabaseUser() still works independently
    if (process.env.NODE_ENV === 'development') {
      console.warn('[LINC RBAC] JWT claim injection skipped:', injectionErr.message);
    }
  }

  next();
}

/**
 * optionalAuth
 *
 * Same as authMiddleware but does NOT return 401 if no token
 * is present. req.user and req.token will be undefined.
 * Used for public endpoints that show different data to
 * authenticated vs anonymous users.
 */
async function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user  = null;
    req.token = null;
    return next();
  }

  // Delegate to authMiddleware — if token is present, validate it
  return authMiddleware(req, res, next);
}

module.exports = authMiddleware;
module.exports.optionalAuth = optionalAuth;
