-- ========================================
-- FIX ENQUIRIES AND GROUP MEMBERS RLS FOR PUBLIC SUBMISSIONS
-- Run this in Supabase SQL Editor
-- ========================================

-- Fix enquiries table for direct client submissions
DROP POLICY IF EXISTS "Anyone can insert enquiries" ON public.enquiries;
CREATE POLICY "Anyone can insert enquiries" 
  ON public.enquiries
  FOR INSERT
  TO public, anon, authenticated
  WITH CHECK (true);

-- Fix group_members for investment requests
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can request to join groups" ON public.group_members;
CREATE POLICY "Authenticated users can request to join groups" 
  ON public.group_members
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can view their own memberships" ON public.group_members;
CREATE POLICY "Users can view their own memberships" 
  ON public.group_members
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can manage group members" ON public.group_members;
CREATE POLICY "Admins can manage group members" 
  ON public.group_members
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Verify enquiries table structure
SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'enquiries' AND table_schema = 'public';
