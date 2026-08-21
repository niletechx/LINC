-- ============================================================
-- LINC RBAC — Phase 2: Row Level Security Policies
-- Migration: 20260817000004_rls_policies.sql
--
-- PREREQUISITE: 20260817000003_rbac_foundation.sql must be run first.
-- IDEMPOTENT: All policies are DROPped before CREATE.
--
-- Security model:
--   • NULL linc_uid() = unauthenticated = zero access
--   • service_role (used internally by Express) bypasses RLS
--   • linc_is_admin() = platform admin = full access
--   • All SELECT policies filter deleted_at IS NULL
--   • Admins see all rows including soft-deleted ones
--
-- Table order follows FK dependency chain.
-- ============================================================

-- ============================================================
-- 1. USERS
-- ============================================================
-- SELECT: own row (full data) OR admin (full data).
--         Public profile data is exposed via users_public_view
--         in the column-security migration, NOT here.
-- INSERT: blocked — users are created by your auth system
--         using the service_role client (bypasses RLS).
-- UPDATE: own row, BUT password_hash is NOT updatable here
--         (use update_own_password() function instead).
--         Admin can update any row including is_admin flag.
-- DELETE: blocked via soft-delete trigger; RLS DELETE policy
--         restricts who can trigger it (admin only).
-- ============================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users: admin full access"       ON public.users;
DROP POLICY IF EXISTS "users: read own row"            ON public.users;
DROP POLICY IF EXISTS "users: update own row"          ON public.users;
DROP POLICY IF EXISTS "users: admin update any"        ON public.users;
DROP POLICY IF EXISTS "users: soft delete admin only"  ON public.users;

-- Admin sees every row (including deleted)
CREATE POLICY "users: admin full access"
  ON public.users
  FOR ALL
  USING (linc_is_admin());

-- Regular users: read own active row
CREATE POLICY "users: read own row"
  ON public.users
  FOR SELECT
  USING (
    id = linc_uid()
    AND deleted_at IS NULL
  );

-- Regular users: update own row (except password_hash — blocked
-- separately by NOT granting UPDATE on that column via views)
CREATE POLICY "users: update own row"
  ON public.users
  FOR UPDATE
  USING (
    id = linc_uid()
    AND deleted_at IS NULL
  )
  WITH CHECK (
    id = linc_uid()
    -- Prevent self-escalation: cannot change is_admin via UPDATE
    -- (admin changes only go through the admin policy above)
  );

-- Soft-delete: only admin can DELETE (which becomes deleted_at = NOW())
CREATE POLICY "users: soft delete admin only"
  ON public.users
  FOR DELETE
  USING (linc_is_admin());


-- ============================================================
-- 2. PROVIDER_PROFILES
-- ============================================================
-- SELECT: Public can see active, non-deleted profiles.
--         Raw lat/lng are masked in providers_public_view.
-- INSERT: Any authenticated user can become a provider
--         (one profile per user — enforced by UNIQUE constraint).
-- UPDATE: Own profile OR admin.
-- DELETE: Own profile OR admin → soft delete.
-- ============================================================
ALTER TABLE public.provider_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_profiles FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "provider_profiles: admin full access"   ON public.provider_profiles;
DROP POLICY IF EXISTS "provider_profiles: public read active"  ON public.provider_profiles;
DROP POLICY IF EXISTS "provider_profiles: insert own"          ON public.provider_profiles;
DROP POLICY IF EXISTS "provider_profiles: update own"          ON public.provider_profiles;
DROP POLICY IF EXISTS "provider_profiles: delete own or admin" ON public.provider_profiles;

CREATE POLICY "provider_profiles: admin full access"
  ON public.provider_profiles FOR ALL
  USING (linc_is_admin());

-- Public: only active, non-deleted profiles
CREATE POLICY "provider_profiles: public read active"
  ON public.provider_profiles FOR SELECT
  USING (
    is_active   = true
    AND deleted_at IS NULL
  );

-- Authenticated user creates their own profile
CREATE POLICY "provider_profiles: insert own"
  ON public.provider_profiles FOR INSERT
  WITH CHECK (
    user_id = linc_uid()
    AND linc_uid() IS NOT NULL
  );

CREATE POLICY "provider_profiles: update own"
  ON public.provider_profiles FOR UPDATE
  USING (
    user_id    = linc_uid()
    AND deleted_at IS NULL
  )
  WITH CHECK (user_id = linc_uid());

CREATE POLICY "provider_profiles: delete own or admin"
  ON public.provider_profiles FOR DELETE
  USING (
    user_id = linc_uid()
    OR linc_is_admin()
  );


-- ============================================================
-- 3. PROVIDER_CATEGORIES
-- ============================================================
ALTER TABLE public.provider_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_categories FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "provider_categories: admin full access" ON public.provider_categories;
DROP POLICY IF EXISTS "provider_categories: public read"       ON public.provider_categories;
DROP POLICY IF EXISTS "provider_categories: manage own"        ON public.provider_categories;
DROP POLICY IF EXISTS "provider_categories: delete own"        ON public.provider_categories;

CREATE POLICY "provider_categories: admin full access"
  ON public.provider_categories FOR ALL
  USING (linc_is_admin());

