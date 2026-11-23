-- Idempotent schema for What It Really Cost.
-- Safe to run more than once: CREATE TABLE IF NOT EXISTS throughout.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS builds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  tool text NOT NULL,
  app_type text NOT NULL,
  title text NOT NULL,
  description text,
  credits numeric,
  tokens bigint,
  dollars numeric,
  prompts integer,
  days numeric,
  shipped boolean,
  source_url text NOT NULL,
  author_name text,
  submission_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tool text NOT NULL,
  app_type text NOT NULL,
  title text NOT NULL,
  description text,
  credits numeric,
  tokens bigint,
  dollars numeric,
  prompts integer,
  days numeric,
  shipped boolean,
  source_url text NOT NULL,
  author_name text,
  email text,
  status text NOT NULL DEFAULT 'pending',
  build_id uuid,
  ip_hash text,
  created_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz,
  CONSTRAINT submissions_status_check CHECK (status IN ('pending', 'approved', 'rejected'))
);

CREATE TABLE IF NOT EXISTS signups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  source text,
  resend_contact_id text,
  synced boolean NOT NULL DEFAULT false,
  ip_hash text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS zero_result_searches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  query text NOT NULL,
  filters jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pageviews (
  id bigserial PRIMARY KEY,
  path text NOT NULL,
  day date NOT NULL,
  count integer NOT NULL DEFAULT 0,
  UNIQUE (path, day)
);

CREATE TABLE IF NOT EXISTS sponsor_weeks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  tagline text,
  url text NOT NULL,
  starts_on date NOT NULL,
  ends_on date NOT NULL,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sponsor_clicks (
  id bigserial PRIMARY KEY,
  sponsor_slug text NOT NULL,
  path text,
  referrer text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sponsor_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text,
  email text NOT NULL,
  company text,
  message text,
  notified boolean NOT NULL DEFAULT false,
  ip_hash text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS errors (
  id bigserial PRIMARY KEY,
  message text NOT NULL,
  stack text,
  path text,
  context jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS builds_tool_idx ON builds (tool);
CREATE INDEX IF NOT EXISTS builds_app_type_idx ON builds (app_type);
CREATE INDEX IF NOT EXISTS builds_dollars_idx ON builds (dollars);
CREATE INDEX IF NOT EXISTS submissions_status_idx ON submissions (status, created_at DESC);
CREATE INDEX IF NOT EXISTS submissions_ip_created_idx ON submissions (ip_hash, created_at DESC);
CREATE INDEX IF NOT EXISTS signups_ip_created_idx ON signups (ip_hash, created_at DESC);
CREATE INDEX IF NOT EXISTS zero_result_searches_created_idx ON zero_result_searches (created_at DESC);
CREATE INDEX IF NOT EXISTS sponsor_weeks_window_idx ON sponsor_weeks (active, starts_on, ends_on);
CREATE INDEX IF NOT EXISTS sponsor_clicks_slug_idx ON sponsor_clicks (sponsor_slug, created_at DESC);
CREATE INDEX IF NOT EXISTS sponsor_leads_ip_created_idx ON sponsor_leads (ip_hash, created_at DESC);
