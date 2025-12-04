-- ============================================
-- KORT-MODUL: Migration 2 - Udvidelser
-- Dato: 30. november 2025
-- ============================================
-- KØR DENNE I SUPABASE SQL EDITOR
-- ============================================

-- 1. Tilføj kort-positioner til cabins (hytter)
ALTER TABLE cabins ADD COLUMN IF NOT EXISTS map_x FLOAT;
ALTER TABLE cabins ADD COLUMN IF NOT EXISTS map_y FLOAT;
ALTER TABLE cabins ADD COLUMN IF NOT EXISTS map_locked BOOLEAN DEFAULT FALSE;

-- 2. Opret repeaters tabel (Zigbee repeatere/routers)
CREATE TABLE IF NOT EXISTS repeaters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  ieee_address TEXT UNIQUE,
  base_topic TEXT,
  is_online BOOLEAN DEFAULT TRUE,
  map_x FLOAT,
  map_y FLOAT,
  map_locked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tilføj customer_type til map_spots for at vise status
ALTER TABLE map_spots ADD COLUMN IF NOT EXISTS customer_type TEXT;

-- ============================================
-- ROLLBACK (hvis nødvendigt):
-- ============================================
-- ALTER TABLE cabins DROP COLUMN IF EXISTS map_x;
-- ALTER TABLE cabins DROP COLUMN IF EXISTS map_y;
-- ALTER TABLE cabins DROP COLUMN IF EXISTS map_locked;
-- DROP TABLE IF EXISTS repeaters;
-- ALTER TABLE map_spots DROP COLUMN IF EXISTS customer_type;
