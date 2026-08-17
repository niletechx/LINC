/**
 * supabaseUser.js
 * ───────────────────────────────────────────────────────────────
 * Per-request Supabase client factory for LINC RBAC integration.
 *
 * WHY THIS EXISTS
 * ───────────────
 * The default supabase client (supabase.js) uses the SERVICE ROLE
 * key, which bypasses ALL Row Level Security policies. This is
 * correct for internal/system operations (webhooks, AI matching,
 * notification fanouts).
 *
 * For any user-facing API call where RLS must be enforced, use
 * getSupabaseUser(req.token) instead. This creates a short-lived
 * client that passes the user's JWT as the Authorization header.
 * PostgREST will:
 *   1. Verify the JWT signature against SUPABASE_JWT_SECRET
 *   2. Set the request.jwt.claims GUC to the JWT payload
 *   3. Call our linc_uid() / linc_is_admin() functions correctly
 *
 * SUPABASE JWT SECRET CONFIGURATION
 * ────────────────────────────────
 * Your Supabase project must be configured to accept your custom
 * JWT secret. In Supabase Dashboard:
 *   Settings → API → JWT Settings → Custom JWT Secret
 *   Set it to the same value as your JWT_SECRET env var.
 *
 * USAGE
 * ─────
 *   const { getSupabaseUser } = require('../config/supabaseUser');
 *
 *   // In a controller:
 *   const db = getSupabaseUser(req.token);
 *   const { data, error } = await db.from('requests').select('*');
 *   // ↑ This query is now RLS-filtered for req.user
 *
 * WHEN TO USE WHICH CLIENT
 * ────────────────────────
 *   supabase (service role) → Webhooks, AI matching, migrations,
 *                              admin operations, background jobs
 *   getSupabaseUser(token)  → All user-facing CRUD operations
 * ───────────────────────────────────────────────────────────────
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL     = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL) {
  throw new Error('SUPABASE_URL is required in environment variables');
}

/**
 * getSupabaseUser(jwt)
 *
 * Creates a Supabase client authenticated as the current user.
 * RLS policies are enforced — the user can only see their own data.
 *
 * @param {string} jwt - The raw JWT string from req.token
 *                       (set by auth.middleware.js)
 * @returns {import('@supabase/supabase-js').SupabaseClient}
 */
function getSupabaseUser(jwt) {
  if (!jwt) {
    throw new Error('JWT token is required to create a user-scoped Supabase client');
  }

  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY || 'anon', {
    global: {
      headers: {
        // PostgREST reads this header and sets request.jwt.claims
        // to the verified JWT payload, which our linc_uid() reads.
        Authorization: `Bearer ${jwt}`,
      },
    },
    auth: {
      // Disable Supabase's auto-refresh — we manage our own JWTs
      autoRefreshToken: false,
      persistSession:   false,
      detectSessionInUrl: false,
    },
  });
}

/**
 * withRLSClient(req, asyncFn)
 *
 * Convenience wrapper: creates the user-scoped client from
 * req.token and passes it to the async callback. Handles the
 * case where req.token is missing (service-role fallback with
 * a warning in development).
 *
 * @param {import('express').Request} req
 * @param {function(client: SupabaseClient): Promise<any>} asyncFn
 * @returns {Promise<any>}
 *
 * Usage:
 *   return withRLSClient(req, async (db) => {
 *     return db.from('bookings').select('*');
 *   });
 */
async function withRLSClient(req, asyncFn) {
  if (!req.token) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        '[LINC RBAC] ⚠️  withRLSClient called without req.token. '
        + 'Falling back to service role — RLS is NOT enforced. '
        + 'Make sure authMiddleware runs before this handler.'
      );
    }
    // Fallback to service-role (RLS bypassed) — only in dev
    const supabase = require('./supabase');
    return asyncFn(supabase);
  }

  const client = getSupabaseUser(req.token);
  return asyncFn(client);
}

module.exports = { getSupabaseUser, withRLSClient };
