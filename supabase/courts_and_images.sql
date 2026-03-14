-- ============================================================
-- Courts & Venue Images — Additional Tables
-- Run this in the Supabase SQL Editor after setup.sql
-- ============================================================

-- ============================================================
-- COURTS TABLE
-- ============================================================

CREATE TABLE "courts" (
  "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
  "venueId" UUID NOT NULL,
  "name" TEXT NOT NULL,
  "sportType" "SportType" NOT NULL,
  "surfaceType" "SurfaceType" NOT NULL,
  "indoor" BOOLEAN NOT NULL DEFAULT false,
  "pricePerHour" DOUBLE PRECISION NOT NULL,
  "maxPlayers" INTEGER NOT NULL DEFAULT 10,
  "status" "EntityStatus" NOT NULL DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "courts_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "courts_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "venues"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "courts_venueId_idx" ON "courts"("venueId");
CREATE INDEX "courts_sportType_idx" ON "courts"("sportType");
CREATE INDEX "courts_status_idx" ON "courts"("status");

-- ============================================================
-- VENUE IMAGES TABLE
-- ============================================================

CREATE TABLE "venue_images" (
  "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
  "venueId" UUID NOT NULL,
  "imageUrl" TEXT NOT NULL,
  "caption" TEXT,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "venue_images_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "venue_images_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "venues"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "venue_images_venueId_idx" ON "venue_images"("venueId");

-- ============================================================
-- AUTO-UPDATE updatedAt TRIGGER for courts
-- ============================================================

CREATE TRIGGER "courts_updatedAt" BEFORE UPDATE ON "courts" FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE "courts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "venue_images" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated full access" ON "courts" FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated full access" ON "venue_images" FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============================================================
-- SUPABASE STORAGE BUCKET for venue images
-- ============================================================

-- Create the storage bucket (run in SQL or via Supabase Dashboard)
INSERT INTO storage.buckets (id, name, public)
VALUES ('venue-images', 'venue-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload venue images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'venue-images');

-- Allow authenticated users to update/delete their uploads
CREATE POLICY "Authenticated users can manage venue images"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'venue-images');

CREATE POLICY "Authenticated users can delete venue images"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'venue-images');

-- Allow public read access to venue images
CREATE POLICY "Public can view venue images"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'venue-images');
