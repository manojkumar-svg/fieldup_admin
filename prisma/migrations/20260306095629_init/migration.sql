-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMIN', 'OPERATIONS_MANAGER');

-- CreateEnum
CREATE TYPE "EntityStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "SportType" AS ENUM ('CRICKET', 'FOOTBALL', 'BASKETBALL', 'TENNIS', 'BADMINTON', 'SWIMMING', 'HOCKEY', 'VOLLEYBALL', 'TABLE_TENNIS', 'SQUASH', 'OTHER');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'OPERATIONS_MANAGER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "courts" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sportType" "SportType" NOT NULL,
    "description" TEXT,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "pincode" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "capacity" INTEGER NOT NULL,
    "pricePerHour" DOUBLE PRECISION NOT NULL,
    "images" TEXT[],
    "amenities" TEXT[],
    "openTime" TEXT NOT NULL,
    "closeTime" TEXT NOT NULL,
    "status" "EntityStatus" NOT NULL DEFAULT 'ACTIVE',
    "contactPhone" TEXT,
    "contactEmail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "courts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "academies" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "sportsOffered" "SportType"[],
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "pincode" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "contactPhone" TEXT NOT NULL,
    "contactEmail" TEXT,
    "website" TEXT,
    "images" TEXT[],
    "establishedYear" INTEGER,
    "status" "EntityStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "academies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trainers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT NOT NULL,
    "sportSpecialization" "SportType" NOT NULL,
    "experience" INTEGER NOT NULL,
    "certifications" TEXT[],
    "hourlyRate" DOUBLE PRECISION NOT NULL,
    "bio" TEXT,
    "photo" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "status" "EntityStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trainers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "academy_trainers" (
    "id" TEXT NOT NULL,
    "academyId" TEXT NOT NULL,
    "trainerId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "academy_trainers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "courts_sportType_idx" ON "courts"("sportType");

-- CreateIndex
CREATE INDEX "courts_status_idx" ON "courts"("status");

-- CreateIndex
CREATE INDEX "courts_city_idx" ON "courts"("city");

-- CreateIndex
CREATE INDEX "academies_status_idx" ON "academies"("status");

-- CreateIndex
CREATE INDEX "academies_city_idx" ON "academies"("city");

-- CreateIndex
CREATE INDEX "trainers_sportSpecialization_idx" ON "trainers"("sportSpecialization");

-- CreateIndex
CREATE INDEX "trainers_status_idx" ON "trainers"("status");

-- CreateIndex
CREATE INDEX "trainers_city_idx" ON "trainers"("city");

-- CreateIndex
CREATE UNIQUE INDEX "academy_trainers_academyId_trainerId_key" ON "academy_trainers"("academyId", "trainerId");

-- AddForeignKey
ALTER TABLE "academy_trainers" ADD CONSTRAINT "academy_trainers_academyId_fkey" FOREIGN KEY ("academyId") REFERENCES "academies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academy_trainers" ADD CONSTRAINT "academy_trainers_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "trainers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
