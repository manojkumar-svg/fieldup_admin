-- Add images and documents columns to trainers, academies (documents only), and courts
-- Run in Supabase SQL Editor

-- TRAINERS: add images and documents
ALTER TABLE "trainers" ADD COLUMN IF NOT EXISTS "images" TEXT[] DEFAULT '{}';
ALTER TABLE "trainers" ADD COLUMN IF NOT EXISTS "documents" TEXT[] DEFAULT '{}';

-- ACADEMIES: add documents (images already exists)
ALTER TABLE "academies" ADD COLUMN IF NOT EXISTS "documents" TEXT[] DEFAULT '{}';

-- COURTS: add images and documents
ALTER TABLE "courts" ADD COLUMN IF NOT EXISTS "images" TEXT[] DEFAULT '{}';
ALTER TABLE "courts" ADD COLUMN IF NOT EXISTS "documents" TEXT[] DEFAULT '{}';