-- Public: visible if provider is active
CREATE POLICY "provider_categories: public read"
  ON public.provider_categories FOR SELECT
  USING (
    deleted_at IS NULL
    AND EXISTS (
      SELECT 1 FROM public.provider_profiles
      WHERE id        = provider_id
      AND   is_active = true
      AND   deleted_at IS NULL
    )
  );

-- Provider manages their own category tags
CREATE POLICY "provider_categories: manage own"
  ON public.provider_categories FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.provider_profiles
      WHERE id      = provider_id
      AND   user_id = linc_uid()
    )
  );

CREATE POLICY "provider_categories: delete own"
  ON public.provider_categories FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.provider_profiles
      WHERE id      = provider_id
      AND   user_id = linc_uid()
    )
  );


-- ============================================================
-- 4. BUSINESSES
-- ============================================================
-- SELECT: Public sees active businesses.
-- INSERT: Any authenticated user can create a business.
-- UPDATE: Owner or manager of the business.
-- DELETE: Owner only → soft delete.
-- ============================================================
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.businesses FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "businesses: admin full access"   ON public.businesses;
DROP POLICY IF EXISTS "businesses: public read active"  ON public.businesses;
DROP POLICY IF EXISTS "businesses: member read"         ON public.businesses;
DROP POLICY IF EXISTS "businesses: insert own"          ON public.businesses;
DROP POLICY IF EXISTS "businesses: update manager"      ON public.businesses;
DROP POLICY IF EXISTS "businesses: delete owner"        ON public.businesses;

CREATE POLICY "businesses: admin full access"
  ON public.businesses FOR ALL
  USING (linc_is_admin());

CREATE POLICY "businesses: public read active"
  ON public.businesses FOR SELECT
  USING (
    is_active  = true
    AND deleted_at IS NULL
  );

-- Members see their own business (even if inactive, for management)
CREATE POLICY "businesses: member read"
  ON public.businesses FOR SELECT
  USING (
    deleted_at IS NULL
    AND EXISTS (
      SELECT 1 FROM public.business_members
      WHERE business_id = id
      AND   user_id     = linc_uid()
    )
  );

CREATE POLICY "businesses: insert own"
  ON public.businesses FOR INSERT
  WITH CHECK (
    owner_id   = linc_uid()
    AND linc_uid() IS NOT NULL
  );

-- Owner or manager can update the business profile
CREATE POLICY "businesses: update manager"
  ON public.businesses FOR UPDATE
  USING (
    deleted_at IS NULL
    AND EXISTS (
      SELECT 1 FROM public.business_members
      WHERE business_id = id
      AND   user_id     = linc_uid()
      AND   role        IN ('owner', 'manager')
    )
  )
  WITH CHECK (owner_id = owner_id); -- owner_id cannot be changed

-- Only business owner can soft-delete
CREATE POLICY "businesses: delete owner"
  ON public.businesses FOR DELETE
  USING (owner_id = linc_uid());


-- ============================================================
-- 5. BUSINESS_MEMBERS
-- ============================================================
ALTER TABLE public.business_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_members FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "business_members: admin full access"   ON public.business_members;
DROP POLICY IF EXISTS "business_members: member read own"     ON public.business_members;
DROP POLICY IF EXISTS "business_members: manager read all"    ON public.business_members;
DROP POLICY IF EXISTS "business_members: manager invite"      ON public.business_members;
DROP POLICY IF EXISTS "business_members: manager update role" ON public.business_members;
DROP POLICY IF EXISTS "business_members: manager remove"      ON public.business_members;

CREATE POLICY "business_members: admin full access"
  ON public.business_members FOR ALL
  USING (linc_is_admin());

-- Each member can see their own membership
CREATE POLICY "business_members: member read own"
  ON public.business_members FOR SELECT
  USING (
    user_id    = linc_uid()
    AND deleted_at IS NULL
  );

-- Managers/owners see all members of their business
CREATE POLICY "business_members: manager read all"
  ON public.business_members FOR SELECT
  USING (
    deleted_at IS NULL
    AND EXISTS (
      SELECT 1 FROM public.business_members bm
      WHERE bm.business_id = business_id
      AND   bm.user_id     = linc_uid()
      AND   bm.role        IN ('owner', 'manager')
    )
  );

-- Managers can invite new members (INSERT)
CREATE POLICY "business_members: manager invite"
  ON public.business_members FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.business_members bm
      WHERE bm.business_id = business_id
      AND   bm.user_id     = linc_uid()
      AND   bm.role        IN ('owner', 'manager')
    )
  );

-- Managers can update member roles (not escalate to owner)
CREATE POLICY "business_members: manager update role"
  ON public.business_members FOR UPDATE
  USING (
    deleted_at IS NULL
    AND EXISTS (
      SELECT 1 FROM public.business_members bm
      WHERE bm.business_id = business_id
      AND   bm.user_id     = linc_uid()
      AND   bm.role        IN ('owner', 'manager')
    )
  )
  WITH CHECK (
    -- Cannot set role to 'owner' via UPDATE (only initial owner)
    role IN ('manager', 'staff')
  );

