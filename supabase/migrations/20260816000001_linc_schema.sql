-- ============================================================
-- LINC Platform — Database Migration
-- All 20 tables for the LINC platform
-- Run this in Supabase SQL Editor or as a migration file
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 1. IDENTITY
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email             varchar(255) UNIQUE NOT NULL,
  password_hash     varchar(255) NOT NULL,
  full_name         varchar(100) NOT NULL,
  username          varchar(50)  UNIQUE NOT NULL,
  avatar_url        varchar(500),
  bio               text,
  phone             varchar(20),
  location_city     varchar(100),
  location_lat      decimal(10,7),
  location_lng      decimal(10,7),
  is_admin          boolean DEFAULT false,
  is_active         boolean DEFAULT true,
  email_verified    boolean DEFAULT false,
  created_at        timestamptz DEFAULT now(),
  updated_at        timestamptz DEFAULT now()
);

-- ============================================================
-- 2. ENTITIES
-- ============================================================

CREATE TABLE IF NOT EXISTS provider_profiles (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  headline            varchar(150) NOT NULL,
  bio                 text,
  hourly_rate         decimal(10,2),
  currency            varchar(10) DEFAULT 'ETB',
  location_city       varchar(100),
  location_lat        decimal(10,7),
  location_lng        decimal(10,7),
  availability_status varchar(20) DEFAULT 'available' CHECK (availability_status IN ('available','busy','away')),
  is_verified         boolean DEFAULT false,
  avg_rating          decimal(3,2) DEFAULT 0.00,
  total_reviews       int DEFAULT 0,
  completed_jobs      int DEFAULT 0,
  is_active           boolean DEFAULT true,
  created_at          timestamptz DEFAULT now(),
  updated_at          timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS provider_categories (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL REFERENCES provider_profiles(id) ON DELETE CASCADE,
  category_id uuid NOT NULL,  -- FK added after categories table is created
  UNIQUE(provider_id, category_id)
);

CREATE TABLE IF NOT EXISTS businesses (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id         uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  name             varchar(150) NOT NULL,
  description      text,
  logo_url         varchar(500),
  cover_url        varchar(500),
  email            varchar(255),
  phone            varchar(20),
  website          varchar(255),
  location_city    varchar(100),
  location_address varchar(255),
  location_lat     decimal(10,7),
  location_lng     decimal(10,7),
  business_type    varchar(50),
  is_verified      boolean DEFAULT false,
  avg_rating       decimal(3,2) DEFAULT 0.00,
  total_reviews    int DEFAULT 0,
  is_active        boolean DEFAULT true,
  created_at       timestamptz DEFAULT now(),
  updated_at       timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS business_members (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  user_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role        varchar(20) NOT NULL CHECK (role IN ('owner','manager','staff')),
  joined_at   timestamptz DEFAULT now(),
  UNIQUE(business_id, user_id)
);

CREATE TABLE IF NOT EXISTS organizations (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id      uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  name          varchar(150) NOT NULL,
  description   text,
  logo_url      varchar(500),
  cover_url     varchar(500),
  email         varchar(255),
  phone         varchar(20),
  website       varchar(255),
  location_city varchar(100),
  location_lat  decimal(10,7),
  location_lng  decimal(10,7),
  org_type      varchar(50),
  is_verified   boolean DEFAULT false,
  avg_rating    decimal(3,2) DEFAULT 0.00,
  total_reviews int DEFAULT 0,
  is_active     boolean DEFAULT true,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS organization_members (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id         uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role            varchar(20) NOT NULL CHECK (role IN ('owner','manager','staff')),
  joined_at       timestamptz DEFAULT now(),
  UNIQUE(organization_id, user_id)
);

-- ============================================================
-- 3. SERVICES
-- ============================================================

CREATE TABLE IF NOT EXISTS categories (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        varchar(100) NOT NULL,
  slug        varchar(100) UNIQUE NOT NULL,
  description text,
  icon        varchar(100),
  parent_id   uuid REFERENCES categories(id) ON DELETE SET NULL,
  is_active   boolean DEFAULT true,
  created_at  timestamptz DEFAULT now()
);

-- Add FK from provider_categories to categories now that categories exists
ALTER TABLE provider_categories
  ADD CONSTRAINT fk_provider_categories_category
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE;

CREATE TABLE IF NOT EXISTS services (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id     uuid REFERENCES provider_profiles(id) ON DELETE CASCADE,
  business_id     uuid REFERENCES businesses(id) ON DELETE CASCADE,
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  category_id     uuid NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  title           varchar(150) NOT NULL,
  description     text,
  price_type      varchar(20) NOT NULL CHECK (price_type IN ('fixed','hourly','negotiable','free')),
  price_amount    decimal(10,2),
  currency        varchar(10) DEFAULT 'ETB',
  location_city   varchar(100),
  location_lat    decimal(10,7),
  location_lng    decimal(10,7),
  tags            text[],
  is_available    boolean DEFAULT true,
  is_active       boolean DEFAULT true,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now(),
  -- Exactly one owner must be set
  CONSTRAINT exactly_one_owner CHECK (
    (CASE WHEN provider_id     IS NOT NULL THEN 1 ELSE 0 END +
     CASE WHEN business_id     IS NOT NULL THEN 1 ELSE 0 END +
     CASE WHEN organization_id IS NOT NULL THEN 1 ELSE 0 END) = 1
  )
);

-- ============================================================
-- 4. REQUESTS & MATCHING
-- ============================================================

CREATE TABLE IF NOT EXISTS requests (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id          uuid REFERENCES categories(id) ON DELETE SET NULL,
  title                varchar(150) NOT NULL,
  description          text NOT NULL,
  ai_extracted_intent  jsonb,
  budget_min           decimal(10,2),
  budget_max           decimal(10,2),
  currency             varchar(10) DEFAULT 'ETB',
  location_city        varchar(100),
  location_lat         decimal(10,7),
  location_lng         decimal(10,7),
  urgency              varchar(20) DEFAULT 'medium' CHECK (urgency IN ('low','medium','high','urgent')),
  status               varchar(20) DEFAULT 'open' CHECK (status IN ('open','matched','in_progress','completed','cancelled')),
  expires_at           timestamptz,
  created_at           timestamptz DEFAULT now(),
  updated_at           timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS matches (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id     uuid NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
  entity_type    varchar(20) NOT NULL CHECK (entity_type IN ('provider','business','organization')),
  entity_id      uuid NOT NULL,
  match_score    decimal(5,4) NOT NULL,
  score_breakdown jsonb,
  status         varchar(20) DEFAULT 'pending' CHECK (status IN ('pending','viewed','contacted','rejected')),
  created_at     timestamptz DEFAULT now()
);

-- ============================================================
-- 5. BOOKING
-- ============================================================

CREATE TABLE IF NOT EXISTS bookings (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id        uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  service_id          uuid NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
  entity_type         varchar(20) NOT NULL CHECK (entity_type IN ('provider','business','organization')),
  entity_id           uuid NOT NULL,
  scheduled_at        timestamptz,
  duration_hours      decimal(4,2),
  agreed_price        decimal(10,2),
  currency            varchar(10) DEFAULT 'ETB',
  notes               text,
  status              varchar(20) DEFAULT 'pending' CHECK (status IN ('pending','confirmed','in_progress','completed','cancelled','rejected')),
  cancelled_by        uuid REFERENCES users(id) ON DELETE SET NULL,
  cancellation_reason text,
  created_at          timestamptz DEFAULT now(),
  updated_at          timestamptz DEFAULT now()
);

-- ============================================================
-- 6. MESSAGING
-- ============================================================

CREATE TABLE IF NOT EXISTS conversations (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_a_type   varchar(20) NOT NULL CHECK (participant_a_type IN ('user','provider','business','organization')),
  participant_a_id     uuid NOT NULL,
  participant_b_type   varchar(20) NOT NULL CHECK (participant_b_type IN ('user','provider','business','organization')),
  participant_b_id     uuid NOT NULL,
  booking_id           uuid REFERENCES bookings(id) ON DELETE SET NULL,
  last_message_at      timestamptz,
  created_at           timestamptz DEFAULT now(),
  UNIQUE(participant_a_type, participant_a_id, participant_b_type, participant_b_id)
);

CREATE TABLE IF NOT EXISTS messages (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_type     varchar(20) NOT NULL CHECK (sender_type IN ('user','provider','business','organization')),
  sender_id       uuid NOT NULL,
  content         text NOT NULL,
  has_ai_mention  boolean DEFAULT false,
  ai_response     text,
  is_read         boolean DEFAULT false,
  created_at      timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ai_conversations (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title      varchar(150),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ai_messages (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id   uuid NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
  role              varchar(10) NOT NULL CHECK (role IN ('user','assistant')),
  content           text NOT NULL,
  retrieved_context jsonb,
  created_at        timestamptz DEFAULT now()
);

-- ============================================================
-- 7. TRUST
-- ============================================================

CREATE TABLE IF NOT EXISTS reviews (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id  uuid UNIQUE NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  reviewer_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  entity_type varchar(20) NOT NULL CHECK (entity_type IN ('provider','business','organization')),
  entity_id   uuid NOT NULL,
  rating      int NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment     text,
  is_visible  boolean DEFAULT true,
  created_at  timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS verification_requests (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type  varchar(20) NOT NULL CHECK (entity_type IN ('provider','business','organization')),
  entity_id    uuid NOT NULL,
  submitted_by uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  documents    jsonb NOT NULL,
  status       varchar(20) DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  reviewed_by  uuid REFERENCES users(id) ON DELETE SET NULL,
  review_notes text,
  created_at   timestamptz DEFAULT now(),
  reviewed_at  timestamptz
);

CREATE TABLE IF NOT EXISTS reports (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  entity_type varchar(20) NOT NULL CHECK (entity_type IN ('user','provider','business','organization','review','message')),
  entity_id   uuid NOT NULL,
  reason      varchar(100) NOT NULL,
  description text,
  status      varchar(20) DEFAULT 'pending' CHECK (status IN ('pending','reviewed','resolved','dismissed')),
  reviewed_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at  timestamptz DEFAULT now(),
  reviewed_at timestamptz
);

-- ============================================================
-- 8. ADMINISTRATION
-- ============================================================

CREATE TABLE IF NOT EXISTS notifications (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type       varchar(50) NOT NULL,
  title      varchar(150) NOT NULL,
  body       text NOT NULL,
  data       jsonb,
  is_read    boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- INDEXES for performance
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_provider_profiles_user_id   ON provider_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_provider_profiles_location   ON provider_profiles(location_city);
CREATE INDEX IF NOT EXISTS idx_services_category_id         ON services(category_id);
CREATE INDEX IF NOT EXISTS idx_services_provider_id         ON services(provider_id);
CREATE INDEX IF NOT EXISTS idx_services_business_id         ON services(business_id);
CREATE INDEX IF NOT EXISTS idx_requests_user_id             ON requests(user_id);
CREATE INDEX IF NOT EXISTS idx_requests_status              ON requests(status);
CREATE INDEX IF NOT EXISTS idx_matches_request_id           ON matches(request_id);
CREATE INDEX IF NOT EXISTS idx_bookings_requester_id        ON bookings(requester_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status              ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id     ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_ai_messages_conversation_id  ON ai_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_reviews_entity               ON reviews(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id        ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read        ON notifications(is_read);

-- ============================================================
-- TRIGGER: auto-update updated_at columns
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER trg_provider_profiles_updated_at
  BEFORE UPDATE ON provider_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER trg_businesses_updated_at
  BEFORE UPDATE ON businesses FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER trg_organizations_updated_at
  BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER trg_services_updated_at
  BEFORE UPDATE ON services FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER trg_requests_updated_at
  BEFORE UPDATE ON requests FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER trg_bookings_updated_at
  BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER trg_ai_conversations_updated_at
  BEFORE UPDATE ON ai_conversations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
