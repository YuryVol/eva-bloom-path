-- Fix eva_diary table: add missing columns
-- Run in Supabase SQL Editor

ALTER TABLE eva_diary ADD COLUMN IF NOT EXISTS resistance_before integer;
ALTER TABLE eva_diary ADD COLUMN IF NOT EXISTS resistance_after integer;
ALTER TABLE eva_diary ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

-- Copy entry_date → created_at for any existing rows
UPDATE eva_diary SET created_at = entry_date WHERE created_at IS NULL;