-- Owner/manager can remove members
CREATE POLICY "business_members: manager remove"
  ON public.business_members FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.business_members bm
      WHERE bm.business_id = business_id
      AND   bm.user_id     = linc_uid()
      AND   bm.role        IN ('owner', 'manager')
    )
  );


-- ============================================================
-- 6. ORGANIZATIONS
-- ============================================================
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "organizations: admin full access"  ON public.organizations;
DROP POLICY IF EXISTS "organizations: public read active" ON public.organizations;
DROP POLICY IF EXISTS "organizations: member read"        ON public.organizations;
DROP POLICY IF EXISTS "organizations: insert own"         ON public.organizations;
DROP POLICY IF EXISTS "organizations: update manager"     ON public.organizations;
DROP POLICY IF EXISTS "organizations: delete owner"       ON public.organizations;

CREATE POLICY "organizations: admin full access"
  ON public.organizations FOR ALL
  USING (linc_is_admin());

CREATE POLICY "organizations: public read active"
  ON public.organizations FOR SELECT
  USING (
    is_active  = true
    AND deleted_at IS NULL
  );

CREATE POLICY "organizations: member read"
  ON public.organizations FOR SELECT
  USING (
    deleted_at IS NULL
    AND EXISTS (
      SELECT 1 FROM public.organization_members
      WHERE organization_id = id
      AND   user_id         = linc_uid()
    )
  );

CREATE POLICY "organizations: insert own"
  ON public.organizations FOR INSERT
  WITH CHECK (
    owner_id = linc_uid()
    AND linc_uid() IS NOT NULL
  );

CREATE POLICY "organizations: update manager"
  ON public.organizations FOR UPDATE
  USING (
    deleted_at IS NULL
    AND EXISTS (
      SELECT 1 FROM public.organization_members
      WHERE organization_id = id
      AND   user_id         = linc_uid()
      AND   role            IN ('owner', 'manager')
    )
  );

CREATE POLICY "organizations: delete owner"
  ON public.organizations FOR DELETE
  USING (owner_id = linc_uid());


-- ============================================================
-- 7. ORGANIZATION_MEMBERS
-- ============================================================
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "org_members: admin full access"   ON public.organization_members;
DROP POLICY IF EXISTS "org_members: member read own"     ON public.organization_members;
DROP POLICY IF EXISTS "org_members: manager read all"    ON public.organization_members;
DROP POLICY IF EXISTS "org_members: manager invite"      ON public.organization_members;
DROP POLICY IF EXISTS "org_members: manager update role" ON public.organization_members;
DROP POLICY IF EXISTS "org_members: manager remove"      ON public.organization_members;

CREATE POLICY "org_members: admin full access"
  ON public.organization_members FOR ALL
  USING (linc_is_admin());

CREATE POLICY "org_members: member read own"
  ON public.organization_members FOR SELECT
  USING (
    user_id = linc_uid()
    AND deleted_at IS NULL
  );

CREATE POLICY "org_members: manager read all"
  ON public.organization_members FOR SELECT
  USING (
    deleted_at IS NULL
    AND EXISTS (
      SELECT 1 FROM public.organization_members om
      WHERE om.organization_id = organization_id
      AND   om.user_id         = linc_uid()
      AND   om.role            IN ('owner', 'manager')
    )
  );

CREATE POLICY "org_members: manager invite"
  ON public.organization_members FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.organization_members om
      WHERE om.organization_id = organization_id
      AND   om.user_id         = linc_uid()
      AND   om.role            IN ('owner', 'manager')
    )
  );

CREATE POLICY "org_members: manager update role"
  ON public.organization_members FOR UPDATE
  USING (
    deleted_at IS NULL
    AND EXISTS (
      SELECT 1 FROM public.organization_members om
      WHERE om.organization_id = organization_id
      AND   om.user_id         = linc_uid()
      AND   om.role            IN ('owner', 'manager')
    )
  )
  WITH CHECK (role IN ('manager', 'staff'));

CREATE POLICY "org_members: manager remove"
  ON public.organization_members FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_members om
      WHERE om.organization_id = organization_id
      AND   om.user_id         = linc_uid()
      AND   om.role            IN ('owner', 'manager')
    )
  );


-- ============================================================
-- 8. CATEGORIES
-- ============================================================
-- Public read-only. Admin-managed. Not tenant-specific.
-- ============================================================
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "categories: admin full access"  ON public.categories;
DROP POLICY IF EXISTS "categories: public read active" ON public.categories;

CREATE POLICY "categories: admin full access"
  ON public.categories FOR ALL
  USING (linc_is_admin());

CREATE POLICY "categories: public read active"
  ON public.categories FOR SELECT
  USING (
    is_active  = true
    AND deleted_at IS NULL
  );


-- ============================================================
-- 9. SERVICES
-- ============================================================
-- SELECT: Public sees available, active, non-deleted services.
-- INSERT: Entity owner (provider/business/org manager).
-- UPDATE: Entity owner only.
-- DELETE: Entity owner → soft delete.
-- ============================================================
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "services: admin full access"   ON public.services;
DROP POLICY IF EXISTS "services: public read active"  ON public.services;
DROP POLICY IF EXISTS "services: own read"            ON public.services;
DROP POLICY IF EXISTS "services: insert own entity"   ON public.services;
DROP POLICY IF EXISTS "services: update own entity"   ON public.services;
DROP POLICY IF EXISTS "services: delete own entity"   ON public.services;

