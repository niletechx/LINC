-- ============================================================
-- LINC Database Schema Migration: Fix Escrow RLS Policies
-- Migration: 20260823000006_fix_escrow_rls_policies.sql
--
-- WHY THIS EXISTS:
-- Migration 20260816000002 created escrow RLS policies using
-- auth.uid() — which is Supabase Auth's built-in function.
-- LINC uses CUSTOM JWTs (signed with JWT_SECRET), not Supabase
-- Auth. auth.uid() will always return NULL with custom JWTs.
--
-- This migration drops the broken policies and recreates them
-- using linc_uid() (defined in migration 003), which correctly
-- reads the 'sub' claim from request.jwt.claims injected by
-- the Express auth middleware.
-- ============================================================

-- ── Drop broken auth.uid() policies ──────────────────────────────────────────

DROP POLICY IF EXISTS "Users can view their own escrow transactions" ON escrow_transactions;
DROP POLICY IF EXISTS "Service role has full access to escrow_transactions" ON escrow_transactions;
DROP POLICY IF EXISTS "Users can view their own disputes" ON escrow_disputes;
DROP POLICY IF EXISTS "Service role has full access to escrow_disputes" ON escrow_disputes;

-- ── Recreate policies using linc_uid() ───────────────────────────────────────

-- escrow_transactions: requester can view their own
CREATE POLICY "Requester can view their own escrow transactions"
  ON escrow_transactions FOR SELECT
  USING (linc_uid() = requester_id);

-- escrow_transactions: requester can insert (initiate escrow)
CREATE POLICY "Requester can create escrow transactions"
  ON escrow_transactions FOR INSERT
  WITH CHECK (linc_uid() = requester_id);

-- escrow_transactions: service role has full unrestricted access
CREATE POLICY "Service role has full access to escrow_transactions"
  ON escrow_transactions FOR ALL
  USING (auth.role() = 'service_role');

-- escrow_disputes: raiser can view their own disputes
CREATE POLICY "User can view their own disputes"
  ON escrow_disputes FOR SELECT
  USING (linc_uid() = raised_by);

-- escrow_disputes: raiser can insert their own disputes
CREATE POLICY "User can create disputes"
  ON escrow_disputes FOR INSERT
  WITH CHECK (linc_uid() = raised_by);

-- escrow_disputes: service role has full unrestricted access
CREATE POLICY "Service role has full access to escrow_disputes"
  ON escrow_disputes FOR ALL
  USING (auth.role() = 'service_role');
