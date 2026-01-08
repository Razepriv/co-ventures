-- Fix for Infinite Recursion in RLS Policies
-- Run this in Supabase Dashboard → SQL Editor

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Super admins can manage users" ON public.users;
DROP POLICY IF EXISTS "Admins can manage categories" ON public.categories;
DROP POLICY IF EXISTS "Admins can view all properties" ON public.properties;
DROP POLICY IF EXISTS "Admins can manage properties" ON public.properties;
DROP POLICY IF EXISTS "Admins can view all enquiries" ON public.enquiries;
DROP POLICY IF EXISTS "Admins can manage enquiries" ON public.enquiries;
DROP POLICY IF EXISTS "Admins can manage blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Admins can manage testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Admins can view settings" ON public.site_settings;
DROP POLICY IF EXISTS "Super admins can manage settings" ON public.site_settings;
DROP POLICY IF EXISTS "Admins can view activity logs" ON public.activity_logs;
DROP POLICY IF EXISTS "Admins can manage media" ON public.media_files;

-- Create a helper function to check if user is admin (cached in session)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT role IN ('admin', 'super_admin')
    FROM public.users
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT role = 'super_admin'
    FROM public.users
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Recreate users policies using function
CREATE POLICY "Admins can view all users" ON public.users
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Super admins can manage users" ON public.users
  FOR ALL USING (public.is_super_admin());

-- Recreate categories policies
CREATE POLICY "Admins can manage categories" ON public.categories
  FOR ALL USING (public.is_admin());

-- Recreate properties policies  
CREATE POLICY "Admins can view all properties" ON public.properties
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can manage properties" ON public.properties
  FOR ALL USING (public.is_admin());

-- Recreate enquiries policies
CREATE POLICY "Admins can view all enquiries" ON public.enquiries
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can manage enquiries" ON public.enquiries
  FOR ALL USING (public.is_admin());

-- Recreate blog posts policies
CREATE POLICY "Admins can manage blog posts" ON public.blog_posts
  FOR ALL USING (public.is_admin());

-- Recreate testimonials policies
CREATE POLICY "Admins can manage testimonials" ON public.testimonials
  FOR ALL USING (public.is_admin());

-- Recreate site settings policies
CREATE POLICY "Admins can view settings" ON public.site_settings
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Super admins can manage settings" ON public.site_settings
  FOR ALL USING (public.is_super_admin());

-- Recreate activity logs policies
CREATE POLICY "Admins can view activity logs" ON public.activity_logs
  FOR SELECT USING (public.is_admin());

-- Recreate media files policies
CREATE POLICY "Admins can manage media" ON public.media_files
  FOR ALL USING (public.is_admin());

-- Grant execute permissions on helper functions
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_super_admin() TO authenticated;
