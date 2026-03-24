-- ============================================================
-- Add YOGA and FITNESS to SportType enum
-- Add Gym and GymTrainer tables
-- ============================================================

-- Add new enum values to SportType
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'YOGA' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'SportType')) THEN
    ALTER TYPE "SportType" ADD VALUE 'YOGA';
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'FITNESS' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'SportType')) THEN
    ALTER TYPE "SportType" ADD VALUE 'FITNESS';
  END IF;
END$$;

-- Gyms table
CREATE TABLE IF NOT EXISTS "gyms" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "name" TEXT NOT NULL,
  "description" TEXT,
  "address" TEXT NOT NULL,
  "city" TEXT NOT NULL,
  "state" TEXT NOT NULL,
  "pincode" TEXT NOT NULL,
  "latitude" DOUBLE PRECISION,
  "longitude" DOUBLE PRECISION,
  "contactPhone" TEXT NOT NULL,
  "contactEmail" TEXT,
  "website" TEXT,
  "amenities" TEXT[] DEFAULT '{}',
  "images" TEXT[] DEFAULT '{}',
  "documents" TEXT[] DEFAULT '{}',
  "openTime" TEXT,
  "closeTime" TEXT,
  "monthlyFee" DOUBLE PRECISION,
  "status" "EntityStatus" NOT NULL DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "gyms_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "gyms_status_idx" ON "gyms"("status");
CREATE INDEX IF NOT EXISTS "gyms_city_idx" ON "gyms"("city");

-- Gym trainers join table
CREATE TABLE IF NOT EXISTS "gym_trainers" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "gymId" UUID NOT NULL,
  "trainerId" UUID NOT NULL,
  "joinedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "gym_trainers_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "gym_trainers_gymId_fkey" FOREIGN KEY ("gymId") REFERENCES "gyms"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "gym_trainers_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "trainers"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "gym_trainers_gymId_trainerId_key" UNIQUE ("gymId", "trainerId")
);

-- Enable RLS on new tables
ALTER TABLE "gyms" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "gym_trainers" ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users full access (matches existing pattern)
CREATE POLICY "Allow authenticated access to gyms"
  ON "gyms" FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated access to gym_trainers"
  ON "gym_trainers" FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
