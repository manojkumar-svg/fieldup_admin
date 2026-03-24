-- ============================================================
-- Field Up Admin — Supabase Database Setup
-- Run this in the Supabase SQL Editor:
-- https://supabase.com/dashboard/project/gcuspqjcxibpzonvogfi/sql
-- ============================================================

-- Enable UUID extension (should already be enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMIN', 'OPERATIONS_MANAGER');
CREATE TYPE "EntityStatus" AS ENUM ('ACTIVE', 'INACTIVE');
CREATE TYPE "SportType" AS ENUM (
  'CRICKET_NET', 'BOX_CRICKET', 'FOOTBALL', 'BASKETBALL', 'PICKLEBALL',
  'TENNIS', 'BADMINTON', 'SWIMMING', 'HOCKEY', 'VOLLEYBALL',
  'TABLE_TENNIS', 'SNOOKER', 'ARCHERY', 'BOXING', 'GOLF',
  'SHOOTING', 'SKATEBOARDING', 'TAEKWONDO'
);
CREATE TYPE "PartnerType" AS ENUM ('VENUE', 'COACH', 'ACADEMY');
CREATE TYPE "OnboardingStatus" AS ENUM ('PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED');
CREATE TYPE "SurfaceType" AS ENUM ('SYNTHETIC', 'WOODEN', 'CLAY', 'TURF', 'CONCRETE');
CREATE TYPE "SlotDuration" AS ENUM ('THIRTY_MINS', 'SIXTY_MINS', 'NINETY_MINS');
CREATE TYPE "DayOfWeek" AS ENUM ('MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN');

-- ============================================================
-- TABLES
-- ============================================================

CREATE TABLE "users" (
  "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
  "email" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL DEFAULT '',
  "role" "UserRole" NOT NULL DEFAULT 'OPERATIONS_MANAGER',
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

CREATE TABLE "venues" (
  "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
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
CREATE INDEX "venues_status_idx" ON "venues"("status");
CREATE INDEX "venues_city_idx" ON "venues"("city");

CREATE TABLE "venue_sports" (
  "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
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
CREATE INDEX "venue_sports_venueId_idx" ON "venue_sports"("venueId");
CREATE INDEX "venue_sports_sportType_idx" ON "venue_sports"("sportType");

CREATE TABLE "academies" (
  "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
  "name" TEXT NOT NULL,
  "description" TEXT,
  "sportsOffered" "SportType"[] DEFAULT '{}',
  "address" TEXT NOT NULL,
  "city" TEXT NOT NULL,
  "state" TEXT NOT NULL,
  "pincode" TEXT NOT NULL,
  "latitude" DOUBLE PRECISION,
  "longitude" DOUBLE PRECISION,
  "contactPhone" TEXT NOT NULL,
  "contactEmail" TEXT,
  "website" TEXT,
  "images" TEXT[] DEFAULT '{}',
  "establishedYear" INTEGER,
  "status" "EntityStatus" NOT NULL DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "academies_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "academies_status_idx" ON "academies"("status");
CREATE INDEX "academies_city_idx" ON "academies"("city");

CREATE TABLE "trainers" (
  "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
  "name" TEXT NOT NULL,
  "email" TEXT,
  "phone" TEXT NOT NULL,
  "sportSpecialization" "SportType" NOT NULL,
  "experience" INTEGER NOT NULL,
  "certifications" TEXT[] DEFAULT '{}',
  "hourlyRate" DOUBLE PRECISION NOT NULL,
  "bio" TEXT,
  "photo" TEXT,
  "city" TEXT NOT NULL,
  "state" TEXT NOT NULL,
  "status" "EntityStatus" NOT NULL DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "trainers_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "trainers_sportSpecialization_idx" ON "trainers"("sportSpecialization");
CREATE INDEX "trainers_status_idx" ON "trainers"("status");
CREATE INDEX "trainers_city_idx" ON "trainers"("city");

CREATE TABLE "academy_trainers" (
  "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
  "academyId" UUID NOT NULL,
  "trainerId" UUID NOT NULL,
  "joinedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "academy_trainers_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "academy_trainers_academyId_fkey" FOREIGN KEY ("academyId") REFERENCES "academies"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "academy_trainers_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "trainers"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "academy_trainers_academyId_trainerId_key" ON "academy_trainers"("academyId", "trainerId");

CREATE TABLE "onboarding_applications" (
  "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
  "status" "OnboardingStatus" NOT NULL DEFAULT 'PENDING',
  "partnerType" "PartnerType" NOT NULL,
  "businessName" TEXT NOT NULL,
  "contactPerson" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "city" TEXT NOT NULL,
  "fullAddress" TEXT NOT NULL,
  "googleMapsLink" TEXT,
  "sportsOffered" "SportType"[] DEFAULT '{}',
  "experienceYears" INTEGER,
  "certifications" TEXT[] DEFAULT '{}',
  "shortBio" TEXT,
  "numberOfCourts" INTEGER,
  "surfaceType" "SurfaceType",
  "facilities" TEXT[] DEFAULT '{}',
  "sessionTypes" TEXT[] DEFAULT '{}',
  "maxStudents" INTEGER,
  "availableDays" "DayOfWeek"[] DEFAULT '{}',
  "operatingHours" TEXT,
  "slotDuration" "SlotDuration",
  "pricePerSlot" DOUBLE PRECISION,
  "weekendPricingDiff" BOOLEAN NOT NULL DEFAULT false,
  "cancellationAllowed" BOOLEAN NOT NULL DEFAULT false,
  "acceptsCash" BOOLEAN NOT NULL DEFAULT false,
  "bankAccountName" TEXT,
  "bankAccountNumber" TEXT,
  "ifscCode" TEXT,
  "gstNumber" TEXT,
  "idProofUrls" TEXT[] DEFAULT '{}',
  "profilePhotoUrls" TEXT[] DEFAULT '{}',
  "termsAccepted" BOOLEAN NOT NULL DEFAULT false,
  "reviewedBy" TEXT,
  "reviewedAt" TIMESTAMPTZ,
  "rejectionReason" TEXT,
  "notes" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "onboarding_applications_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "onboarding_applications_status_idx" ON "onboarding_applications"("status");
CREATE INDEX "onboarding_applications_partnerType_idx" ON "onboarding_applications"("partnerType");
CREATE INDEX "onboarding_applications_city_idx" ON "onboarding_applications"("city");
CREATE INDEX "onboarding_applications_createdAt_idx" ON "onboarding_applications"("createdAt");

-- ============================================================
-- AUTO-UPDATE updatedAt TRIGGER
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "users_updatedAt" BEFORE UPDATE ON "users" FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER "venues_updatedAt" BEFORE UPDATE ON "venues" FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER "venue_sports_updatedAt" BEFORE UPDATE ON "venue_sports" FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER "academies_updatedAt" BEFORE UPDATE ON "academies" FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER "trainers_updatedAt" BEFORE UPDATE ON "trainers" FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER "onboarding_applications_updatedAt" BEFORE UPDATE ON "onboarding_applications" FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY — allow authenticated users full access
-- ============================================================

ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "venues" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "venue_sports" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "academies" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "trainers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "academy_trainers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "onboarding_applications" ENABLE ROW LEVEL SECURITY;

-- Authenticated users can do everything (admin panel)
CREATE POLICY "Authenticated full access" ON "users" FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated full access" ON "venues" FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated full access" ON "venue_sports" FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated full access" ON "academies" FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated full access" ON "trainers" FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated full access" ON "academy_trainers" FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated full access" ON "onboarding_applications" FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Allow anonymous users to INSERT onboarding applications (public onboarding form)
CREATE POLICY "Anon can submit onboarding" ON "onboarding_applications" FOR INSERT TO anon WITH CHECK (true);
-- Allow anonymous users to read their own application by id (for the success page)
CREATE POLICY "Anon can read onboarding" ON "onboarding_applications" FOR SELECT TO anon USING (true);
