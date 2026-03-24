-- ============================================================
-- Migration: Add cancellation, location to all entities,
-- trainer session configuration, and courts-in-venue support
-- ============================================================

-- 1. Courts: add cancellation toggle
ALTER TABLE courts
  ADD COLUMN IF NOT EXISTS "cancellationAvailable" BOOLEAN DEFAULT false;

-- 2. Trainers: add full location fields, cancellation, and session configuration
ALTER TABLE trainers
  ADD COLUMN IF NOT EXISTS address TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS pincode TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "cancellationAvailable" BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS "kidsTraining" BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS "groupSessions" BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS "oneOnOneCoaching" BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS "sessionConfig" JSONB DEFAULT '{}'::jsonb;

-- sessionConfig JSONB structure:
-- {
--   "kids": { "ageMin": 5, "ageMax": 15, "timings": "09:00-11:00", "fee": 500, "maxCapacity": 20 },
--   "group": { "ageMin": 10, "ageMax": 60, "timings": "06:00-08:00", "fee": 300, "maxCapacity": 30 },
--   "oneOnOne": { "timings": "flexible", "fee": 1500, "maxCapacity": 1 }
-- }

-- 3. Academies: add latitude/longitude (they have address already)
ALTER TABLE academies
  ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;

-- 4. Venue courts table: link individual courts to venues
-- (courts table already has venueId, so we just need to add cancellation)
-- The courts table schema already has a venueId column.

COMMENT ON COLUMN courts."cancellationAvailable" IS 'Whether booking cancellation is allowed for this court';
COMMENT ON COLUMN trainers."cancellationAvailable" IS 'Whether session cancellation is allowed for this trainer';
COMMENT ON COLUMN trainers."sessionConfig" IS 'JSON config for kids, group, 1:1 session details including timings, fees, capacity, age limits';
