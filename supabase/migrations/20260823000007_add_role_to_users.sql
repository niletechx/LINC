-- ============================================================
-- LINC — Add 'role' column to users table
-- Migration: 20260823000007_add_role_to_users.sql
--
-- The original schema (migration 001) was missing the 'role' column
-- on the users table. The backend auth.service.js accepts a 'role'
-- param during registration (supporting 'client' | 'provider') but
-- had no column to store it — causing provider roles to be lost.
-- ============================================================

-- Add role column with 'client' as the safe default
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS role varchar(20) NOT NULL DEFAULT 'client'
  CHECK (role IN ('client', 'provider', 'admin'));

-- Index for fast role-based queries (e.g. list all providers)
CREATE INDEX IF NOT EXISTS idx_users_role
  ON public.users(role)
  WHERE deleted_at IS NULL;

-- Backfill: users who already have a provider_profile should be 'provider'
UPDATE public.users u
SET    role = 'provider'
WHERE  EXISTS (
  SELECT 1 FROM public.provider_profiles pp WHERE pp.user_id = u.id
)
AND u.role = 'client';
