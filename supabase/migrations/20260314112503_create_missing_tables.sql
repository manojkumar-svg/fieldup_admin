-- ============================================================
-- Create missing venues and venue_sports tables + fix courts
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Venues table
CREATE TABLE IF NOT EXISTS "venues" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "name" TEXT NOT NULL,
  "description" TEXT,
  "address" TEXT NOT NULL,
  "city" TEXT NOT NULL,
  "state" TEXT NOT NULL,
  "pincode" TEXT NOT NULL,
  "latitude" DOUBLE PRECISION,
  "longitude" DOUBLE PRECISION,
  "amenities" TEXT[] DEFAULT '{}',
  "images" TEXT[] DEFAULT '{}',
  "documents" TEXT[] DEFAULT '{}',
  "contactPhone" TEXT,
  "contactEmail" TEXT,
  "status" "EntityStatus" NOT NULL DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "venues_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "venues_status_idx" ON "venues"("status");
CREATE INDEX IF NOT EXISTS "venues_city_idx" ON "venues"("city");

-- Venue sports table
CREATE TABLE IF NOT EXISTS "venue_sports" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "venueId" UUID NOT NULL,
  "sportType" "SportType" NOT NULL,
  "numberOfCourts" INTEGER NOT NULL DEFAULT 1,
  "pricePerHour" DOUBLE PRECISION NOT NULL,
  "openTime" TEXT NOT NULL DEFAULT '06:00',
  "closeTime" TEXT NOT NULL DEFAULT '22:00',
  "availableDays" "DayOfWeek"[] DEFAULT '{MON,TUE,WED,THU,FRI,SAT,SUN}',
  "rules" TEXT,
  "amenities" TEXT[] DEFAULT '{}',
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "venue_sports_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "venue_sports_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "venues"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "venue_sports_venueId_sportType_key" UNIQUE ("venueId", "sportType")
);
CREATE INDEX IF NOT EXISTS "venue_sports_venueId_idx" ON "venue_sports"("venueId");
CREATE INDEX IF NOT EXISTS "venue_sports_sportType_idx" ON "venue_sports"("sportType");

-- Auto-update triggers
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'venues_updatedAt') THEN
    CREATE TRIGGER "venues_updatedAt" BEFORE UPDATE ON "venues" FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'venue_sports_updatedAt') THEN
    CREATE TRIGGER "venue_sports_updatedAt" BEFORE UPDATE ON "venue_sports" FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  END IF;
END $$;

-- RLS for venues
ALTER TABLE "venues" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "venue_sports" ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'venues' AND policyname = 'Authenticated full access') THEN
    CREATE POLICY "Authenticated full access" ON "venues" FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'venue_sports' AND policyname = 'Authenticated full access') THEN
    CREATE POLICY "Authenticated full access" ON "venue_sports" FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;
END $$;

-- Add missing columns to courts table
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courts' AND column_name = 'venueId') THEN
    ALTER TABLE "courts" ADD COLUMN "venueId" UUID;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courts' AND column_name = 'surfaceType') THEN
    ALTER TABLE "courts" ADD COLUMN "surfaceType" "SurfaceType";
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courts' AND column_name = 'indoor') THEN
    ALTER TABLE "courts" ADD COLUMN "indoor" BOOLEAN NOT NULL DEFAULT false;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courts' AND column_name = 'maxPlayers') THEN
    ALTER TABLE "courts" ADD COLUMN "maxPlayers" INTEGER NOT NULL DEFAULT 10;
  END IF;
END $$;

-- Add FK from courts to venues
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'courts_venueId_fkey') THEN
    ALTER TABLE "courts" ADD CONSTRAINT "courts_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "venues"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "courts_venueId_idx" ON "courts"("venueId");
