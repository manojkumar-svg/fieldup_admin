-- CreateEnum
CREATE TYPE "PartnerType" AS ENUM ('VENUE', 'COACH', 'ACADEMY');

-- CreateEnum
CREATE TYPE "OnboardingStatus" AS ENUM ('PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "SurfaceType" AS ENUM ('SYNTHETIC', 'WOODEN', 'CLAY', 'TURF', 'CONCRETE');

-- CreateEnum
CREATE TYPE "SlotDuration" AS ENUM ('THIRTY_MINS', 'SIXTY_MINS', 'NINETY_MINS');

-- CreateEnum
CREATE TYPE "DayOfWeek" AS ENUM ('MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "SportType" ADD VALUE 'AQUATICS';
ALTER TYPE "SportType" ADD VALUE 'ARCHERY';
ALTER TYPE "SportType" ADD VALUE 'ATHLETICS';
ALTER TYPE "SportType" ADD VALUE 'BEACH_VOLLEYBALL';
ALTER TYPE "SportType" ADD VALUE 'BOXING';
ALTER TYPE "SportType" ADD VALUE 'BREAKING';
ALTER TYPE "SportType" ADD VALUE 'CANOEING';
ALTER TYPE "SportType" ADD VALUE 'CYCLING';
ALTER TYPE "SportType" ADD VALUE 'EQUESTRIAN';
ALTER TYPE "SportType" ADD VALUE 'FENCING';
ALTER TYPE "SportType" ADD VALUE 'GOLF';
ALTER TYPE "SportType" ADD VALUE 'GYMNASTICS';
ALTER TYPE "SportType" ADD VALUE 'HANDBALL';
ALTER TYPE "SportType" ADD VALUE 'JUDO';
ALTER TYPE "SportType" ADD VALUE 'KARATE';
ALTER TYPE "SportType" ADD VALUE 'MMA';
ALTER TYPE "SportType" ADD VALUE 'MODERN_PENTATHLON';
ALTER TYPE "SportType" ADD VALUE 'PICKLEBALL';
ALTER TYPE "SportType" ADD VALUE 'ROWING';
ALTER TYPE "SportType" ADD VALUE 'RUGBY_SEVENS';
ALTER TYPE "SportType" ADD VALUE 'SAILING';
ALTER TYPE "SportType" ADD VALUE 'SHOOTING';
ALTER TYPE "SportType" ADD VALUE 'SKATEBOARDING';
ALTER TYPE "SportType" ADD VALUE 'SPORT_CLIMBING';
ALTER TYPE "SportType" ADD VALUE 'SURFING';
ALTER TYPE "SportType" ADD VALUE 'TAEKWONDO';
ALTER TYPE "SportType" ADD VALUE 'TRIATHLON';
ALTER TYPE "SportType" ADD VALUE 'UFC';
ALTER TYPE "SportType" ADD VALUE 'WEIGHTLIFTING';
ALTER TYPE "SportType" ADD VALUE 'WRESTLING';

-- CreateTable
CREATE TABLE "onboarding_applications" (
    "id" TEXT NOT NULL,
    "status" "OnboardingStatus" NOT NULL DEFAULT 'PENDING',
    "partnerType" "PartnerType" NOT NULL,
    "businessName" TEXT NOT NULL,
    "contactPerson" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "fullAddress" TEXT NOT NULL,
    "googleMapsLink" TEXT,
    "sportsOffered" "SportType"[],
    "experienceYears" INTEGER,
    "certifications" TEXT[],
    "shortBio" TEXT,
    "numberOfCourts" INTEGER,
    "surfaceType" "SurfaceType",
    "facilities" TEXT[],
    "sessionTypes" TEXT[],
    "maxStudents" INTEGER,
    "availableDays" "DayOfWeek"[],
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
    "idProofUrls" TEXT[],
    "profilePhotoUrls" TEXT[],
    "termsAccepted" BOOLEAN NOT NULL DEFAULT false,
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "onboarding_applications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "onboarding_applications_status_idx" ON "onboarding_applications"("status");

-- CreateIndex
CREATE INDEX "onboarding_applications_partnerType_idx" ON "onboarding_applications"("partnerType");

-- CreateIndex
CREATE INDEX "onboarding_applications_city_idx" ON "onboarding_applications"("city");

-- CreateIndex
CREATE INDEX "onboarding_applications_createdAt_idx" ON "onboarding_applications"("createdAt");