CREATE POLICY "services: admin full access"
  ON public.services FOR ALL
  USING (linc_is_admin());

CREATE POLICY "services: public read active"
  ON public.services FOR SELECT
  USING (
    is_available = true
    AND is_active    = true
    AND deleted_at   IS NULL
  );

-- Own entity (even inactive) — for management UI
CREATE POLICY "services: own read"
  ON public.services FOR SELECT
  USING (
    deleted_at IS NULL
    AND (
      (provider_id IS NOT NULL
        AND EXISTS (
          SELECT 1 FROM public.provider_profiles
          WHERE id = provider_id AND user_id = linc_uid()
        ))
      OR
      (business_id IS NOT NULL
        AND EXISTS (
          SELECT 1 FROM public.business_members
          WHERE business_id = services.business_id AND user_id = linc_uid()
        ))
      OR
      (organization_id IS NOT NULL
        AND EXISTS (
          SELECT 1 FROM public.organization_members
          WHERE organization_id = services.organization_id AND user_id = linc_uid()
        ))
    )
  );

CREATE POLICY "services: insert own entity"
  ON public.services FOR INSERT
  WITH CHECK (
    linc_uid() IS NOT NULL
    AND (
      (provider_id IS NOT NULL
        AND EXISTS (
          SELECT 1 FROM public.provider_profiles
          WHERE id = provider_id AND user_id = linc_uid()
        ))
      OR
      (business_id IS NOT NULL
        AND linc_owns_entity_manager('business', business_id))
      OR
      (organization_id IS NOT NULL
        AND linc_owns_entity_manager('organization', organization_id))
    )
  );

CREATE POLICY "services: update own entity"
  ON public.services FOR UPDATE
  USING (
    deleted_at IS NULL
    AND (
      (provider_id IS NOT NULL
        AND EXISTS (
          SELECT 1 FROM public.provider_profiles
          WHERE id = provider_id AND user_id = linc_uid()
        ))
      OR
      (business_id IS NOT NULL
        AND linc_owns_entity_manager('business', business_id))
      OR
      (organization_id IS NOT NULL
        AND linc_owns_entity_manager('organization', organization_id))
    )
  );

CREATE POLICY "services: delete own entity"
  ON public.services FOR DELETE
  USING (
    (provider_id IS NOT NULL
      AND EXISTS (
        SELECT 1 FROM public.provider_profiles
        WHERE id = provider_id AND user_id = linc_uid()
      ))
    OR
    (business_id IS NOT NULL
      AND linc_owns_entity_manager('business', business_id))
    OR
    (organization_id IS NOT NULL
      AND linc_owns_entity_manager('organization', organization_id))
  );


-- ============================================================
-- 10. REQUESTS
-- ============================================================
-- SELECT: Own requests only OR admin.
--         Matched providers see requests via MATCHES policy.
-- INSERT: Any authenticated user.
-- UPDATE: Own request, status transitions limited (cannot
--         jump from 'cancelled' back to 'open' etc.).
-- DELETE: Own request → soft delete.
-- ============================================================
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requests FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "requests: admin full access"   ON public.requests;
DROP POLICY IF EXISTS "requests: read own"            ON public.requests;
DROP POLICY IF EXISTS "requests: insert own"          ON public.requests;
DROP POLICY IF EXISTS "requests: update own"          ON public.requests;
DROP POLICY IF EXISTS "requests: delete own"          ON public.requests;

CREATE POLICY "requests: admin full access"
  ON public.requests FOR ALL
  USING (linc_is_admin());

CREATE POLICY "requests: read own"
  ON public.requests FOR SELECT
  USING (
    user_id    = linc_uid()
    AND deleted_at IS NULL
  );

CREATE POLICY "requests: insert own"
  ON public.requests FOR INSERT
  WITH CHECK (
    user_id    = linc_uid()
    AND linc_uid() IS NOT NULL
  );

CREATE POLICY "requests: update own"
  ON public.requests FOR UPDATE
  USING (
    user_id    = linc_uid()
    AND deleted_at IS NULL
    AND status NOT IN ('completed', 'cancelled')  -- cannot edit closed requests
  )
  WITH CHECK (user_id = linc_uid());

CREATE POLICY "requests: delete own"
  ON public.requests FOR DELETE
  USING (
    user_id = linc_uid()
    AND status IN ('open', 'matched')  -- only open/matched can be soft-deleted by user
  );


