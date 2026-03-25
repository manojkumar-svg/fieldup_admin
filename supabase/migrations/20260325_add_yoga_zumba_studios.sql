-- ============================================================
-- Add Yoga Studios and Zumba Studios tables
-- ============================================================

-- Yoga Studios table
CREATE TABLE IF NOT EXISTS "yoga_studios" (
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
  "imageTitles" TEXT[] DEFAULT '{}',
  "documentTitles" TEXT[] DEFAULT '{}',
  "openTime" TEXT,
  "closeTime" TEXT,
  "monthlyFee" DOUBLE PRECISION,
  "status" "EntityStatus" NOT NULL DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "yoga_studios_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "yoga_studios_status_idx" ON "yoga_studios"("status");
CREATE INDEX IF NOT EXISTS "yoga_studios_city_idx" ON "yoga_studios"("city");

-- Zumba Studios table
CREATE TABLE IF NOT EXISTS "zumba_studios" (
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
  "imageTitles" TEXT[] DEFAULT '{}',
  "documentTitles" TEXT[] DEFAULT '{}',
  "openTime" TEXT,
  "closeTime" TEXT,
  "monthlyFee" DOUBLE PRECISION,
  "status" "EntityStatus" NOT NULL DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "zumba_studios_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "zumba_studios_status_idx" ON "zumba_studios"("status");
CREATE INDEX IF NOT EXISTS "zumba_studios_city_idx" ON "zumba_studios"("city");

-- Enable RLS on new tables
ALTER TABLE "yoga_studios" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "zumba_studios" ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users full access (matches existing pattern)
CREATE POLICY "Allow authenticated access to yoga_studios"
  ON "yoga_studios" FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated access to zumba_studios"
  ON "zumba_studios" FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Also add imageTitles and documentTitles to gyms table if missing
ALTER TABLE "gyms" ADD COLUMN IF NOT EXISTS "imageTitles" TEXT[] DEFAULT '{}';
ALTER TABLE "gyms" ADD COLUMN IF NOT EXISTS "documentTitles" TEXT[] DEFAULT '{}';
