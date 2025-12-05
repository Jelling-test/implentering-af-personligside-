-- Initial Schema Migration - Eksporteret fra produktion 05.12.2025
-- Dette opretter alle tabeller i develop branch

-- Extension for citext (case-insensitive text)
CREATE EXTENSION IF NOT EXISTS citext;

-- =====================================================
-- TABELLER
-- =====================================================

CREATE TABLE IF NOT EXISTS public.admin_bypass_log (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  meter_id TEXT NOT NULL,
  action TEXT NOT NULL,
  reason TEXT,
  performed_by UUID,
  performed_by_email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.alert_history (
  id BIGSERIAL PRIMARY KEY,
  monitoring_id TEXT NOT NULL,
  area_id INTEGER NOT NULL,
  severity TEXT NOT NULL,
  alert_type TEXT NOT NULL,
  meter_number TEXT,
  message TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.approved_plates (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  plate_text TEXT NOT NULL,
  source TEXT NOT NULL,
  booking_id INTEGER,
  customer_name TEXT,
  checked_in BOOLEAN DEFAULT false,
  checked_out BOOLEAN DEFAULT false,
  arrival_date DATE,
  departure_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID,
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  organization_type TEXT DEFAULT 'camping',
  subscription_tier TEXT DEFAULT 'pro',
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.main_boards (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  map_x DOUBLE PRECISION,
  map_y DOUBLE PRECISION,
  map_locked BOOLEAN DEFAULT false,
  color TEXT DEFAULT '#3B82F6',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.distribution_boards (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  main_board_id UUID REFERENCES public.main_boards(id),
  name TEXT NOT NULL,
  board_number INTEGER,
  location TEXT,
  map_x DOUBLE PRECISION,
  map_y DOUBLE PRECISION,
  map_locked BOOLEAN DEFAULT false,
  color TEXT DEFAULT '#F59E0B',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.fuse_groups (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  board_id UUID REFERENCES public.distribution_boards(id),
  group_number INTEGER NOT NULL,
  name TEXT,
  fuse_rating TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.power_stands (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  name TEXT,
  map_x DOUBLE PRECISION,
  map_y DOUBLE PRECISION,
  map_locked BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  fuse_group_id UUID REFERENCES public.fuse_groups(id),
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.power_meters (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  meter_number citext NOT NULL UNIQUE,
  spot_number VARCHAR(50),
  is_available BOOLEAN DEFAULT true,
  current_customer_id UUID,
  mqtt_topic VARCHAR(255),
  last_reading NUMERIC(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  power_status TEXT DEFAULT 'OFF',
  is_online BOOLEAN DEFAULT true,
  stand_id UUID REFERENCES public.power_stands(id),
  map_x DOUBLE PRECISION,
  map_y DOUBLE PRECISION,
  map_locked BOOLEAN DEFAULT false,
  admin_bypass BOOLEAN DEFAULT false,
  admin_bypass_by UUID,
  admin_bypass_at TIMESTAMP WITH TIME ZONE,
  admin_bypass_reason TEXT,
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.meter_identity (
  ieee_address TEXT NOT NULL PRIMARY KEY,
  meter_number citext NOT NULL,
  base_topic TEXT NOT NULL,
  model TEXT,
  availability TEXT,
  last_seen TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.meter_readings (
  id BIGSERIAL PRIMARY KEY,
  meter_id TEXT NOT NULL,
  time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  energy DOUBLE PRECISION,
  power DOUBLE PRECISION,
  current DOUBLE PRECISION,
  voltage DOUBLE PRECISION,
  state TEXT,
  linkquality INTEGER
);

CREATE TABLE IF NOT EXISTS public.meter_readings_history (
  id BIGSERIAL PRIMARY KEY,
  meter_id TEXT NOT NULL,
  time TIMESTAMP WITH TIME ZONE NOT NULL,
  energy DOUBLE PRECISION,
  power DOUBLE PRECISION,
  current DOUBLE PRECISION,
  voltage DOUBLE PRECISION,
  state TEXT,
  snapshot_time TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.meter_commands (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  meter_id citext,
  command TEXT NOT NULL,
  value TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  executed_at TIMESTAMP WITH TIME ZONE,
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.regular_customers (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  booking_id INTEGER NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  arrival_date DATE NOT NULL,
  departure_date DATE NOT NULL,
  checked_in BOOLEAN DEFAULT false,
  checked_out BOOLEAN DEFAULT false,
  number_of_persons INTEGER NOT NULL,
  spot_number VARCHAR(50),
  license_plates TEXT[],
  meter_id citext,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  meter_start_energy NUMERIC(10,2),
  meter_start_time TIMESTAMP WITH TIME ZONE,
  email VARCHAR(255),
  phone VARCHAR(50),
  customer_type VARCHAR(50) DEFAULT 'kørende',
  spot_numbers TEXT[],
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.seasonal_customers (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  booking_id INTEGER NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  arrival_date DATE NOT NULL,
  departure_date DATE NOT NULL,
  checked_in BOOLEAN DEFAULT false,
  checked_out BOOLEAN DEFAULT false,
  spot_number VARCHAR(50),
  license_plates TEXT[],
  meter_id citext,
  has_power_package BOOLEAN DEFAULT false,
  power_package_type VARCHAR(50),
  power_package_start_date DATE,
  power_package_end_date DATE,
  power_package_price NUMERIC(10,2),
  power_included_kwh NUMERIC(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  meter_start_energy NUMERIC(10,2),
  meter_start_time TIMESTAMP WITH TIME ZONE,
  email VARCHAR(255),
  phone VARCHAR(50),
  customer_type VARCHAR(50) DEFAULT 'sæson',
  winter_storage BOOLEAN DEFAULT false,
  spot_numbers TEXT[],
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.cabins (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  cabin_number TEXT NOT NULL,
  name TEXT NOT NULL,
  cabin_type TEXT,
  meter_id TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  map_x DOUBLE PRECISION,
  map_y DOUBLE PRECISION,
  map_locked BOOLEAN DEFAULT false,
  distribution_board_id UUID REFERENCES public.distribution_boards(id),
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.cabin_cleaning_schedule (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  cabin_id UUID REFERENCES public.cabins(id),
  meter_id TEXT NOT NULL,
  checkout_date DATE NOT NULL,
  cleaning_start TIMESTAMP WITH TIME ZONE NOT NULL,
  cleaning_end TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'scheduled',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.plugin_data (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  module TEXT NOT NULL,
  ref_id TEXT NOT NULL,
  key TEXT NOT NULL,
  scope TEXT DEFAULT 'tenant',
  data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.roles (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  scope TEXT NOT NULL DEFAULT 'tenant',
  is_system_role BOOLEAN DEFAULT false,
  tenant_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.permissions (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.role_permissions (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  role_id UUID NOT NULL REFERENCES public.roles(id),
  permission_id UUID NOT NULL REFERENCES public.permissions(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.user_roles (
  user_id UUID NOT NULL,
  role TEXT NOT NULL,
  PRIMARY KEY (user_id, role)
);

CREATE TABLE IF NOT EXISTS public.user_memberships (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  tenant_id UUID NOT NULL,
  role_id UUID NOT NULL REFERENCES public.roles(id),
  status TEXT DEFAULT 'active',
  invited_at TIMESTAMP WITH TIME ZONE,
  accepted_at TIMESTAMP WITH TIME ZONE,
  invited_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.camp_events (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  title_en TEXT,
  title_de TEXT,
  description TEXT NOT NULL,
  description_en TEXT,
  description_de TEXT,
  event_date DATE NOT NULL,
  event_time TIME WITHOUT TIME ZONE NOT NULL,
  end_time TIME WITHOUT TIME ZONE,
  location TEXT NOT NULL,
  target_group TEXT NOT NULL DEFAULT 'all',
  registration_place TEXT DEFAULT 'none',
  max_participants INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.external_events (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  attraction_name TEXT NOT NULL,
  title TEXT NOT NULL,
  title_en TEXT,
  title_de TEXT,
  description TEXT,
  description_en TEXT,
  description_de TEXT,
  event_date DATE NOT NULL,
  event_time TIME WITHOUT TIME ZONE,
  end_date DATE,
  location TEXT NOT NULL,
  distance_km INTEGER NOT NULL,
  category TEXT DEFAULT 'event',
  event_url TEXT,
  attraction_url TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.plate_detections (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  plate_text TEXT NOT NULL,
  plate_unicode TEXT,
  plate_country TEXT,
  plate_region TEXT,
  plate_region_code TEXT,
  plate_confidence NUMERIC(10,2),
  car_state TEXT,
  car_direction TEXT,
  car_id TEXT,
  vehicle_type TEXT,
  vehicle_color TEXT,
  vehicle_view TEXT,
  plate_list TEXT,
  plate_list_mode TEXT,
  plate_list_description TEXT,
  capture_timestamp BIGINT,
  frame_timestamp BIGINT,
  datetime TEXT,
  detected_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  camera_serial TEXT,
  camera_model TEXT,
  camera_ip TEXT,
  camera_mac TEXT,
  plate_coordinates JSONB,
  geotag JSONB,
  image_plate TEXT,
  image_vehicle TEXT,
  image_format TEXT DEFAULT 'jpeg',
  full_payload JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.gate_openings (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  plate_text TEXT NOT NULL,
  approved_plate_id UUID REFERENCES public.approved_plates(id),
  detection_id UUID REFERENCES public.plate_detections(id),
  opened_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  success BOOLEAN NOT NULL,
  error_message TEXT,
  source TEXT NOT NULL,
  time_restriction_met BOOLEAN,
  checkin_status_met BOOLEAN,
  camera_ip TEXT,
  request_ip TEXT,
  rate_limit_key TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.email_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  recipient_email TEXT NOT NULL,
  subject TEXT,
  status TEXT NOT NULL,
  error_message TEXT,
  booking_id INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.email_provider_config (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  organization_id UUID DEFAULT 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  name TEXT NOT NULL,
  provider_type TEXT NOT NULL,
  is_active BOOLEAN DEFAULT false,
  from_email TEXT NOT NULL DEFAULT 'noreply@jellingcamping.dk',
  from_name TEXT NOT NULL DEFAULT 'Jelling Camping',
  reply_to_email TEXT,
  smtp_host TEXT,
  smtp_port INTEGER,
  smtp_user TEXT,
  smtp_password_encrypted TEXT,
  smtp_secure TEXT,
  api_endpoint TEXT,
  api_key_encrypted TEXT,
  api_headers JSONB DEFAULT '{}',
  api_payload_template TEXT,
  last_test_at TIMESTAMP WITH TIME ZONE,
  last_test_success BOOLEAN,
  last_test_error TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.email_subscribers (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  email TEXT NOT NULL,
  customer_type TEXT NOT NULL,
  year INTEGER NOT NULL,
  booking_number TEXT,
  checked_in_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  checked_in BOOLEAN DEFAULT false,
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.daily_package_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  date DATE NOT NULL,
  kunde_type TEXT NOT NULL,
  betalings_metode TEXT NOT NULL,
  packages_sold INTEGER DEFAULT 0,
  kwh_sold NUMERIC(10,2) DEFAULT 0,
  revenue NUMERIC(10,2) DEFAULT 0,
  checkouts_count INTEGER DEFAULT 0,
  kwh_bought_total NUMERIC(10,2) DEFAULT 0,
  kwh_consumed_total NUMERIC(10,2) DEFAULT 0,
  kwh_forfeited_total NUMERIC(10,2) DEFAULT 0,
  active_packages INTEGER DEFAULT 0,
  kwh_remaining_total NUMERIC(10,2) DEFAULT 0,
  kwh_consumed_today NUMERIC(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.board_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  from_board_id UUID NOT NULL,
  to_board_id UUID NOT NULL,
  connection_type TEXT DEFAULT 'power',
  color TEXT DEFAULT '#666666',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.booking_extra_meters (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  booking_type TEXT NOT NULL,
  booking_id UUID NOT NULL,
  meter_id TEXT NOT NULL,
  meter_start_energy NUMERIC(10,2),
  meter_start_time TIMESTAMP WITH TIME ZONE,
  added_by UUID,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.map_config (
  id TEXT NOT NULL DEFAULT 'main',
  image_url TEXT,
  image_width INTEGER,
  image_height INTEGER,
  settings JSONB DEFAULT '{"standRadius": 20, "repeaterSize": 15, "spotFontSize": 12, "cabinFontSize": 14, "standFontSize": 10}',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.map_spots (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  spot_number TEXT NOT NULL,
  spot_type TEXT DEFAULT 'standard',
  map_x DOUBLE PRECISION,
  map_y DOUBLE PRECISION,
  map_locked BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  customer_type TEXT,
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.repeaters (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  ieee_address TEXT,
  base_topic TEXT,
  is_online BOOLEAN DEFAULT true,
  map_x DOUBLE PRECISION,
  map_y DOUBLE PRECISION,
  map_locked BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.monitoring_sessions (
  id TEXT NOT NULL PRIMARY KEY,
  area_ids INTEGER[] NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.monitoring_alerts (
  id BIGSERIAL PRIMARY KEY,
  monitoring_id TEXT NOT NULL,
  area_id INTEGER NOT NULL,
  severity TEXT NOT NULL,
  alert_type TEXT NOT NULL,
  meter_number TEXT,
  message TEXT NOT NULL,
  details JSONB,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.monitoring_data (
  id BIGSERIAL PRIMARY KEY,
  monitoring_id TEXT NOT NULL,
  meter_number TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  lqi INTEGER,
  voltage NUMERIC(10,2),
  current NUMERIC(10,2),
  power NUMERIC(10,2),
  energy NUMERIC(10,2),
  state TEXT,
  raw_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.monitoring_events (
  id BIGSERIAL PRIMARY KEY,
  monitoring_id TEXT NOT NULL,
  meter_number TEXT NOT NULL,
  event_type TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.system_settings (
  key TEXT NOT NULL PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.unauthorized_power_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  meter_id TEXT NOT NULL,
  meter_number TEXT,
  detected_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  action_taken TEXT DEFAULT 'shutoff_sent',
  had_customer BOOLEAN DEFAULT false,
  had_package BOOLEAN DEFAULT false,
  details JSONB DEFAULT '{}',
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.webhook_data (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  json_payload JSONB NOT NULL,
  raw_payload TEXT,
  source VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.restore_points (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  restore_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  description TEXT,
  data JSONB,
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.meter_replacement_log (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  old_ieee TEXT NOT NULL,
  new_ieee TEXT NOT NULL,
  meter_name TEXT NOT NULL,
  replaced_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.meter_identity_snapshots (
  id BIGSERIAL PRIMARY KEY,
  ieee_address TEXT NOT NULL,
  meter_number TEXT NOT NULL,
  base_topic TEXT NOT NULL,
  model TEXT,
  snapshot_time TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.connect_test (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  PRIMARY KEY (id)
);

-- =====================================================
-- VIEWS
-- =====================================================

CREATE OR REPLACE VIEW public.latest_meter_readings AS
SELECT DISTINCT ON (meter_id) *
FROM public.meter_readings
ORDER BY meter_id, time DESC;

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_meter_readings_meter_id ON public.meter_readings(meter_id);
CREATE INDEX IF NOT EXISTS idx_meter_readings_time ON public.meter_readings(time DESC);
CREATE INDEX IF NOT EXISTS idx_plugin_data_key ON public.plugin_data(key);
CREATE INDEX IF NOT EXISTS idx_plugin_data_module ON public.plugin_data(module);
CREATE INDEX IF NOT EXISTS idx_seasonal_customers_booking_id ON public.seasonal_customers(booking_id);
CREATE INDEX IF NOT EXISTS idx_regular_customers_booking_id ON public.regular_customers(booking_id);

-- =====================================================
-- DEFAULT DATA
-- =====================================================

INSERT INTO public.organizations (id, name, organization_type, subscription_tier)
VALUES ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Jelling Family Camping', 'camping', 'pro')
ON CONFLICT DO NOTHING;