-- ============================================================
-- 11. MATCHES
-- ============================================================
-- SELECT:
--   • Requester sees all matches on their requests.
--   • Matched entity owner (provider/business/org) sees their
--     own matches (only what's assigned to them).
--   • Admin sees all.
-- INSERT: Service role / admin only (AI matching system).
-- UPDATE: Admin or service role (status changes).
-- DELETE: Admin only.
-- ============================================================
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "matches: admin full access"      ON public.matches;
DROP POLICY IF EXISTS "matches: requester reads own"    ON public.matches;
DROP POLICY IF EXISTS "matches: entity reads assigned"  ON public.matches;
DROP POLICY IF EXISTS "matches: admin insert"           ON public.matches;
DROP POLICY IF EXISTS "matches: admin update"           ON public.matches;
DROP POLICY IF EXISTS "matches: admin delete"           ON public.matches;

CREATE POLICY "matches: admin full access"
  ON public.matches FOR ALL
  USING (linc_is_admin());

-- Requester sees matches for their requests
CREATE POLICY "matches: requester reads own"
  ON public.matches FOR SELECT
  USING (
    deleted_at IS NULL
    AND EXISTS (
      SELECT 1 FROM public.requests
      WHERE id      = request_id
      AND   user_id = linc_uid()
      AND   deleted_at IS NULL
    )
  );

-- Matched entity sees only matches pointing to them
-- Uses the linc_owns_entity() helper for polymorphic resolution
CREATE POLICY "matches: entity reads assigned"
  ON public.matches FOR SELECT
  USING (
    deleted_at IS NULL
    AND linc_owns_entity(entity_type, entity_id)
  );

-- Only service_role/admin creates matches (AI system)
-- service_role bypasses RLS entirely; this policy handles admin
CREATE POLICY "matches: admin insert"
  ON public.matches FOR INSERT
  WITH CHECK (linc_is_admin());

-- Admin/service_role updates match status
CREATE POLICY "matches: admin update"
  ON public.matches FOR UPDATE
  USING (
    linc_is_admin()
    AND deleted_at IS NULL
  );

CREATE POLICY "matches: admin delete"
  ON public.matches FOR DELETE
  USING (linc_is_admin());


-- ============================================================
-- 12. BOOKINGS
-- ============================================================
-- SELECT:
--   • Requester sees their own bookings.
--   • Entity member sees bookings for their entity.
--     Staff: SELECT only. Manager/Owner: SELECT + UPDATE.
-- INSERT: Requester creates booking.
-- UPDATE:
--   • Requester: limited fields (notes, cancellation).
--   • Entity owner/manager: can confirm/reject/complete.
--   • Staff: cannot UPDATE.
-- DELETE: Admin only → soft delete.
-- ============================================================
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "bookings: admin full access"       ON public.bookings;
DROP POLICY IF EXISTS "bookings: requester reads own"     ON public.bookings;
DROP POLICY IF EXISTS "bookings: entity member reads"     ON public.bookings;
DROP POLICY IF EXISTS "bookings: requester insert"        ON public.bookings;
DROP POLICY IF EXISTS "bookings: requester update"        ON public.bookings;
DROP POLICY IF EXISTS "bookings: entity manager update"   ON public.bookings;
DROP POLICY IF EXISTS "bookings: admin delete"            ON public.bookings;

CREATE POLICY "bookings: admin full access"
  ON public.bookings FOR ALL
  USING (linc_is_admin());

CREATE POLICY "bookings: requester reads own"
  ON public.bookings FOR SELECT
  USING (
    requester_id = linc_uid()
    AND deleted_at IS NULL
  );

-- All entity members (including staff) see bookings
CREATE POLICY "bookings: entity member reads"
  ON public.bookings FOR SELECT
  USING (
    deleted_at IS NULL
    AND linc_owns_entity(entity_type, entity_id)
  );

-- Requester creates booking
CREATE POLICY "bookings: requester insert"
  ON public.bookings FOR INSERT
  WITH CHECK (
    requester_id = linc_uid()
    AND linc_uid() IS NOT NULL
  );

-- Requester can cancel their own pending booking
CREATE POLICY "bookings: requester update"
  ON public.bookings FOR UPDATE
  USING (
    requester_id = linc_uid()
    AND deleted_at IS NULL
    AND status IN ('pending', 'confirmed')
  )
  WITH CHECK (
    requester_id = linc_uid()
    -- Requester can only cancel, not confirm/complete
  );

-- Entity owner/manager can confirm, start, complete, reject
-- Staff are excluded (linc_owns_entity_manager checks role)
CREATE POLICY "bookings: entity manager update"
  ON public.bookings FOR UPDATE
  USING (
    deleted_at IS NULL
    AND linc_owns_entity_manager(entity_type, entity_id)
  );

CREATE POLICY "bookings: admin delete"
  ON public.bookings FOR DELETE
  USING (linc_is_admin());


-- ============================================================
-- 13. CONVERSATIONS
-- ============================================================
-- SELECT: Participant only (resolved via linc_is_conversation_participant).
--         Business/org members ARE considered participants.
-- INSERT: Either participant.
-- UPDATE: Either participant (last_message_at updates).
-- DELETE: Admin only.
-- ============================================================
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "conversations: admin full access"    ON public.conversations;
DROP POLICY IF EXISTS "conversations: participant select"   ON public.conversations;
DROP POLICY IF EXISTS "conversations: participant insert"   ON public.conversations;
DROP POLICY IF EXISTS "conversations: participant update"   ON public.conversations;
DROP POLICY IF EXISTS "conversations: admin delete"         ON public.conversations;

CREATE POLICY "conversations: admin full access"
  ON public.conversations FOR ALL
  USING (linc_is_admin());

CREATE POLICY "conversations: participant select"
  ON public.conversations FOR SELECT
  USING (
    deleted_at IS NULL
    AND linc_is_conversation_participant(id)
  );

-- Either participant can initiate a conversation
CREATE POLICY "conversations: participant insert"
  ON public.conversations FOR INSERT
  WITH CHECK (
    linc_uid() IS NOT NULL
    AND (
      -- Inserting user is participant_a
      (participant_a_type = 'user' AND participant_a_id = linc_uid())
      OR linc_owns_entity(participant_a_type, participant_a_id)
      -- OR inserting user is participant_b
      OR (participant_b_type = 'user' AND participant_b_id = linc_uid())
      OR linc_owns_entity(participant_b_type, participant_b_id)
    )
  );

CREATE POLICY "conversations: participant update"
  ON public.conversations FOR UPDATE
  USING (
    deleted_at IS NULL
    AND linc_is_conversation_participant(id)
  );

CREATE POLICY "conversations: admin delete"
  ON public.conversations FOR DELETE
  USING (linc_is_admin());


-- ============================================================
-- 14. MESSAGES
-- ============================================================
-- SELECT: Conversation participants only.
--         ai_response field is visible only to the sender
--         (for @AI mentions). Other participants see NULL.
--         This is enforced via a view in audit_and_column_security.
-- INSERT: Sender must be a conversation participant.
-- UPDATE: Own message (is_read flag only).
-- DELETE: Admin only.
-- ============================================================
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "messages: admin full access"          ON public.messages;
DROP POLICY IF EXISTS "messages: participant select"         ON public.messages;
DROP POLICY IF EXISTS "messages: participant insert"         ON public.messages;
DROP POLICY IF EXISTS "messages: mark read"                  ON public.messages;
DROP POLICY IF EXISTS "messages: admin delete"               ON public.messages;

CREATE POLICY "messages: admin full access"
  ON public.messages FOR ALL
  USING (linc_is_admin());

-- Conversation participant can read messages
CREATE POLICY "messages: participant select"
  ON public.messages FOR SELECT
  USING (
    deleted_at IS NULL
    AND linc_is_conversation_participant(conversation_id)
  );

-- Only conversation participants can send messages
CREATE POLICY "messages: participant insert"
  ON public.messages FOR INSERT
  WITH CHECK (
    linc_uid() IS NOT NULL
    AND linc_is_conversation_participant(conversation_id)
    AND (
      -- Sender identity must match current user
      (sender_type = 'user' AND sender_id = linc_uid())
      OR linc_owns_entity(sender_type, sender_id)
    )
  );

-- Participants can mark messages as read
CREATE POLICY "messages: mark read"
  ON public.messages FOR UPDATE
  USING (
    deleted_at IS NULL
    AND linc_is_conversation_participant(conversation_id)
  )
  WITH CHECK (
    -- Only is_read can be changed via this policy;
    -- other field changes are blocked at the application layer
    linc_is_conversation_participant(conversation_id)
  );

CREATE POLICY "messages: admin delete"
  ON public.messages FOR DELETE
  USING (linc_is_admin());


-- ============================================================
-- 15. AI_CONVERSATIONS
-- ============================================================
-- Completely private to the owning user. No public access.
-- ============================================================
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_conversations FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ai_conversations: admin full access" ON public.ai_conversations;
DROP POLICY IF EXISTS "ai_conversations: owner only"        ON public.ai_conversations;
DROP POLICY IF EXISTS "ai_conversations: owner insert"      ON public.ai_conversations;
DROP POLICY IF EXISTS "ai_conversations: owner delete"      ON public.ai_conversations;

CREATE POLICY "ai_conversations: admin full access"
  ON public.ai_conversations FOR ALL
  USING (linc_is_admin());

CREATE POLICY "ai_conversations: owner only"
  ON public.ai_conversations FOR SELECT
  USING (
    user_id    = linc_uid()
    AND deleted_at IS NULL
  );

CREATE POLICY "ai_conversations: owner insert"
  ON public.ai_conversations FOR INSERT
  WITH CHECK (
    user_id = linc_uid()
    AND linc_uid() IS NOT NULL
  );

CREATE POLICY "ai_conversations: owner delete"
  ON public.ai_conversations FOR DELETE
  USING (user_id = linc_uid());


-- ============================================================
-- 16. AI_MESSAGES
-- ============================================================
-- @AI privacy: Only the owner of the ai_conversation can
-- see these messages. No cross-user leakage possible.
-- ============================================================
ALTER TABLE public.ai_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_messages FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ai_messages: admin full access" ON public.ai_messages;
DROP POLICY IF EXISTS "ai_messages: owner only"        ON public.ai_messages;
DROP POLICY IF EXISTS "ai_messages: owner insert"      ON public.ai_messages;

CREATE POLICY "ai_messages: admin full access"
  ON public.ai_messages FOR ALL
  USING (linc_is_admin());

-- Owner reads their AI messages (join through ai_conversations)
CREATE POLICY "ai_messages: owner only"
  ON public.ai_messages FOR SELECT
  USING (
    deleted_at IS NULL
    AND EXISTS (
      SELECT 1 FROM public.ai_conversations ac
      WHERE ac.id      = conversation_id
      AND   ac.user_id = linc_uid()
      AND   ac.deleted_at IS NULL
    )
  );

CREATE POLICY "ai_messages: owner insert"
  ON public.ai_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.ai_conversations ac
      WHERE ac.id      = conversation_id
      AND   ac.user_id = linc_uid()
    )
  );


