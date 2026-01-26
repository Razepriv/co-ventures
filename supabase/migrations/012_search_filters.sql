-- ========================================
-- Search & Filter System
-- Migration: 012_search_filters
-- ========================================

-- ========================================
-- CITIES TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS public.cities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  state TEXT,
  country TEXT DEFAULT 'India',
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- CITY LOCATIONS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS public.city_locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  city_id UUID NOT NULL REFERENCES public.cities(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(city_id, name)
);

-- ========================================
-- PROPERTY CONFIGURATIONS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS public.property_configurations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  category TEXT DEFAULT 'residential',
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- ADD COLUMNS TO PROPERTIES TABLE
-- ========================================
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS city_id UUID REFERENCES public.cities(id) ON DELETE SET NULL;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS location_id UUID REFERENCES public.city_locations(id) ON DELETE SET NULL;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS configuration_id UUID REFERENCES public.property_configurations(id) ON DELETE SET NULL;

-- ========================================
-- INDEXES FOR PERFORMANCE
-- ========================================
CREATE INDEX IF NOT EXISTS idx_cities_active ON public.cities(is_active, display_order);
CREATE INDEX IF NOT EXISTS idx_city_locations_city ON public.city_locations(city_id);
CREATE INDEX IF NOT EXISTS idx_city_locations_active ON public.city_locations(is_active);
CREATE INDEX IF NOT EXISTS idx_property_configurations_active ON public.property_configurations(is_active, display_order);
CREATE INDEX IF NOT EXISTS idx_properties_city ON public.properties(city_id);
CREATE INDEX IF NOT EXISTS idx_properties_location ON public.properties(location_id);
CREATE INDEX IF NOT EXISTS idx_properties_configuration ON public.properties(configuration_id);
CREATE INDEX IF NOT EXISTS idx_properties_price ON public.properties(price);

-- ========================================
-- TRIGGERS
-- ========================================
CREATE TRIGGER update_cities_updated_at 
  BEFORE UPDATE ON public.cities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_city_locations_updated_at 
  BEFORE UPDATE ON public.city_locations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_property_configurations_updated_at 
  BEFORE UPDATE ON public.property_configurations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- ROW LEVEL SECURITY (RLS)
-- ========================================
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.city_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_configurations ENABLE ROW LEVEL SECURITY;

-- Cities policies
CREATE POLICY "Anyone can view active cities" ON public.cities
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage cities" ON public.cities
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- City locations policies
CREATE POLICY "Anyone can view active locations" ON public.city_locations
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage locations" ON public.city_locations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Property configurations policies
CREATE POLICY "Anyone can view active configurations" ON public.property_configurations
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage configurations" ON public.property_configurations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- ========================================
-- SEED DATA
-- ========================================

-- Insert cities
INSERT INTO public.cities (name, state, display_order) VALUES
  ('New Delhi', 'Delhi', 1),
  ('Mumbai', 'Maharashtra', 2),
  ('Bangalore', 'Karnataka', 3),
  ('Pune', 'Maharashtra', 4),
  ('Hyderabad', 'Telangana', 5)
ON CONFLICT (name) DO NOTHING;

-- Insert Delhi locations (using the exact names from the image)
INSERT INTO public.city_locations (city_id, name, display_order)
SELECT c.id, loc.name, loc.ord
FROM public.cities c
CROSS JOIN (VALUES
  ('Kirti Nagar', 1),
  ('Lawrence Road', 2),
  ('Dwarka', 3),
  ('Rohini', 4),
  ('Shahdara', 5),
  ('West Delhi', 6),
  ('South Delhi', 7),
  ('Central Delhi', 8)
) AS loc(name, ord)
WHERE c.name = 'New Delhi'
ON CONFLICT (city_id, name) DO NOTHING;

-- Insert configurations (exact names from image)
INSERT INTO public.property_configurations (name, display_order) VALUES
  ('2 BHK', 1),
  ('3 BHK', 2),
  ('3 BHK + CSP', 3),
  ('3 BHK + S', 4),
  ('4 BHK', 5),
  ('4 BHK + S', 6),
  ('5 BHK', 7),
  ('Penthouse', 8)
ON CONFLICT (name) DO NOTHING;
