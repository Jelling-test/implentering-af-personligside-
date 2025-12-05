-- Migration: Create camp_events table
-- Date: 2025-12-05
-- Description: Internal campsite events

CREATE TABLE IF NOT EXISTS camp_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  title_en TEXT,
  title_de TEXT,
  description TEXT,
  description_en TEXT,
  description_de TEXT,
  event_date DATE NOT NULL,
  event_time TIME NOT NULL,
  end_time TIME,
  location TEXT NOT NULL,
  target_group TEXT DEFAULT 'all',
  registration_place TEXT DEFAULT 'none',
  max_participants INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS policies
ALTER TABLE camp_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anon can read active camp events" ON camp_events
  FOR SELECT TO anon
  USING (is_active = true);

CREATE POLICY "Anon can manage camp events" ON camp_events
  FOR ALL TO anon
  USING (true)
  WITH CHECK (true);

-- Index for faster date queries
CREATE INDEX IF NOT EXISTS idx_camp_events_date ON camp_events(event_date);
