-- ========================================
-- FIX: CREATE MISSING TABLES WITH DROP POLICY FIRST
-- Run this in Supabase SQL Editor
-- ========================================

-- Property RERA Info table
CREATE TABLE IF NOT EXISTS public.property_rera_info (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  rera_number TEXT,
  rera_validity_date DATE,
  rera_link TEXT,
  carpet_area_sqft NUMERIC,
  builder_name TEXT,
  project_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(property_id)
);

-- Property Highlights table
CREATE TABLE IF NOT EXISTS public.property_highlights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  icon TEXT,
  title TEXT NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Property Amenities table
CREATE TABLE IF NOT EXISTS public.property_amenities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  icon TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Property Specifications table
CREATE TABLE IF NOT EXISTS public.property_specifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  label TEXT NOT NULL,
  value TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Nearby Places table
CREATE TABLE IF NOT EXISTS public.nearby_places (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  distance TEXT,
  distance_value NUMERIC,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Property Groups table (for TogetherBuying)
CREATE TABLE IF NOT EXISTS public.property_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  target_amount NUMERIC NOT NULL,
  current_amount NUMERIC DEFAULT 0,
  min_investment NUMERIC DEFAULT 500000,
  max_members INTEGER DEFAULT 100,
  status TEXT DEFAULT 'forming' CHECK (status IN ('forming', 'active', 'closed', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Group Members table
CREATE TABLE IF NOT EXISTS public.group_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES public.property_groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  investment_amount NUMERIC NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

-- Enable RLS on all tables
ALTER TABLE public.property_rera_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_highlights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_specifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nearby_places ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

-- DROP existing policies first to avoid conflicts
DROP POLICY IF EXISTS "Anyone can view property rera info" ON public.property_rera_info;
DROP POLICY IF EXISTS "Anyone can view property highlights" ON public.property_highlights;
DROP POLICY IF EXISTS "Anyone can view property amenities" ON public.property_amenities;
DROP POLICY IF EXISTS "Anyone can view property specifications" ON public.property_specifications;
DROP POLICY IF EXISTS "Anyone can view nearby places" ON public.nearby_places;
DROP POLICY IF EXISTS "Anyone can view property groups" ON public.property_groups;
DROP POLICY IF EXISTS "Admins can manage rera info" ON public.property_rera_info;
DROP POLICY IF EXISTS "Admins can manage highlights" ON public.property_highlights;
DROP POLICY IF EXISTS "Admins can manage amenities" ON public.property_amenities;
DROP POLICY IF EXISTS "Admins can manage specifications" ON public.property_specifications;
DROP POLICY IF EXISTS "Admins can manage nearby places" ON public.nearby_places;
DROP POLICY IF EXISTS "Admins can manage property groups" ON public.property_groups;
DROP POLICY IF EXISTS "Users can view their memberships" ON public.group_members;
DROP POLICY IF EXISTS "Users can request to join" ON public.group_members;
DROP POLICY IF EXISTS "Admins can manage members" ON public.group_members;

-- PUBLIC READ policies for property detail tables
CREATE POLICY "Anyone can view property rera info" ON public.property_rera_info FOR SELECT USING (true);
CREATE POLICY "Anyone can view property highlights" ON public.property_highlights FOR SELECT USING (true);
CREATE POLICY "Anyone can view property amenities" ON public.property_amenities FOR SELECT USING (true);
CREATE POLICY "Anyone can view property specifications" ON public.property_specifications FOR SELECT USING (true);
CREATE POLICY "Anyone can view nearby places" ON public.nearby_places FOR SELECT USING (true);
CREATE POLICY "Anyone can view property groups" ON public.property_groups FOR SELECT USING (true);

-- Admin write policies
CREATE POLICY "Admins can manage rera info" ON public.property_rera_info FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);
CREATE POLICY "Admins can manage highlights" ON public.property_highlights FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);
CREATE POLICY "Admins can manage amenities" ON public.property_amenities FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);
CREATE POLICY "Admins can manage specifications" ON public.property_specifications FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);
CREATE POLICY "Admins can manage nearby places" ON public.nearby_places FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);
CREATE POLICY "Admins can manage property groups" ON public.property_groups FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);

-- Group members policies
CREATE POLICY "Users can view their memberships" ON public.group_members FOR SELECT 
  USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));
CREATE POLICY "Users can request to join" ON public.group_members FOR INSERT 
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admins can manage members" ON public.group_members FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);

-- Success
SELECT 'All tables and policies created successfully!' as status;
