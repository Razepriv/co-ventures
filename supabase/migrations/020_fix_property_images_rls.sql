-- ========================================
-- FIX: Property Images RLS Policies
-- Migration: 020_fix_property_images_rls
-- ========================================

-- Enable RLS on property_images
ALTER TABLE public.property_images ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any (to avoid duplicates)
DROP POLICY IF EXISTS "Anyone can view property images" ON public.property_images;
DROP POLICY IF EXISTS "Admins can manage property images" ON public.property_images;
DROP POLICY IF EXISTS "Admins can insert property images" ON public.property_images;
DROP POLICY IF EXISTS "Admins can update property images" ON public.property_images;
DROP POLICY IF EXISTS "Admins can delete property images" ON public.property_images;

-- PUBLIC READ: Anyone can view property images
CREATE POLICY "Anyone can view property images" 
  ON public.property_images 
  FOR SELECT 
  USING (true);

-- ADMIN: Admins can manage all property images
CREATE POLICY "Admins can manage property images" 
  ON public.property_images 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );
