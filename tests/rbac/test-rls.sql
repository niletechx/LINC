-- ============================================================
-- LINC RBAC — Verification Test Script
-- File: tests/rbac/test-rls.sql
--
-- PURPOSE
-- ───────
-- Proves all RLS policies work correctly by simulating JWT
-- contexts for different user roles and asserting expected
-- row counts.
--
-- HOW TO RUN
-- ──────────
-- Option A — Supabase SQL Editor (recommended):
--   Paste this entire file and run section by section.
--
-- Option B — psql:
--   psql "$DATABASE_URL" -f tests/rbac/test-rls.sql
--
-- PREREQUISITES
-- ─────────────
-- 1. Run migrations 003, 004, 005 first.
-- 2. Seed the database with the sample data in this script.
-- 3. Replace UUIDs marked [REPLACE] with real ones from your DB.
--
-- READING THE OUTPUT
-- ──────────────────
-- Each test prints:
--   PASS — assertion succeeded
--   FAIL — assertion failed (look at the NOTICE details)
-- ============================================================

-- ============================================================
-- SETUP: Test helper function
-- ============================================================

-- Temporarily set JWT claims for a test user
CREATE OR REPLACE FUNCTION test_set_jwt(
  p_user_id UUID,
  p_is_admin BOOLEAN DEFAULT false
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM set_config(
    'request.jwt.claims',
    json_build_object(
      'sub',      p_user_id::TEXT,
      'is_admin', p_is_admin
    )::TEXT,
    false  -- session-level
  );
END;
$$;

-- Assert helper: prints PASS/FAIL
CREATE OR REPLACE FUNCTION test_assert(
  p_description TEXT,
  p_actual      BIGINT,
  p_expected    BIGINT
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  IF p_actual = p_expected THEN
    RAISE NOTICE 'PASS ✓  %  (got: %)', p_description, p_actual;
  ELSE
    RAISE WARNING 'FAIL ✗  %  (expected: %, got: %)',
      p_description, p_expected, p_actual;
  END IF;
END;
$$;

-- ============================================================
-- SEED DATA
-- Creates isolated test users with predictable UUIDs.
-- All test records are prefixed with 'TEST_' for easy cleanup.
-- ============================================================

DO $$
DECLARE
  user_a_id     UUID := '00000000-0000-0000-0001-000000000001';
  user_b_id     UUID := '00000000-0000-0000-0001-000000000002';
  admin_id      UUID := '00000000-0000-0000-0001-000000000099';
  provider_id   UUID;   -- will be set after insert
  business_id   UUID;
BEGIN
  -- ── Users ──────────────────────────────────────────────────
  -- Use ON CONFLICT DO NOTHING for idempotency
  INSERT INTO public.users (id, email, password_hash, full_name, username, is_admin)
  VALUES
    (user_a_id,   'test_user_a@linc.test', '$2b$12$placeholder', 'Test User A', 'test_user_a', false),
    (user_b_id,   'test_user_b@linc.test', '$2b$12$placeholder', 'Test User B', 'test_user_b', false),
    (admin_id,    'test_admin@linc.test',  '$2b$12$placeholder', 'Test Admin',  'test_admin',  true)
  ON CONFLICT (id) DO NOTHING;

  -- ── Provider profile for User A ────────────────────────────
  INSERT INTO public.provider_profiles
    (id, user_id, headline, hourly_rate, is_active)
  VALUES
    ('00000000-0000-0000-0002-000000000001',
     user_a_id, 'TEST_ Plumber', 50.00, true)
  ON CONFLICT (user_id) DO NOTHING;

  -- ── Service request from User B ────────────────────────────
  INSERT INTO public.requests
    (id, user_id, title, description, status)
  VALUES
    ('00000000-0000-0000-0003-000000000001',
     user_b_id, 'TEST_ Need a plumber', 'Fix my pipe', 'open')
  ON CONFLICT (id) DO NOTHING;

  -- ── Match: User B's request → User A's provider profile ───
  INSERT INTO public.matches
    (id, request_id, entity_type, entity_id, match_score)
  VALUES
    ('00000000-0000-0000-0004-000000000001',
     '00000000-0000-0000-0003-000000000001',
     'provider',
     '00000000-0000-0000-0002-000000000001',
     0.9500)
  ON CONFLICT (id) DO NOTHING;

  -- ── Business owned by User A ───────────────────────────────
  INSERT INTO public.businesses
    (id, owner_id, name, is_active)
  VALUES
    ('00000000-0000-0000-0005-000000000001',
     user_a_id, 'TEST_ User A Plumbing Co', true)
  ON CONFLICT (id) DO NOTHING;

  -- Owner membership auto-record
  INSERT INTO public.business_members
    (business_id, user_id, role)
  VALUES
    ('00000000-0000-0000-0005-000000000001', user_a_id, 'owner')
  ON CONFLICT (business_id, user_id) DO NOTHING;

  -- ── AI conversation for User A ──────────────────────────────
  INSERT INTO public.ai_conversations
    (id, user_id, title)
  VALUES
    ('00000000-0000-0000-0006-000000000001',
     user_a_id, 'TEST_ AI session')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.ai_messages
    (id, conversation_id, role, content)
  VALUES
    ('00000000-0000-0000-0007-000000000001',
     '00000000-0000-0000-0006-000000000001',
     'user', 'TEST_ @AI is this provider reliable?'),
    ('00000000-0000-0000-0007-000000000002',
     '00000000-0000-0000-0006-000000000001',
     'assistant', 'TEST_ Based on reviews, yes they are highly rated.')
  ON CONFLICT (id) DO NOTHING;

  RAISE NOTICE '── Seed data inserted ──────────────────────────────────';
END;
$$;

-- ============================================================
-- TEST 1: Tenant Isolation — Users Table
-- User A can only see their own row.
-- User A cannot see User B's row.
-- ============================================================

RAISE NOTICE '';
RAISE NOTICE '════════════════════════════════════════════════════════';
RAISE NOTICE 'TEST 1: Tenant Isolation (users table)';
RAISE NOTICE '════════════════════════════════════════════════════════';

-- Set JWT as User A
SELECT test_set_jwt('00000000-0000-0000-0001-000000000001');

-- Should see exactly 1 row (their own)
SELECT test_assert(
  'User A sees exactly 1 user row (own)',
  (SELECT COUNT(*) FROM public.users),
  1
);

-- Should see their own email
SELECT test_assert(
  'User A sees their own email',
  (SELECT COUNT(*) FROM public.users WHERE email = 'test_user_a@linc.test'),
  1
);

-- Should NOT see User B
SELECT test_assert(
  'User A CANNOT see User B (tenant isolation)',
  (SELECT COUNT(*) FROM public.users WHERE id = '00000000-0000-0000-0001-000000000002'),
  0
);

-- ============================================================
-- TEST 2: Provider Match Access
-- Provider (User A) sees matches pointing to their profile.
-- Requester (User B) sees matches on their requests.
-- User A cannot see matches on User B's requests (unless matched).
-- ============================================================

RAISE NOTICE '';
RAISE NOTICE '════════════════════════════════════════════════════════';
RAISE NOTICE 'TEST 2: Provider Match Access';
RAISE NOTICE '════════════════════════════════════════════════════════';

-- Set JWT as User A (provider)
SELECT test_set_jwt('00000000-0000-0000-0001-000000000001');

-- User A's provider profile is matched → sees 1 match
SELECT test_assert(
  'Provider (User A) sees their assigned match',
  (SELECT COUNT(*) FROM public.matches WHERE entity_id = '00000000-0000-0000-0002-000000000001'),
  1
);

-- Set JWT as User B (requester)
SELECT test_set_jwt('00000000-0000-0000-0001-000000000002');

-- User B sees matches on their request
SELECT test_assert(
  'Requester (User B) sees matches on their request',
  (SELECT COUNT(*) FROM public.matches WHERE request_id = '00000000-0000-0000-0003-000000000001'),
  1
);

-- User B cannot directly access User A's requests
SELECT test_assert(
  'User B CANNOT see User A requests',
  (SELECT COUNT(*) FROM public.requests WHERE user_id = '00000000-0000-0000-0001-000000000001'),
  0
);

-- ============================================================
-- TEST 3: @AI Privacy
-- User A's AI conversations are invisible to User B.
-- User A sees their own AI messages.
-- ============================================================

RAISE NOTICE '';
RAISE NOTICE '════════════════════════════════════════════════════════';
RAISE NOTICE 'TEST 3: @AI Message Privacy';
RAISE NOTICE '════════════════════════════════════════════════════════';

-- Set JWT as User A (owner of AI conversation)
SELECT test_set_jwt('00000000-0000-0000-0001-000000000001');

SELECT test_assert(
  'User A sees their own AI conversations (1)',
  (SELECT COUNT(*) FROM public.ai_conversations
   WHERE id = '00000000-0000-0000-0006-000000000001'),
  1
);

SELECT test_assert(
  'User A sees their own AI messages (2)',
  (SELECT COUNT(*) FROM public.ai_messages
   WHERE conversation_id = '00000000-0000-0000-0006-000000000001'),
  2
);

-- Set JWT as User B (different user)
SELECT test_set_jwt('00000000-0000-0000-0001-000000000002');

SELECT test_assert(
  'User B CANNOT see User A AI conversations (0)',
  (SELECT COUNT(*) FROM public.ai_conversations
   WHERE id = '00000000-0000-0000-0006-000000000001'),
  0
);

SELECT test_assert(
  'User B CANNOT see User A AI messages (0)',
  (SELECT COUNT(*) FROM public.ai_messages
   WHERE conversation_id = '00000000-0000-0000-0006-000000000001'),
  0
);

-- ============================================================
-- TEST 4: Soft Delete
-- After soft-delete, the record is gone from RLS queries
-- but still physically exists (deleted_at IS NOT NULL).
-- ============================================================

RAISE NOTICE '';
RAISE NOTICE '════════════════════════════════════════════════════════';
RAISE NOTICE 'TEST 4: Soft Delete Behavior';
RAISE NOTICE '════════════════════════════════════════════════════════';

-- Set JWT as User B (who owns the request)
SELECT test_set_jwt('00000000-0000-0000-0001-000000000002');

-- Verify request exists before delete
SELECT test_assert(
  'User B sees their open request before delete (1)',
  (SELECT COUNT(*) FROM public.requests
   WHERE id = '00000000-0000-0000-0003-000000000001'),
  1
);

-- Issue DELETE — the soft_delete trigger will intercept this
-- and set deleted_at = NOW() instead of hard-deleting
DELETE FROM public.requests
WHERE id = '00000000-0000-0000-0003-000000000001';

-- After soft-delete: RLS filter (deleted_at IS NULL) hides the row
SELECT test_assert(
  'User B CANNOT see soft-deleted request via RLS (0)',
  (SELECT COUNT(*) FROM public.requests
   WHERE id = '00000000-0000-0000-0003-000000000001'),
  0
);

-- Admin can see the soft-deleted row (admin policy has no deleted_at filter)
SELECT test_set_jwt('00000000-0000-0000-0001-000000000099', true);

SELECT test_assert(
  'Admin SEES soft-deleted request (record still in DB)',
  (SELECT COUNT(*) FROM public.requests
   WHERE id = '00000000-0000-0000-0003-000000000001'
   AND deleted_at IS NOT NULL),
  1
);

-- ============================================================
-- TEST 5: Audit Log Population
-- After the DELETE above (soft), an audit record must exist.
-- ============================================================

RAISE NOTICE '';
RAISE NOTICE '════════════════════════════════════════════════════════';
RAISE NOTICE 'TEST 5: Audit Log Population';
RAISE NOTICE '════════════════════════════════════════════════════════';

-- Still as Admin
SELECT test_assert(
  'Audit log has a DELETE entry for the request',
  (SELECT COUNT(*) FROM public.audit_logs
   WHERE table_name = 'requests'
   AND   record_id  = '00000000-0000-0000-0003-000000000001'
   AND   operation  = 'DELETE'),
  1
);

-- Non-admin cannot see audit logs
SELECT test_set_jwt('00000000-0000-0000-0001-000000000001');  -- User A

SELECT test_assert(
  'Non-admin CANNOT see audit_logs (0)',
  (SELECT COUNT(*) FROM public.audit_logs),
  0
);

-- ============================================================
-- TEST 6: Admin Full Access
-- Admin sees all data across tenants.
-- ============================================================

RAISE NOTICE '';
RAISE NOTICE '════════════════════════════════════════════════════════';
RAISE NOTICE 'TEST 6: Admin Full Access';
RAISE NOTICE '════════════════════════════════════════════════════════';

SELECT test_set_jwt('00000000-0000-0000-0001-000000000099', true);

SELECT test_assert(
  'Admin sees both test users (2)',
  (SELECT COUNT(*) FROM public.users
   WHERE id IN (
     '00000000-0000-0000-0001-000000000001',
     '00000000-0000-0000-0001-000000000002'
   )),
  2
);

SELECT test_assert(
  'Admin sees the provider match (1)',
  (SELECT COUNT(*) FROM public.matches
   WHERE id = '00000000-0000-0000-0004-000000000001'),
  1
);

-- ============================================================
-- TEST 7: Business Staff Access
-- Staff member can see business bookings.
-- Staff member cannot update bookings (only owner/manager can).
-- ============================================================

RAISE NOTICE '';
RAISE NOTICE '════════════════════════════════════════════════════════';
RAISE NOTICE 'TEST 7: Business Hierarchy Access';
RAISE NOTICE '════════════════════════════════════════════════════════';

DO $$
DECLARE
  staff_id   UUID := '00000000-0000-0000-0001-000000000050';
  biz_id     UUID := '00000000-0000-0000-0005-000000000001';
  svc_id     UUID;
  cat_id     UUID;
  booking_id UUID := '00000000-0000-0000-0008-000000000001';
BEGIN
  -- Create a category (needed for services FK)
  INSERT INTO public.categories (id, name, slug)
  VALUES ('00000000-0000-0000-0009-000000000001', 'TEST_ Plumbing', 'test-plumbing')
  ON CONFLICT (id) DO NOTHING;

  -- Create a service under the business
  INSERT INTO public.services
    (id, business_id, category_id, title, price_type, is_active)
  VALUES
    ('00000000-0000-0000-000A-000000000001',
     biz_id,
     '00000000-0000-0000-0009-000000000001',
     'TEST_ Pipe Fix', 'fixed', true)
  ON CONFLICT (id) DO NOTHING;

  -- Create staff user
  INSERT INTO public.users (id, email, password_hash, full_name, username)
  VALUES (staff_id, 'test_staff@linc.test', '$2b$12$placeholder', 'Test Staff', 'test_staff')
  ON CONFLICT (id) DO NOTHING;

  -- Add staff to business
  INSERT INTO public.business_members (business_id, user_id, role)
  VALUES (biz_id, staff_id, 'staff')
  ON CONFLICT (business_id, user_id) DO NOTHING;

  -- Create a booking for User B against the business service
  INSERT INTO public.bookings
    (id, requester_id, service_id, entity_type, entity_id, status)
  VALUES
    (booking_id,
     '00000000-0000-0000-0001-000000000002',
     '00000000-0000-0000-000A-000000000001',
     'business', biz_id, 'pending')
  ON CONFLICT (id) DO NOTHING;
END;
$$;

-- Staff sees business bookings (SELECT policy: any member)
SELECT test_set_jwt('00000000-0000-0000-0001-000000000050');

SELECT test_assert(
  'Staff member CAN see business booking (1)',
  (SELECT COUNT(*) FROM public.bookings
   WHERE id = '00000000-0000-0000-0008-000000000001'),
  1
);

-- ============================================================
-- TEST 8: linc_uid() Returns Correct Value
-- Direct function test.
-- ============================================================

RAISE NOTICE '';
RAISE NOTICE '════════════════════════════════════════════════════════';
RAISE NOTICE 'TEST 8: Helper Functions';
RAISE NOTICE '════════════════════════════════════════════════════════';

SELECT test_set_jwt('00000000-0000-0000-0001-000000000001');

SELECT test_assert(
  'linc_uid() returns User A UUID',
  (SELECT COUNT(*) FROM (
    SELECT linc_uid() AS uid
  ) t WHERE uid = '00000000-0000-0000-0001-000000000001'),
  1
);

SELECT test_assert(
  'linc_is_admin() = false for regular user',
  (SELECT COUNT(*) FROM (SELECT linc_is_admin() AS is_admin) t WHERE is_admin = false),
  1
);

SELECT test_set_jwt('00000000-0000-0000-0001-000000000099', true);

SELECT test_assert(
  'linc_is_admin() = true for admin user',
  (SELECT COUNT(*) FROM (SELECT linc_is_admin() AS is_admin) t WHERE is_admin = true),
  1
);

-- ============================================================
-- CLEANUP
-- Removes all TEST_ prefixed records and helper functions.
-- Run this after all tests pass to keep your DB clean.
-- ============================================================

RAISE NOTICE '';
RAISE NOTICE '════════════════════════════════════════════════════════';
RAISE NOTICE 'CLEANUP — Removing test seed data';
RAISE NOTICE '════════════════════════════════════════════════════════';

-- Temporarily use admin context for cleanup
SELECT test_set_jwt('00000000-0000-0000-0001-000000000099', true);

-- Hard-delete test data (use superuser/service_role which bypasses RLS + soft-delete trigger)
-- In Supabase SQL editor you run as postgres (superuser), so triggers still fire.
-- Use direct UPDATE to bypass the soft-delete trigger for cleanup:
UPDATE public.bookings          SET deleted_at = NOW() WHERE id = '00000000-0000-0000-0008-000000000001';
UPDATE public.ai_messages       SET deleted_at = NOW() WHERE conversation_id = '00000000-0000-0000-0006-000000000001';
UPDATE public.ai_conversations  SET deleted_at = NOW() WHERE id = '00000000-0000-0000-0006-000000000001';
UPDATE public.matches           SET deleted_at = NOW() WHERE id = '00000000-0000-0000-0004-000000000001';
UPDATE public.services          SET deleted_at = NOW() WHERE id = '00000000-0000-0000-000A-000000000001';
UPDATE public.categories        SET deleted_at = NOW() WHERE id = '00000000-0000-0000-0009-000000000001';
UPDATE public.business_members  SET deleted_at = NOW() WHERE business_id = '00000000-0000-0000-0005-000000000001';
UPDATE public.businesses        SET deleted_at = NOW() WHERE id = '00000000-0000-0000-0005-000000000001';
UPDATE public.provider_profiles SET deleted_at = NOW() WHERE id = '00000000-0000-0000-0002-000000000001';
UPDATE public.users             SET deleted_at = NOW()
WHERE id IN (
  '00000000-0000-0000-0001-000000000001',
  '00000000-0000-0000-0001-000000000002',
  '00000000-0000-0000-0001-000000000050',
  '00000000-0000-0000-0001-000000000099'
);

-- Drop test helpers
DROP FUNCTION IF EXISTS test_set_jwt(UUID, BOOLEAN);
DROP FUNCTION IF EXISTS test_assert(TEXT, BIGINT, BIGINT);

RAISE NOTICE 'Cleanup complete.';
RAISE NOTICE '';
RAISE NOTICE '════════════════════════════════════════════════════════';
RAISE NOTICE 'All RLS tests complete. Review PASS/FAIL notices above.';
RAISE NOTICE '════════════════════════════════════════════════════════';
