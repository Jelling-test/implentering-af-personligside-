-- Migration: Create external_events table
-- Date: 2025-12-05
-- Description: External events from nearby attractions (max 50km)

CREATE TABLE IF NOT EXISTS external_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attraction_name TEXT NOT NULL,
  title TEXT NOT NULL,
  title_en TEXT,
  title_de TEXT,
  description TEXT,
  description_en TEXT,
  description_de TEXT,
  event_date DATE NOT NULL,
  event_time TIME,
  end_date DATE,
  location TEXT NOT NULL,
  distance_km INTEGER NOT NULL,
  category TEXT DEFAULT 'event',
  event_url TEXT,
  attraction_url TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS policies
ALTER TABLE external_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anon can read active external events" ON external_events
  FOR SELECT TO anon
  USING (is_active = true);

CREATE POLICY "Anon can manage external events" ON external_events
  FOR ALL TO anon
  USING (true)
  WITH CHECK (true);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_external_events_date ON external_events(event_date);
CREATE INDEX IF NOT EXISTS idx_external_events_distance ON external_events(distance_km);
