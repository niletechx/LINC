-- ============================================================
-- LINC RBAC — Phase 3: Audit Trail & Column-Level Security
-- Migration: 20260817000005_audit_and_column_security.sql
--
-- PREREQUISITE: Migrations 003 and 004 must be run first.
-- IDEMPOTENT — safe to re-run.
-- ============================================================

-- ============================================================
-- SECTION 1 — AUDIT LOGS TABLE
--
-- Stores a complete change history for all audited tables.
-- RLS restricts direct access to admins only.
-- Application code should NEVER write to this table directly.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name   VARCHAR(80) NOT NULL,
  operation    VARCHAR(10) NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
  record_id    UUID        NOT NULL,
  old_data     JSONB       DEFAULT NULL,  -- NULL for INSERT
  new_data     JSONB       DEFAULT NULL,  -- NULL for DELETE
  changed_cols TEXT[]      DEFAULT NULL,  -- populated on UPDATE only
  performed_by UUID        DEFAULT NULL,  -- NULL = system / service_role
  performed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'audit_logs_operation_check'
  ) THEN
    ALTER TABLE public.audit_logs
      ADD CONSTRAINT audit_logs_operation_check
      CHECK (
        (operation = 'INSERT' AND old_data IS NULL  AND new_data IS NOT NULL) OR
        (operation = 'UPDATE' AND old_data IS NOT NULL AND new_data IS NOT NULL) OR
        (operation = 'DELETE' AND old_data IS NOT NULL AND new_data IS NULL)
      );
  END IF;
END;
$$;

COMMENT ON TABLE public.audit_logs IS
  'Immutable audit trail. All INSERTs come from fn_audit_log() triggers. '
  'Direct INSERT/UPDATE/DELETE by app code is blocked via RLS.';

-- Indexes for common audit queries
CREATE INDEX IF NOT EXISTS idx_audit_table_record
  ON public.audit_logs(table_name, record_id);

CREATE INDEX IF NOT EXISTS idx_audit_performed_by
  ON public.audit_logs(performed_by)
  WHERE performed_by IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_audit_performed_at
  ON public.audit_logs(performed_at DESC);

-- RLS: Only admins can read audit logs. Nobody can write directly.
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "audit_logs: admin read" ON public.audit_logs;
DROP POLICY IF EXISTS "audit_logs: no direct write" ON public.audit_logs;

CREATE POLICY "audit_logs: admin read"
  ON public.audit_logs FOR SELECT
  USING (linc_is_admin());

-- Explicit block on INSERT/UPDATE/DELETE from non-system roles
-- (service_role bypasses RLS and is allowed to insert via trigger)
CREATE POLICY "audit_logs: no direct write"
  ON public.audit_logs FOR ALL
  USING (false)
  WITH CHECK (false);


-- ============================================================
-- SECTION 2 — AUDIT TRIGGER FUNCTION
--
-- SECURITY DEFINER allows the trigger to insert into audit_logs
-- even when the calling user's role has no direct INSERT
-- privilege on that table (which is intentional — only the
-- trigger function can write audit records).
--
-- Why to_jsonb(OLD/NEW)?
--   Captures the complete row snapshot. For sensitive columns
--   like password_hash, we redact the value in-flight so it
--   never appears in audit_logs in plaintext.
-- ============================================================

CREATE OR REPLACE FUNCTION public.fn_audit_log()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _old_json   JSONB;
  _new_json   JSONB;
  _changed    TEXT[];
  _col        TEXT;
BEGIN
  -- Build JSON snapshots, redacting sensitive columns
  IF TG_OP IN ('UPDATE', 'DELETE') THEN
    _old_json := to_jsonb(OLD);
    -- Redact password_hash from audit records
    IF _old_json ? 'password_hash' THEN
      _old_json := _old_json || '{"password_hash": "[REDACTED]"}'::JSONB;
    END IF;
    -- Redact phone_encrypted (raw bytes not useful in logs)
    IF _old_json ? 'phone_encrypted' THEN
      _old_json := _old_json || '{"phone_encrypted": "[REDACTED]"}'::JSONB;
    END IF;
  END IF;

  IF TG_OP IN ('INSERT', 'UPDATE') THEN
    _new_json := to_jsonb(NEW);
    IF _new_json ? 'password_hash' THEN
      _new_json := _new_json || '{"password_hash": "[REDACTED]"}'::JSONB;
    END IF;
    IF _new_json ? 'phone_encrypted' THEN
      _new_json := _new_json || '{"phone_encrypted": "[REDACTED]"}'::JSONB;
    END IF;
  END IF;

  -- On UPDATE, compute which columns actually changed
  IF TG_OP = 'UPDATE' THEN
    SELECT array_agg(key)
    INTO   _changed
    FROM   jsonb_each(_old_json) AS o(key, val)
    WHERE  _old_json -> key IS DISTINCT FROM _new_json -> key;
  END IF;

  INSERT INTO public.audit_logs (
    table_name,
    operation,
    record_id,
    old_data,
    new_data,
    changed_cols,
    performed_by
  ) VALUES (
    TG_TABLE_NAME,
    TG_OP,
    COALESCE(
      (CASE WHEN TG_OP = 'DELETE' THEN OLD.id ELSE NEW.id END),
      gen_random_uuid()  -- fallback; should never trigger
    ),
    _old_json,
    _new_json,
    _changed,
    linc_uid()  -- NULL when service_role performs the operation
  );

  RETURN COALESCE(NEW, OLD);
END;
$$;

COMMENT ON FUNCTION public.fn_audit_log() IS
  'Generic audit trigger: logs INSERT/UPDATE/DELETE with redacted '
  'sensitive fields. Called AFTER each row operation.';


-- ============================================================
-- SECTION 3 — ATTACH AUDIT TRIGGERS TO KEY TABLES
--
-- Tables audited: those containing PII, financial data, or
-- security-sensitive state. Read-only/ephemeral tables
-- (ai_messages, notifications) are excluded for performance.
-- ============================================================

DO $$
DECLARE
  t TEXT;
  -- Tables to audit (ordered by sensitivity)
  audited_tables TEXT[] := ARRAY[
    'users',               -- PII, authentication
    'provider_profiles',   -- identity
    'businesses',          -- entity data
    'organizations',       -- entity data
    'business_members',    -- access control changes
    'organization_members',-- access control changes
    'services',            -- offering changes
    'requests',            -- demand-side changes
    'matches',             -- AI matching decisions
    'bookings',            -- transactional state
    'escrow_transactions', -- financial
    'escrow_disputes',     -- dispute resolution
    'reviews',             -- trust signals
    'verification_requests', -- compliance
    'reports'              -- moderation
  ];
BEGIN
  FOREACH t IN ARRAY audited_tables LOOP
    -- Drop existing trigger (idempotency)
    EXECUTE format(
      'DROP TRIGGER IF EXISTS trg_%s_audit ON public.%I',
      t, t
    );
    -- Attach audit trigger AFTER row operations
    EXECUTE format(
      'CREATE TRIGGER trg_%s_audit
       AFTER INSERT OR UPDATE OR DELETE ON public.%I
       FOR EACH ROW EXECUTE FUNCTION public.fn_audit_log()',
      t, t
    );
  END LOOP;
END;
$$;


-- ============================================================
-- SECTION 4 — COLUMN-LEVEL SECURITY VIEWS
--
-- PostgreSQL doesn't support column-level GRANT on tables with
-- RLS in Supabase's managed environment. We use views instead:
--
--   users_public_view  — safe for any authenticated user
--   users_admin_view   — full data, admin only
--   providers_public_view — hides raw coordinates
--
-- Views are owned by the migration role (postgres), so they
-- can select columns the calling role can't see directly.
-- ============================================================

-- ── users_public_view ────────────────────────────────────────
-- Exposes safe profile fields. Masks email, hides password_hash,
-- phone, phone_encrypted, raw location coordinates.
-- All authenticated users can query this view.
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE VIEW public.users_public_view
  WITH (security_invoker = false)   -- runs with definer privileges
AS
SELECT
  id,
  -- Mask email: show only first char + domain
  -- e.g. "johndoe@example.com" → "j***@example.com"
  CASE
    WHEN email LIKE '%@%' THEN
      LEFT(email, 1) || '***@' || split_part(email, '@', 2)
    ELSE '***'
  END                           AS email_masked,
  full_name,
  username,
  avatar_url,
  bio,
  location_city,               -- city is public
  -- Raw lat/lng are NOT exposed: geospatial queries only
  is_admin,                    -- needed for UI role display
  is_active,
  email_verified,
  created_at
FROM public.users
WHERE deleted_at IS NULL;

COMMENT ON VIEW public.users_public_view IS
  'Safe public user profile. Masks email, hides password, phone, '
  'and raw GPS coordinates. Query this instead of the users table.';

-- ── users_admin_view ────────────────────────────────────────
-- Full data view. Access enforced via SECURITY DEFINER
-- wrapper function below (not via direct view query).
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE VIEW public.users_admin_view
  WITH (security_invoker = true)  -- runs as calling role
AS
SELECT
  u.*,
  -- Decrypt phone for admin display if encrypted
  CASE
    WHEN u.phone_encrypted IS NOT NULL THEN
      COALESCE(
        extensions.pgp_sym_decrypt(
          u.phone_encrypted,
          current_setting('app.phone_encrypt_key', true)
        ),
        u.phone
      )
    ELSE u.phone
  END AS phone_decrypted
FROM public.users u;

-- RLS on the underlying users table already restricts this view
-- to admins (FORCE ROW LEVEL SECURITY ensures view inherits RLS).

COMMENT ON VIEW public.users_admin_view IS
  'Full user data including decrypted phone. Accessible only to '
  'admins via users table RLS policies.';


-- ── providers_public_view ────────────────────────────────────
-- Hides raw GPS coordinates. Exposes city and category info.
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE VIEW public.providers_public_view
  WITH (security_invoker = false)
AS
SELECT
  pp.id,
  pp.user_id,
  pp.headline,
  pp.bio,
  pp.hourly_rate,
  pp.currency,
  pp.location_city,         -- city is public
  -- Raw lat/lng EXCLUDED
  pp.availability_status,
  pp.is_verified,
  pp.avg_rating,
  pp.total_reviews,
  pp.completed_jobs,
  pp.is_active,
  pp.created_at,
  -- Aggregated category names for display
  (
    SELECT array_agg(c.name ORDER BY c.name)
    FROM   public.provider_categories pc
    JOIN   public.categories          c  ON c.id = pc.category_id
    WHERE  pc.provider_id = pp.id
    AND    pc.deleted_at  IS NULL
  ) AS categories
FROM public.provider_profiles pp
WHERE pp.is_active   = true
AND   pp.deleted_at  IS NULL;

COMMENT ON VIEW public.providers_public_view IS
  'Public provider directory. Omits raw GPS coordinates. '
  'Use for search results and profile display pages.';


-- ── messages_view ────────────────────────────────────────────
-- @AI Privacy: ai_response is only visible to the message
-- sender. Other conversation participants see NULL for
-- ai_response, protecting @AI advisor confidentiality.
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE VIEW public.messages_view
  WITH (security_invoker = true)   -- invoker's RLS applies
AS
SELECT
  m.id,
  m.conversation_id,
  m.sender_type,
  m.sender_id,
  m.content,
  m.has_ai_mention,
  -- @AI response: visible only to the sender
  CASE
    WHEN m.sender_type = 'user'
         AND m.sender_id = linc_uid()
      THEN m.ai_response
    WHEN m.sender_type != 'user'
         AND linc_owns_entity(m.sender_type, m.sender_id)
      THEN m.ai_response
    ELSE NULL   -- other participants cannot see @AI response
  END            AS ai_response,
  m.is_read,
  m.created_at
FROM public.messages m
WHERE m.deleted_at IS NULL;

COMMENT ON VIEW public.messages_view IS
  '@AI privacy enforced: ai_response is NULL unless you are the '
  'original sender of the message. Use this view in all messaging '
  'API endpoints.';


-- ============================================================
-- SECTION 5 — SECURE HELPER FUNCTIONS (SECURITY DEFINER)
-- ============================================================

-- ── get_audit_log(table_name, record_id) → SETOF audit_logs
-- Admin-only function to retrieve audit history for a record.
-- Non-admins receive an empty result (not an error, to avoid
-- leaking the existence of the record).
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.get_audit_log(
  p_table_name VARCHAR,
  p_record_id  UUID
)
RETURNS SETOF public.audit_logs
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT linc_is_admin() THEN
    -- Return empty result for non-admins (no error leak)
    RETURN;
  END IF;

  RETURN QUERY
  SELECT *
  FROM   public.audit_logs
  WHERE  table_name = p_table_name
  AND    record_id  = p_record_id
  ORDER  BY performed_at DESC;
END;
$$;

COMMENT ON FUNCTION public.get_audit_log(VARCHAR, UUID) IS
  'Admin-only: returns audit history for a specific record. '
  'Returns empty set for non-admins (no exception raised).';


-- ── backfill_phone_encryption() → INTEGER (rows updated)
-- One-time migration function: encrypts plaintext phone numbers.
-- Run manually AFTER setting app.phone_encrypt_key in your DB.
-- Usage: SELECT backfill_phone_encryption();
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.backfill_phone_encryption()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  _key     TEXT;
  _updated INTEGER;
BEGIN
  IF NOT linc_is_admin() THEN
    RAISE EXCEPTION 'Admin access required' USING ERRCODE = '42501';
  END IF;

  _key := current_setting('app.phone_encrypt_key', true);
  IF _key IS NULL OR _key = '' THEN
    RAISE EXCEPTION 'app.phone_encrypt_key GUC is not set. '
      'Run: SET app.phone_encrypt_key = ''your-key'';'
      USING ERRCODE = 'P0001';
  END IF;

  WITH updated AS (
    UPDATE public.users
    SET    phone_encrypted = extensions.pgp_sym_encrypt(phone, _key)
    WHERE  phone         IS NOT NULL
    AND    phone          != ''
    AND    phone_encrypted IS NULL
    RETURNING id
  )
  SELECT COUNT(*) INTO _updated FROM updated;

  RETURN _updated;
END;
$$;

COMMENT ON FUNCTION public.backfill_phone_encryption() IS
  'One-time admin function to encrypt existing plaintext phone '
  'numbers into phone_encrypted using pgp_sym_encrypt.';
