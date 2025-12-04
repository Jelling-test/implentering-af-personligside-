-- ============================================
-- ROLLBACK: Kort-modul database-ændringer
-- Oprettet: 30. november 2025
-- ============================================
-- KØR DETTE SCRIPT HVIS NOGET GÅR GALT
-- Scriptet fjerner alle ændringer fra kort-modulet
-- ============================================

-- 1. Fjern kolonner fra power_meters (omvendt rækkefølge pga. foreign key)
ALTER TABLE power_meters DROP COLUMN IF EXISTS map_locked;
ALTER TABLE power_meters DROP COLUMN IF EXISTS map_y;
ALTER TABLE power_meters DROP COLUMN IF EXISTS map_x;
ALTER TABLE power_meters DROP COLUMN IF EXISTS stand_id;

-- 2. Fjern nye tabeller (rækkefølge er vigtig pga. foreign keys)
DROP TABLE IF EXISTS map_config;
DROP TABLE IF EXISTS map_spots;
DROP TABLE IF EXISTS power_stands;

-- ============================================
-- VERIFICERING: Kør dette for at tjekke at alt er fjernet
-- ============================================
-- SELECT column_name FROM information_schema.columns 
-- WHERE table_name = 'power_meters' AND column_name IN ('stand_id', 'map_x', 'map_y', 'map_locked');
-- (Skal returnere 0 rækker)

-- SELECT table_name FROM information_schema.tables 
-- WHERE table_name IN ('power_stands', 'map_spots', 'map_config');
-- (Skal returnere 0 rækker)