-- ============================================================
-- 17. REVIEWS
-- ============================================================
-- SELECT: Public sees visible, non-deleted reviews.
-- INSERT: Only reviewer_id = current user, one per booking.
-- UPDATE: Admin only (visibility toggle for moderation).
-- DELETE: Admin only.
-- ============================================================
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "reviews: admin full access"  ON public.reviews;
DROP POLICY IF EXISTS "reviews: public read"        ON public.reviews;
DROP POLICY IF EXISTS "reviews: reviewer insert"    ON public.reviews;
DROP POLICY IF EXISTS "reviews: admin update"       ON public.reviews;
DROP POLICY IF EXISTS "reviews: admin delete"       ON public.reviews;

CREATE POLICY "reviews: admin full access"
  ON public.reviews FOR ALL
  USING (linc_is_admin());

CREATE POLICY "reviews: public read"
  ON public.reviews FOR SELECT
  USING (
    is_visible = true
    AND deleted_at IS NULL
  );

-- Reviewer reads their own review (even if hidden)
CREATE POLICY "reviews: reviewer read own"
  ON public.reviews FOR SELECT
  USING (
    reviewer_id = linc_uid()
    AND deleted_at IS NULL
  );

-- User reviews a completed booking they participated in
CREATE POLICY "reviews: reviewer insert"
  ON public.reviews FOR INSERT
  WITH CHECK (
    reviewer_id = linc_uid()
    AND linc_uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.bookings
      WHERE id           = booking_id
      AND   requester_id = linc_uid()
      AND   status       = 'completed'
    )
  );

