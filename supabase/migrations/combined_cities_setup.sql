-- ========================================
-- COMBINED CITIES SETUP SCRIPT
-- Run this in Supabase SQL Editor to set up cities
-- ========================================

-- Step 1: Create the cities table if it doesn't exist
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

-- Step 2: Enable RLS
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;

-- Step 3: Create policies (drop first to avoid conflicts)
DROP POLICY IF EXISTS "Anyone can view active cities" ON public.cities;
DROP POLICY IF EXISTS "Admins can manage cities" ON public.cities;

CREATE POLICY "Anyone can view active cities" ON public.cities
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage cities" ON public.cities
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Step 4: Seed all major Indian cities
INSERT INTO public.cities (name, state, display_order, is_active) VALUES
  ('New Delhi', 'Delhi', 1, true),
  ('Mumbai', 'Maharashtra', 2, true),
  ('Bangalore', 'Karnataka', 3, true),
  ('Pune', 'Maharashtra', 4, true),
  ('Hyderabad', 'Telangana', 5, true),
  ('Chennai', 'Tamil Nadu', 6, true),
  ('Kolkata', 'West Bengal', 7, true),
  ('Ahmedabad', 'Gujarat', 8, true),
  ('Gurgaon', 'Haryana', 9, true),
  ('Noida', 'Uttar Pradesh', 10, true),
  ('Jaipur', 'Rajasthan', 11, true),
  ('Surat', 'Gujarat', 12, true),
  ('Lucknow', 'Uttar Pradesh', 13, true),
  ('Kanpur', 'Uttar Pradesh', 14, true),
  ('Nagpur', 'Maharashtra', 15, true),
  ('Indore', 'Madhya Pradesh', 16, true),
  ('Thane', 'Maharashtra', 17, true),
  ('Bhopal', 'Madhya Pradesh', 18, true),
  ('Visakhapatnam', 'Andhra Pradesh', 19, true),
  ('Patna', 'Bihar', 20, true),
  ('Vadodara', 'Gujarat', 21, true),
  ('Ghaziabad', 'Uttar Pradesh', 22, true),
  ('Ludhiana', 'Punjab', 23, true),
  ('Agra', 'Uttar Pradesh', 24, true),
  ('Nashik', 'Maharashtra', 25, true),
  ('Faridabad', 'Haryana', 26, true),
  ('Meerut', 'Uttar Pradesh', 27, true),
  ('Rajkot', 'Gujarat', 28, true),
  ('Kalyan-Dombivli', 'Maharashtra', 29, true),
  ('Vasai-Virar', 'Maharashtra', 30, true),
  ('Varanasi', 'Uttar Pradesh', 31, true),
  ('Srinagar', 'Jammu & Kashmir', 32, true),
  ('Aurangabad', 'Maharashtra', 33, true),
  ('Dhanbad', 'Jharkhand', 34, true),
  ('Amritsar', 'Punjab', 35, true),
  ('Navi Mumbai', 'Maharashtra', 36, true),
  ('Allahabad', 'Uttar Pradesh', 37, true),
  ('Ranchi', 'Jharkhand', 38, true),
  ('Howrah', 'West Bengal', 39, true),
  ('Coimbatore', 'Tamil Nadu', 40, true),
  ('Jabalpur', 'Madhya Pradesh', 41, true),
  ('Gwalior', 'Madhya Pradesh', 42, true),
  ('Vijayawada', 'Andhra Pradesh', 43, true),
  ('Jodhpur', 'Rajasthan', 44, true),
  ('Madurai', 'Tamil Nadu', 45, true),
  ('Raipur', 'Chhattisgarh', 46, true),
  ('Kota', 'Rajasthan', 47, true),
  ('Chandigarh', 'Chandigarh', 48, true),
  ('Guwahati', 'Assam', 49, true),
  ('Solapur', 'Maharashtra', 50, true)
ON CONFLICT (name) 
DO UPDATE SET 
    state = EXCLUDED.state,
    display_order = EXCLUDED.display_order,
    is_active = true;

-- Verify the insert
SELECT COUNT(*) as total_cities FROM public.cities WHERE is_active = true;
