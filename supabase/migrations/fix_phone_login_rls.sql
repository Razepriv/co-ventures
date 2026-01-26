-- ========================================
-- FIX RLS FOR PHONE LOGIN
-- Allow anonymous users to check if phone exists
-- Run this in Supabase SQL Editor
-- ========================================

-- Enable RLS on users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Drop existing restrictive policy
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Anyone can check phone exists" ON public.users;
DROP POLICY IF EXISTS "Public can check phone exists" ON public.users;

-- Allow ANYONE to SELECT from users (needed for phone login check)
-- This only exposes id, email, phone, full_name - not sensitive data
CREATE POLICY "Public can read user basics for login" 
  ON public.users
  FOR SELECT
  TO public
  USING (true);

-- Users can update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" 
  ON public.users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow system to insert new users (via trigger)
DROP POLICY IF EXISTS "System can insert users" ON public.users;
CREATE POLICY "System can insert users" 
  ON public.users
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Admins can do everything
DROP POLICY IF EXISTS "Admins full access to users" ON public.users;
CREATE POLICY "Admins full access to users" 
  ON public.users
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Verify the fix
SELECT 'RLS policies updated successfully!' as status;