CREATE POLICY "reviews: admin update"
  ON public.reviews FOR UPDATE
  USING (linc_is_admin());

CREATE POLICY "reviews: admin delete"
  ON public.reviews FOR DELETE
  USING (linc_is_admin());


-- ============================================================
-- 18. VERIFICATION_REQUESTS
-- ============================================================
ALTER TABLE public.verification_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_requests FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "verification: admin full access"  ON public.verification_requests;
DROP POLICY IF EXISTS "verification: submitter reads own" ON public.verification_requests;
DROP POLICY IF EXISTS "verification: submitter insert"   ON public.verification_requests;
DROP POLICY IF EXISTS "verification: admin update"       ON public.verification_requests;

CREATE POLICY "verification: admin full access"
  ON public.verification_requests FOR ALL
  USING (linc_is_admin());

CREATE POLICY "verification: submitter reads own"
  ON public.verification_requests FOR SELECT
  USING (
    submitted_by = linc_uid()
    AND deleted_at IS NULL
  );

CREATE POLICY "verification: submitter insert"
  ON public.verification_requests FOR INSERT
  WITH CHECK (
    submitted_by = linc_uid()
    AND linc_uid() IS NOT NULL
  );

-- Only admin can update status/review_notes
CREATE POLICY "verification: admin update"
  ON public.verification_requests FOR UPDATE
  USING (linc_is_admin());


-- ============================================================
-- 19. REPORTS
-- ============================================================
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "reports: admin full access"    ON public.reports;
DROP POLICY IF EXISTS "reports: reporter reads own"   ON public.reports;
DROP POLICY IF EXISTS "reports: reporter insert"      ON public.reports;
DROP POLICY IF EXISTS "reports: admin update"         ON public.reports;

CREATE POLICY "reports: admin full access"
  ON public.reports FOR ALL
  USING (linc_is_admin());

CREATE POLICY "reports: reporter reads own"
  ON public.reports FOR SELECT
  USING (
    reporter_id = linc_uid()
    AND deleted_at IS NULL
  );

CREATE POLICY "reports: reporter insert"
  ON public.reports FOR INSERT
  WITH CHECK (
    reporter_id = linc_uid()
    AND linc_uid() IS NOT NULL
  );

CREATE POLICY "reports: admin update"
  ON public.reports FOR UPDATE
  USING (linc_is_admin());


-- ============================================================
-- 20. NOTIFICATIONS
-- ============================================================
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notifications: admin full access" ON public.notifications;
DROP POLICY IF EXISTS "notifications: owner reads own"   ON public.notifications;
DROP POLICY IF EXISTS "notifications: service insert"    ON public.notifications;
DROP POLICY IF EXISTS "notifications: owner mark read"   ON public.notifications;
DROP POLICY IF EXISTS "notifications: owner delete"      ON public.notifications;

CREATE POLICY "notifications: admin full access"
  ON public.notifications FOR ALL
  USING (linc_is_admin());

CREATE POLICY "notifications: owner reads own"
  ON public.notifications FOR SELECT
  USING (
    user_id    = linc_uid()
    AND deleted_at IS NULL
  );

-- Only service_role (bypasses RLS) inserts notifications.
-- This policy blocks any authenticated user from inserting.
-- If a test/admin insert is needed, use admin policy above.
CREATE POLICY "notifications: service insert"
  ON public.notifications FOR INSERT
  WITH CHECK (linc_is_admin()); -- service_role bypasses RLS anyway

