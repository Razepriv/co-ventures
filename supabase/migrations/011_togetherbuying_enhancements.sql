-- ========================================
-- TogetherBuying Platform Enhancements
-- Migration: 011_togetherbuying_enhancements
-- ========================================

-- ========================================
-- DEVELOPERS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS public.developers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  logo_url TEXT,
  description TEXT,
  years_of_experience INTEGER,
  total_projects INTEGER,
  website_url TEXT,
  email TEXT,
  phone TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- PROPERTY HIGHLIGHTS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS public.property_highlights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  icon TEXT, -- Lucide icon name
  title TEXT NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- PROPERTY AMENITIES TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS public.property_amenities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT, -- Lucide icon name
  category TEXT CHECK (category IN ('parking', 'security', 'facilities', 'recreation', 'utilities', 'other')),
  is_available BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- PROPERTY SPECIFICATIONS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS public.property_specifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  category TEXT NOT NULL, -- e.g., 'flooring', 'doors', 'electrical', 'interior', 'balcony', 'security'
  specification_key TEXT NOT NULL,
  specification_value TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- NEARBY PLACES TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS public.nearby_places (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  place_type TEXT NOT NULL CHECK (place_type IN ('school', 'restaurant', 'hospital', 'hotel', 'cafe', 'mall', 'bank', 'atm', 'pharmacy', 'gym', 'park', 'other')),
  name TEXT NOT NULL,
  distance_km DECIMAL(5, 2),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- PROPERTY RERA INFO TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS public.property_rera_info (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID UNIQUE NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  rera_number TEXT,
  qr_code_url TEXT,
  status TEXT DEFAULT 'approved' CHECK (status IN ('approved', 'pending', 'expired')),
  description TEXT,
  certificate_url TEXT,
  valid_until DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- PROPERTY GROUPS TABLE (Group Buying)
-- ========================================
CREATE TABLE IF NOT EXISTS public.property_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID UNIQUE NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  total_slots INTEGER NOT NULL DEFAULT 5,
  filled_slots INTEGER DEFAULT 0,
  is_locked BOOLEAN DEFAULT false,
  locked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- GROUP MEMBERS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS public.group_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES public.property_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

-- ========================================
-- PROPERTY LEADS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS public.property_leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  lead_type TEXT NOT NULL CHECK (lead_type IN ('coupon_download', 'join_group', 'book_visit', 'callback_request', 'live_tour')),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'converted', 'closed')),
  assigned_to UUID REFERENCES public.users(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- ADD NEW FIELDS TO PROPERTIES TABLE
-- ========================================
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS developer_id UUID REFERENCES public.developers(id) ON DELETE SET NULL;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS configuration TEXT; -- e.g., "3 BHK"
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS discount_percentage DECIMAL(5, 2) DEFAULT 0;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS total_units INTEGER;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS project_area TEXT;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS slug TEXT;

-- Create unique constraint on slug if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'properties_slug_key'
  ) THEN
    ALTER TABLE public.properties ADD CONSTRAINT properties_slug_key UNIQUE (slug);
  END IF;
END $$;

-- ========================================
-- INDEXES FOR PERFORMANCE
-- ========================================
CREATE INDEX IF NOT EXISTS idx_property_highlights_property ON public.property_highlights(property_id);
CREATE INDEX IF NOT EXISTS idx_property_highlights_order ON public.property_highlights(display_order);
CREATE INDEX IF NOT EXISTS idx_property_amenities_property ON public.property_amenities(property_id);
CREATE INDEX IF NOT EXISTS idx_property_amenities_category ON public.property_amenities(category);
CREATE INDEX IF NOT EXISTS idx_property_specifications_property ON public.property_specifications(property_id);
CREATE INDEX IF NOT EXISTS idx_property_specifications_category ON public.property_specifications(category);
CREATE INDEX IF NOT EXISTS idx_nearby_places_property ON public.nearby_places(property_id);
CREATE INDEX IF NOT EXISTS idx_nearby_places_type ON public.nearby_places(place_type);
CREATE INDEX IF NOT EXISTS idx_property_groups_property ON public.property_groups(property_id);
CREATE INDEX IF NOT EXISTS idx_group_members_group ON public.group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_user ON public.group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_property_leads_property ON public.property_leads(property_id);
CREATE INDEX IF NOT EXISTS idx_property_leads_status ON public.property_leads(status);
CREATE INDEX IF NOT EXISTS idx_property_leads_type ON public.property_leads(lead_type);
CREATE INDEX IF NOT EXISTS idx_developers_active ON public.developers(is_active);

-- ========================================
-- TRIGGERS
-- ========================================

-- Updated_at triggers
CREATE TRIGGER update_developers_updated_at 
  BEFORE UPDATE ON public.developers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_property_rera_updated_at 
  BEFORE UPDATE ON public.property_rera_info
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_property_groups_updated_at 
  BEFORE UPDATE ON public.property_groups
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_property_leads_updated_at 
  BEFORE UPDATE ON public.property_leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- FUNCTION TO UPDATE GROUP FILLED SLOTS
-- ========================================
CREATE OR REPLACE FUNCTION update_group_filled_slots()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.property_groups
  SET filled_slots = (
    SELECT COUNT(*)
    FROM public.group_members
    WHERE group_id = COALESCE(NEW.group_id, OLD.group_id)
  )
  WHERE id = COALESCE(NEW.group_id, OLD.group_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_group_filled_slots
  AFTER INSERT OR DELETE ON public.group_members
  FOR EACH ROW
  EXECUTE FUNCTION update_group_filled_slots();

-- ========================================
-- ROW LEVEL SECURITY (RLS)
-- ========================================

-- Enable RLS on all new tables
ALTER TABLE public.developers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_highlights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_specifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nearby_places ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_rera_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_leads ENABLE ROW LEVEL SECURITY;

-- Developers policies
CREATE POLICY "Anyone can view active developers" ON public.developers
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage developers" ON public.developers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Property highlights policies
CREATE POLICY "Anyone can view property highlights" ON public.property_highlights
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage property highlights" ON public.property_highlights
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Property amenities policies
CREATE POLICY "Anyone can view property amenities" ON public.property_amenities
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage property amenities" ON public.property_amenities
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Property specifications policies
CREATE POLICY "Anyone can view property specifications" ON public.property_specifications
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage property specifications" ON public.property_specifications
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Nearby places policies
CREATE POLICY "Anyone can view nearby places" ON public.nearby_places
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage nearby places" ON public.nearby_places
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Property RERA info policies
CREATE POLICY "Anyone can view property RERA info" ON public.property_rera_info
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage property RERA info" ON public.property_rera_info
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Property groups policies
CREATE POLICY "Anyone can view property groups" ON public.property_groups
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can join groups" ON public.property_groups
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage property groups" ON public.property_groups
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Group members policies
CREATE POLICY "Anyone can view group members" ON public.group_members
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can join" ON public.group_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave their groups" ON public.group_members
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage group members" ON public.group_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Property leads policies
CREATE POLICY "Users can view their own leads" ON public.property_leads
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Anyone can create leads" ON public.property_leads
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view all leads" ON public.property_leads
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can manage leads" ON public.property_leads
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );
