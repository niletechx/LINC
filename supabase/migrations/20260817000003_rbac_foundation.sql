-- ============================================================
-- LINC RBAC — Phase 1: Foundation
-- Migration: 20260817000003_rbac_foundation.sql
--
-- IMPORTANT: Run this BEFORE rls_policies and audit_triggers.
-- Idempotent — safe to run multiple times.
-- ============================================================

-- ============================================================
-- EXTENSIONS
-- pgcrypto: already enabled in migration 001. Kept here for
--           safety. Adds gen_random_uuid() and pgp_* functions.
-- ============================================================
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================
-- SECTION 1 — JWT CLAIM HELPER FUNCTIONS
--
-- LINC uses a custom JWT signed with JWT_SECRET (not Supabase
-- native auth). Express middleware sets the GUC
-- request.jwt.claims to the decoded JSON payload before each
-- query. These SECURITY DEFINER functions read that GUC so
-- RLS policies stay simple and don't repeat the parsing logic.
--
-- Why SECURITY DEFINER?
--   • Ensures the function runs with definer's search_path,
--     preventing search_path injection attacks.
--   • Allows RLS policies (which run as the row owner) to call
--     session-level settings without privilege escalation.
-- ============================================================

-- ------------------------------------------------------------
-- linc_uid() → UUID
-- Returns the authenticated user's UUID from the JWT 'sub'
-- claim. Returns NULL if no valid JWT claims are present
-- (unauthenticated requests).
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION linc_uid()
RETURNS UUID
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _raw  TEXT;
  _json JSONB;
BEGIN
  _raw := current_setting('request.jwt.claims', true);
  IF _raw IS NULL OR _raw = '' THEN
    RETURN NULL;
  END IF;
  BEGIN
    _json := _raw::JSONB;
    RETURN (_json ->> 'sub')::UUID;
  EXCEPTION WHEN OTHERS THEN
    RETURN NULL;
  END;
END;
$$;

COMMENT ON FUNCTION linc_uid() IS
  'Returns the current user UUID from request.jwt.claims.sub. '
  'Set by Express auth middleware on every DB request.';

-- ------------------------------------------------------------
-- linc_is_admin() → BOOLEAN
-- Returns TRUE only if the JWT claim is_admin = true.
-- We cross-check against the actual users table inside RLS
-- policies for critical operations to prevent token forgery
-- from granting admin via stale tokens.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION linc_is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _raw  TEXT;
  _json JSONB;
BEGIN
  _raw := current_setting('request.jwt.claims', true);
  IF _raw IS NULL OR _raw = '' THEN
    RETURN false;
  END IF;
  BEGIN
    _json := _raw::JSONB;
    RETURN COALESCE((_json ->> 'is_admin')::BOOLEAN, false);
  EXCEPTION WHEN OTHERS THEN
    RETURN false;
  END;
END;
$$;

COMMENT ON FUNCTION linc_is_admin() IS
  'Returns TRUE if the JWT claim is_admin = true. '
  'Validated against users.is_admin in high-security policies.';

-- ------------------------------------------------------------
-- linc_is_provider() → BOOLEAN
-- Returns TRUE if the current user has an active provider
-- profile. Used to short-circuit provider-specific checks.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION linc_is_provider()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM   public.provider_profiles
    WHERE  user_id   = linc_uid()
    AND    is_active = true
    AND    deleted_at IS NULL
  );
$$;

COMMENT ON FUNCTION linc_is_provider() IS
  'Returns TRUE if the current user has an active provider profile.';

-- ------------------------------------------------------------
-- linc_owns_entity(entity_type, entity_id) → BOOLEAN
-- Polymorphic ownership check used by matches, bookings, and
-- escrow policies where entity_type ∈ {provider, business,
-- organization}.
--
-- Policy: "most restrictive defaults"
--   • provider  → user_id must match provider_profiles.user_id
--   • business  → user must be in business_members (any role)
--   • organization → user must be in organization_members (any role)
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION linc_owns_entity(
  p_entity_type VARCHAR,
  p_entity_id   UUID
)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE p_entity_type
    WHEN 'provider' THEN EXISTS (
      SELECT 1 FROM public.provider_profiles
      WHERE  id      = p_entity_id
      AND    user_id = linc_uid()
      AND    deleted_at IS NULL
    )
    WHEN 'business' THEN EXISTS (
      SELECT 1 FROM public.business_members
      WHERE  business_id = p_entity_id
      AND    user_id     = linc_uid()
    )
    WHEN 'organization' THEN EXISTS (
      SELECT 1 FROM public.organization_members
      WHERE  organization_id = p_entity_id
      AND    user_id         = linc_uid()
    )
    ELSE false
  END;
$$;

-- ------------------------------------------------------------
-- linc_owns_entity_manager(entity_type, entity_id) → BOOLEAN
-- Same as linc_owns_entity but restricted to owner/manager
-- roles only. Used for UPDATE/DELETE operations on
-- business-owned data.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION linc_owns_entity_manager(
  p_entity_type VARCHAR,
  p_entity_id   UUID
)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE p_entity_type
    WHEN 'business' THEN EXISTS (
      SELECT 1 FROM public.business_members
      WHERE  business_id = p_entity_id
      AND    user_id     = linc_uid()
      AND    role        IN ('owner', 'manager')
    )
    WHEN 'organization' THEN EXISTS (
      SELECT 1 FROM public.organization_members
      WHERE  organization_id = p_entity_id
      AND    user_id         = linc_uid()
      AND    role            IN ('owner', 'manager')
    )
    -- providers have no internal hierarchy
    WHEN 'provider' THEN EXISTS (
      SELECT 1 FROM public.provider_profiles
      WHERE  id      = p_entity_id
      AND    user_id = linc_uid()
      AND    deleted_at IS NULL
    )
    ELSE false
  END;
$$;

-- ------------------------------------------------------------
-- linc_is_conversation_participant(conv_id) → BOOLEAN
-- Returns TRUE if the current user is either participant_a
-- or participant_b of the conversation, resolving through
-- provider_profiles, business_members, and organization_members
-- for polymorphic participant types.
-- Business/org members are treated as conversation participants
-- (per product decision).
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION linc_is_conversation_participant(p_conv_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id = p_conv_id
    AND (
      -- ── Participant A ──────────────────────────────────────
      (c.participant_a_type = 'user'
        AND c.participant_a_id = linc_uid())
      OR
      (c.participant_a_type = 'provider'
        AND EXISTS (
          SELECT 1 FROM public.provider_profiles
          WHERE id = c.participant_a_id AND user_id = linc_uid()
        ))
      OR
      (c.participant_a_type = 'business'
        AND EXISTS (
          SELECT 1 FROM public.business_members
          WHERE business_id = c.participant_a_id AND user_id = linc_uid()
        ))
      OR
      (c.participant_a_type = 'organization'
        AND EXISTS (
          SELECT 1 FROM public.organization_members
          WHERE organization_id = c.participant_a_id AND user_id = linc_uid()
        ))
      -- ── Participant B ──────────────────────────────────────
      OR
      (c.participant_b_type = 'user'
        AND c.participant_b_id = linc_uid())
      OR
      (c.participant_b_type = 'provider'
        AND EXISTS (
          SELECT 1 FROM public.provider_profiles
          WHERE id = c.participant_b_id AND user_id = linc_uid()
        ))
      OR
      (c.participant_b_type = 'business'
        AND EXISTS (
          SELECT 1 FROM public.business_members
          WHERE business_id = c.participant_b_id AND user_id = linc_uid()
        ))
      OR
      (c.participant_b_type = 'organization'
        AND EXISTS (
          SELECT 1 FROM public.organization_members
          WHERE organization_id = c.participant_b_id AND user_id = linc_uid()
        ))
    )
  );
$$;

-- ============================================================
-- SECTION 2 — SOFT DELETE: ADD deleted_at TO ALL TABLES
--
-- Why ALTER TABLE ADD COLUMN IF NOT EXISTS?
--   Idempotent — repeated migrations won't fail.
--
-- Why DEFAULT NULL?
--   NULL = active record. NOT NULL = logically deleted.
--   This lets us distinguish "never deleted" from "deleted".
-- ============================================================

ALTER TABLE public.users               ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE public.provider_profiles   ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE public.provider_categories ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE public.businesses          ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE public.business_members    ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE public.organizations       ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE public.organization_members ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE public.categories          ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE public.services            ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE public.requests            ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE public.matches             ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE public.bookings            ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE public.conversations       ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE public.messages            ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE public.ai_conversations    ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE public.ai_messages         ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE public.reviews             ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE public.verification_requests ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE public.reports             ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE public.notifications       ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE public.escrow_transactions ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE public.escrow_disputes     ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

-- ============================================================
-- SECTION 3 — PARTIAL INDEXES ON deleted_at
--
-- Why partial indexes (WHERE deleted_at IS NULL)?
--   99% of all queries only touch active (non-deleted) rows.
--   A partial index covering only active rows is dramatically
--   smaller and faster than a full-column index.
--   Planner uses this index for `WHERE deleted_at IS NULL`
--   queries, which appears in every RLS SELECT policy.
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_users_active               ON public.users(id)               WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_provider_profiles_active   ON public.provider_profiles(id)   WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_provider_categories_active ON public.provider_categories(id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_businesses_active          ON public.businesses(id)          WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_business_members_active    ON public.business_members(id)    WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_organizations_active       ON public.organizations(id)       WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_org_members_active         ON public.organization_members(id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_categories_active          ON public.categories(id)          WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_services_active            ON public.services(id)            WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_requests_active            ON public.requests(id)            WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_matches_active             ON public.matches(id)             WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_bookings_active            ON public.bookings(id)            WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_conversations_active       ON public.conversations(id)       WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_messages_active            ON public.messages(id)            WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_ai_conversations_active    ON public.ai_conversations(id)   WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_ai_messages_active         ON public.ai_messages(id)        WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_reviews_active             ON public.reviews(id)            WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_verification_active        ON public.verification_requests(id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_reports_active             ON public.reports(id)            WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_notifications_active       ON public.notifications(id)      WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_escrow_transactions_active ON public.escrow_transactions(id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_escrow_disputes_active     ON public.escrow_disputes(id)    WHERE deleted_at IS NULL;

-- ============================================================
-- SECTION 4 — SOFT DELETE TRIGGER
--
-- This trigger intercepts any DELETE statement and converts it
-- to UPDATE SET deleted_at = NOW(), then returns NULL to
-- cancel the actual hard delete.
--
-- Why SECURITY DEFINER?
--   The trigger function needs to UPDATE the row even when the
--   calling role has no direct UPDATE privilege. The function
--   itself is subject to RLS only for the inner UPDATE if the
--   calling user's JWT context is active.
--
-- Soft-delete applies to all tables with deleted_at.
-- Hard DELETE is never performed by application code.
-- Only database superuser / Supabase migrations can hard-delete.
-- ============================================================

CREATE OR REPLACE FUNCTION public.fn_soft_delete()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Convert the DELETE into a soft-delete UPDATE
  EXECUTE format(
    'UPDATE public.%I SET deleted_at = NOW() WHERE id = $1',
    TG_TABLE_NAME
  ) USING OLD.id;

  -- Return NULL cancels the actual hard DELETE
  RETURN NULL;
END;
$$;

COMMENT ON FUNCTION public.fn_soft_delete() IS
  'Generic soft-delete trigger: intercepts DELETE and sets '
  'deleted_at = NOW() instead of removing the row.';

-- Attach soft-delete trigger to all 22 tables
-- (DROP + CREATE for idempotency)

DO $$
DECLARE
  t TEXT;
  tables TEXT[] := ARRAY[
    'users', 'provider_profiles', 'provider_categories',
    'businesses', 'business_members',
    'organizations', 'organization_members',
    'categories', 'services', 'requests', 'matches',
    'bookings', 'conversations', 'messages',
    'ai_conversations', 'ai_messages',
    'reviews', 'verification_requests', 'reports',
    'notifications', 'escrow_transactions', 'escrow_disputes'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    -- Drop existing trigger if present (idempotency)
    EXECUTE format(
      'DROP TRIGGER IF EXISTS trg_%s_soft_delete ON public.%I',
      t, t
    );
    -- Create the soft-delete trigger
    EXECUTE format(
      'CREATE TRIGGER trg_%s_soft_delete
       BEFORE DELETE ON public.%I
       FOR EACH ROW EXECUTE FUNCTION public.fn_soft_delete()',
      t, t
    );
  END LOOP;
END;
$$;

-- ============================================================
-- SECTION 5 — PHONE ENCRYPTION COLUMN
--
-- Adds phone_encrypted (BYTEA) to users for pgcrypto-encrypted
-- phone numbers. The plaintext phone column is retained for
-- gradual migration but will be masked via views.
-- Set PHONE_ENCRYPT_KEY in your .env and run the backfill
-- script (tests/rbac/backfill_phone_encryption.sql) after
-- configuring the key.
-- ============================================================

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS phone_encrypted BYTEA DEFAULT NULL;

COMMENT ON COLUMN public.users.phone_encrypted IS
  'pgp_sym_encrypt(phone, PHONE_ENCRYPT_KEY) — encrypted phone. '
  'Readable only via SECURITY DEFINER function get_own_phone().';

-- SECURITY DEFINER wrapper: users read their own phone only
CREATE OR REPLACE FUNCTION public.get_own_phone()
RETURNS TEXT
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _encrypted BYTEA;
BEGIN
  SELECT phone_encrypted INTO _encrypted
  FROM   public.users
  WHERE  id = linc_uid();

  IF _encrypted IS NULL THEN
    RETURN NULL;
  END IF;

  -- Key must be set via set_config or as a DB secret
  RETURN pgp_sym_decrypt(
    _encrypted,
    current_setting('app.phone_encrypt_key', true)
  );
EXCEPTION WHEN OTHERS THEN
  RAISE EXCEPTION 'Phone decryption failed — contact support'
    USING ERRCODE = 'P0001';
END;
$$;

-- SECURITY DEFINER wrapper: update own password hash
-- Application must NEVER allow direct UPDATE to password_hash.
-- All password changes must go through this function.
CREATE OR REPLACE FUNCTION public.update_own_password(p_new_hash TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF linc_uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required'
      USING ERRCODE = '28000';
  END IF;

  IF length(p_new_hash) < 60 THEN
    RAISE EXCEPTION 'Invalid password hash format'
      USING ERRCODE = 'P0001';
  END IF;

  UPDATE public.users
  SET    password_hash = p_new_hash,
         updated_at    = NOW()
  WHERE  id = linc_uid();

  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found'
      USING ERRCODE = 'P0002';
  END IF;
END;
$$;

COMMENT ON FUNCTION public.update_own_password(TEXT) IS
  'The ONLY allowed way to change a password hash. '
  'Direct UPDATE to password_hash column is blocked by RLS.';
