-- ========================================
-- FIX CITIES PUBLIC ACCESS
-- Ensure anyone can view cities without authentication
-- Run this in Supabase SQL Editor
-- ========================================

-- Drop existing restrictive policy
DROP POLICY IF EXISTS "Anyone can view active cities" ON public.cities;

-- Create a simpler policy that allows ALL users (including anonymous) to view cities
CREATE POLICY "Public can view active cities"
  ON public.cities
  FOR SELECT
  TO public
  USING (is_active = true);

-- Also ensure anon role can read
CREATE POLICY "Anon can view active cities"
  ON public.cities
  FOR SELECT
  TO anon
  USING (is_active = true);

-- Also for authenticated users
CREATE POLICY "Authenticated can view active cities"
  ON public.cities
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Verify the fix
SELECT id, name, state FROM public.cities WHERE is_active = true ORDER BY display_order LIMIT 5;
