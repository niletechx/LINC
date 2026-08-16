-- ============================================================
-- LINC Database Schema Migration: Escrow Payments & Disputes
-- Migration: 20260816000002_escrow_payments.sql
-- ============================================================

-- 1. ESCROW TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS escrow_transactions (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id            UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  requester_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider_entity_type  TEXT NOT NULL CHECK (provider_entity_type IN ('provider', 'business', 'organization')),
  provider_entity_id    UUID NOT NULL,
  amount                NUMERIC(12, 2) NOT NULL,
  platform_fee          NUMERIC(12, 2) NOT NULL,
  provider_amount       NUMERIC(12, 2) NOT NULL,
  currency              TEXT NOT NULL DEFAULT 'ETB',
  status                TEXT NOT NULL DEFAULT 'awaiting_payment'
                        CHECK (status IN (
                          'pending_payment',
                          'awaiting_payment',
                          'funds_held',
                          'pending_confirmation',
                          'released',
                          'refunded',
                          'disputed',
                          'cancelled'
                        )),
  chapa_tx_ref          TEXT UNIQUE NOT NULL,
  chapa_checkout_url    TEXT,
  chapa_reference       TEXT,
  auto_release_at       TIMESTAMPTZ,
  released_at           TIMESTAMPTZ,
  refunded_at           TIMESTAMPTZ,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. ESCROW DISPUTES TABLE
CREATE TABLE IF NOT EXISTS escrow_disputes (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  escrow_id     UUID NOT NULL REFERENCES escrow_transactions(id) ON DELETE CASCADE,
  raised_by     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason        TEXT NOT NULL,
  evidence_urls TEXT[] NOT NULL DEFAULT '{}',
  status        TEXT NOT NULL DEFAULT 'open'
                CHECK (status IN ('open', 'admin_reviewing', 'resolved_refund', 'resolved_release')),
  admin_note    TEXT,
  resolved_by   UUID REFERENCES users(id),
  resolved_at   TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_escrow_booking_id       ON escrow_transactions(booking_id);
CREATE INDEX IF NOT EXISTS idx_escrow_requester_id     ON escrow_transactions(requester_id);
CREATE INDEX IF NOT EXISTS idx_escrow_provider_entity  ON escrow_transactions(provider_entity_type, provider_entity_id);
CREATE INDEX IF NOT EXISTS idx_escrow_status           ON escrow_transactions(status);
CREATE INDEX IF NOT EXISTS idx_escrow_tx_ref           ON escrow_transactions(chapa_tx_ref);
CREATE INDEX IF NOT EXISTS idx_escrow_auto_release     ON escrow_transactions(status, auto_release_at);
CREATE INDEX IF NOT EXISTS idx_disputes_escrow_id      ON escrow_disputes(escrow_id);
CREATE INDEX IF NOT EXISTS idx_disputes_raised_by      ON escrow_disputes(raised_by);
CREATE INDEX IF NOT EXISTS idx_disputes_status         ON escrow_disputes(status);

-- 4. TRIGGER: auto-update updated_at on escrow_transactions
CREATE OR REPLACE TRIGGER trg_escrow_transactions_updated_at
  BEFORE UPDATE ON escrow_transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 5. ROW LEVEL SECURITY (RLS)
ALTER TABLE escrow_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE escrow_disputes ENABLE ROW LEVEL SECURITY;

-- Escrow policies
CREATE POLICY "Users can view their own escrow transactions"
  ON escrow_transactions FOR SELECT
  USING (auth.uid() = requester_id);

CREATE POLICY "Service role has full access to escrow_transactions"
  ON escrow_transactions FOR ALL
  USING (auth.role() = 'service_role');

-- Dispute policies
CREATE POLICY "Users can view their own disputes"
  ON escrow_disputes FOR SELECT
  USING (auth.uid() = raised_by);

CREATE POLICY "Service role has full access to escrow_disputes"
  ON escrow_disputes FOR ALL
  USING (auth.role() = 'service_role');
