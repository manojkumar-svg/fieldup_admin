-- Add imageTitles and documentTitles columns to entities that support images/documents

ALTER TABLE trainers
  ADD COLUMN IF NOT EXISTS "imageTitles" JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS "documentTitles" JSONB DEFAULT '[]'::jsonb;

ALTER TABLE venues
  ADD COLUMN IF NOT EXISTS "imageTitles" JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS "documentTitles" JSONB DEFAULT '[]'::jsonb;

ALTER TABLE academies
  ADD COLUMN IF NOT EXISTS "imageTitles" JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS "documentTitles" JSONB DEFAULT '[]'::jsonb;

ALTER TABLE gyms
  ADD COLUMN IF NOT EXISTS "imageTitles" JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS "documentTitles" JSONB DEFAULT '[]'::jsonb;
