-- Quote intake + admin dashboard schema (Railway Postgres)
-- Run once: psql "$DATABASE_URL" -f db/schema.sql

CREATE TABLE IF NOT EXISTS admin_users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS admin_sessions (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  token      TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT now() + interval '7 days'
);
CREATE INDEX IF NOT EXISTS admin_sessions_token_idx ON admin_sessions(token);

CREATE TABLE IF NOT EXISTS quote_requests (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status          TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','declined')),
  name            TEXT NOT NULL,
  email           TEXT,
  phone           TEXT,
  national_id     TEXT,
  insurance_type  TEXT,
  vehicle_make    TEXT,
  vehicle_model   TEXT,
  model_year      INTEGER,
  declared_value  NUMERIC,
  insurer_company TEXT,
  insurer_offer_sar NUMERIC,
  payload         JSONB,
  review_note     TEXT,
  reviewed_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS quote_requests_status_idx ON quote_requests(status);
CREATE INDEX IF NOT EXISTS quote_requests_created_idx ON quote_requests(created_at DESC);

CREATE TABLE IF NOT EXISTS quote_activity (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_request_id UUID NOT NULL REFERENCES quote_requests(id) ON DELETE CASCADE,
  actor            TEXT NOT NULL DEFAULT 'admin',
  action           TEXT NOT NULL,
  note             TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS quote_activity_request_idx ON quote_activity(quote_request_id);

CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_quote_requests_updated ON quote_requests;
CREATE TRIGGER trg_quote_requests_updated
  BEFORE UPDATE ON quote_requests
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
