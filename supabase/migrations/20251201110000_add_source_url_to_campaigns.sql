-- Migration: Add source_url to campaigns table
-- Date: 2025-12-01
-- Description: Add source_url column to store campaign source (e.g., YouTube video URL)

ALTER TABLE "public"."campaigns"
ADD COLUMN IF NOT EXISTS "source_url" TEXT;

COMMENT ON COLUMN "public"."campaigns"."source_url" IS 'Campaign source URL (e.g., YouTube video, landing page)';
