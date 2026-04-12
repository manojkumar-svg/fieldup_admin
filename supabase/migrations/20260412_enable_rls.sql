-- =============================================================
-- FieldUp Admin — Enable Row Level Security on all tables
-- Run this entire script in Supabase → SQL Editor
-- =============================================================

-- ─────────────────────────────────────────────────────────────
-- 1. ENABLE RLS on every table
-- ─────────────────────────────────────────────────────────────
ALTER TABLE venues                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE venue_sports            ENABLE ROW LEVEL SECURITY;
ALTER TABLE venue_images            ENABLE ROW LEVEL SECURITY;
ALTER TABLE academies               ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_trainers        ENABLE ROW LEVEL SECURITY;
ALTER TABLE trainers                ENABLE ROW LEVEL SECURITY;
ALTER TABLE courts                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE gyms                    ENABLE ROW LEVEL SECURITY;
ALTER TABLE yoga_studios            ENABLE ROW LEVEL SECURITY;
ALTER TABLE zumba_studios           ENABLE ROW LEVEL SECURITY;
ALTER TABLE users                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs              ENABLE ROW LEVEL SECURITY;


-- ─────────────────────────────────────────────────────────────
-- 2. Drop any existing policies (idempotent re-run safety)
-- ─────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "admin_all_venues"               ON venues;
DROP POLICY IF EXISTS "admin_all_venue_sports"         ON venue_sports;
DROP POLICY IF EXISTS "admin_all_venue_images"         ON venue_images;
DROP POLICY IF EXISTS "admin_all_academies"            ON academies;
DROP POLICY IF EXISTS "admin_all_academy_trainers"     ON academy_trainers;
DROP POLICY IF EXISTS "admin_all_trainers"             ON trainers;
DROP POLICY IF EXISTS "admin_all_courts"               ON courts;
DROP POLICY IF EXISTS "admin_all_gyms"                 ON gyms;
DROP POLICY IF EXISTS "admin_all_yoga_studios"         ON yoga_studios;
DROP POLICY IF EXISTS "admin_all_zumba_studios"        ON zumba_studios;
DROP POLICY IF EXISTS "admin_all_users"                ON users;
DROP POLICY IF EXISTS "admin_all_audit_logs"           ON audit_logs;
DROP POLICY IF EXISTS "admin_all_onboarding"           ON onboarding_applications;
DROP POLICY IF EXISTS "public_insert_onboarding"       ON onboarding_applications;


-- ─────────────────────────────────────────────────────────────
-- 3. Admin-only tables (authenticated role = full CRUD)
--    These tables are only ever touched by logged-in staff.
-- ─────────────────────────────────────────────────────────────
CREATE POLICY "admin_all_venues"
  ON venues FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "admin_all_venue_sports"
  ON venue_sports FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "admin_all_venue_images"
  ON venue_images FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "admin_all_academies"
  ON academies FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "admin_all_academy_trainers"
  ON academy_trainers FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "admin_all_trainers"
  ON trainers FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "admin_all_courts"
  ON courts FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "admin_all_gyms"
  ON gyms FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "admin_all_yoga_studios"
  ON yoga_studios FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "admin_all_zumba_studios"
  ON zumba_studios FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "admin_all_users"
  ON users FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- Audit logs: admins can read and write; no public access
CREATE POLICY "admin_all_audit_logs"
  ON audit_logs FOR ALL TO authenticated
  USING (true) WITH CHECK (true);


-- ─────────────────────────────────────────────────────────────
-- 4. Onboarding applications — split policy
--    Public (/onboarding page): INSERT only, no auth required
--    Admin staff:               full CRUD
-- ─────────────────────────────────────────────────────────────
-- Public partners can submit a new application (no login needed)
CREATE POLICY "public_insert_onboarding"
  ON onboarding_applications FOR INSERT TO anon
  WITH CHECK (true);

-- Admins can list, view, approve, reject
CREATE POLICY "admin_all_onboarding"
  ON onboarding_applications FOR ALL TO authenticated
  USING (true) WITH CHECK (true);


-- ─────────────────────────────────────────────────────────────
-- 5. Verify — list every table with its RLS status
-- ─────────────────────────────────────────────────────────────
SELECT
  schemaname,
  tablename,
  rowsecurity AS rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