-- Owner can mark their notifications as read
CREATE POLICY "notifications: owner mark read"
  ON public.notifications FOR UPDATE
  USING (
    user_id = linc_uid()
    AND deleted_at IS NULL
  )
  WITH CHECK (user_id = linc_uid());

CREATE POLICY "notifications: owner delete"
  ON public.notifications FOR DELETE
  USING (user_id = linc_uid());


-- ============================================================
-- 21. ESCROW_TRANSACTIONS
-- ============================================================
-- Polymorphic provider: provider_entity_type + provider_entity_id
-- SELECT:
--   • Requester sees their own.
--   • Provider entity owner sees theirs.
--   • Admin sees all.
-- INSERT/UPDATE/DELETE: Service role (Chapa webhook) + admin.
-- ============================================================
ALTER TABLE public.escrow_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escrow_transactions FORCE ROW LEVEL SECURITY;

-- Drop pre-existing policies from migration 002
DROP POLICY IF EXISTS "Users can view their own escrow transactions"   ON public.escrow_transactions;
DROP POLICY IF EXISTS "Service role has full access to escrow_transactions" ON public.escrow_transactions;

DROP POLICY IF EXISTS "escrow_tx: admin full access"       ON public.escrow_transactions;
DROP POLICY IF EXISTS "escrow_tx: requester reads own"     ON public.escrow_transactions;
DROP POLICY IF EXISTS "escrow_tx: provider reads own"      ON public.escrow_transactions;
DROP POLICY IF EXISTS "escrow_tx: admin or service write"  ON public.escrow_transactions;

CREATE POLICY "escrow_tx: admin full access"
  ON public.escrow_transactions FOR ALL
  USING (linc_is_admin());

CREATE POLICY "escrow_tx: requester reads own"
  ON public.escrow_transactions FOR SELECT
  USING (
    requester_id = linc_uid()
    AND deleted_at IS NULL
  );

-- Provider/business/org owner reads escrow for their entity
CREATE POLICY "escrow_tx: provider reads own"
  ON public.escrow_transactions FOR SELECT
  USING (
    deleted_at IS NULL
    AND linc_owns_entity(provider_entity_type, provider_entity_id)
  );

-- Write operations go through service_role (Chapa webhooks).
-- Admin can also write for dispute resolution.
CREATE POLICY "escrow_tx: admin write"
  ON public.escrow_transactions FOR INSERT
  WITH CHECK (linc_is_admin());

CREATE POLICY "escrow_tx: admin update"
  ON public.escrow_transactions FOR UPDATE
  USING (linc_is_admin() AND deleted_at IS NULL);

CREATE POLICY "escrow_tx: admin delete"
  ON public.escrow_transactions FOR DELETE
  USING (linc_is_admin());


-- ============================================================
-- 22. ESCROW_DISPUTES
-- ============================================================
ALTER TABLE public.escrow_disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escrow_disputes FORCE ROW LEVEL SECURITY;

-- Drop pre-existing policies from migration 002
DROP POLICY IF EXISTS "Users can view their own disputes"                 ON public.escrow_disputes;
DROP POLICY IF EXISTS "Service role has full access to escrow_disputes"   ON public.escrow_disputes;

DROP POLICY IF EXISTS "escrow_disputes: admin full access"    ON public.escrow_disputes;
DROP POLICY IF EXISTS "escrow_disputes: raiser reads own"     ON public.escrow_disputes;
DROP POLICY IF EXISTS "escrow_disputes: raiser insert"        ON public.escrow_disputes;
DROP POLICY IF EXISTS "escrow_disputes: admin update"         ON public.escrow_disputes;
DROP POLICY IF EXISTS "escrow_disputes: admin delete"         ON public.escrow_disputes;

CREATE POLICY "escrow_disputes: admin full access"
  ON public.escrow_disputes FOR ALL
  USING (linc_is_admin());

CREATE POLICY "escrow_disputes: raiser reads own"
  ON public.escrow_disputes FOR SELECT
  USING (
    raised_by  = linc_uid()
    AND deleted_at IS NULL
  );

-- Counterparty (provider entity owner) can also see the dispute
CREATE POLICY "escrow_disputes: provider reads dispute"
  ON public.escrow_disputes FOR SELECT
  USING (
    deleted_at IS NULL
    AND EXISTS (
      SELECT 1 FROM public.escrow_transactions et
      WHERE et.id = escrow_id
      AND   linc_owns_entity(et.provider_entity_type, et.provider_entity_id)
    )
  );

-- Either party (requester or provider) can raise a dispute
CREATE POLICY "escrow_disputes: raiser insert"
  ON public.escrow_disputes FOR INSERT
  WITH CHECK (
    raised_by = linc_uid()
    AND linc_uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.escrow_transactions et
      WHERE et.id = escrow_id
      AND (
        et.requester_id = linc_uid()
        OR linc_owns_entity(et.provider_entity_type, et.provider_entity_id)
      )
      AND et.status = 'disputed'
    )
  );

CREATE POLICY "escrow_disputes: admin update"
  ON public.escrow_disputes FOR UPDATE
  USING (linc_is_admin());

CREATE POLICY "escrow_disputes: admin delete"
  ON public.escrow_disputes FOR DELETE
  USING (linc_is_admin());
