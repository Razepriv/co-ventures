-- ========================================
-- COMPREHENSIVE FIX FOR ALL FORM SUBMISSIONS
-- Run this in Supabase SQL Editor
-- ========================================

-- 1. FIX ENQUIRIES TABLE
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;

-- Drop all existing enquiries policies
DROP POLICY IF EXISTS "Anyone can insert enquiries" ON public.enquiries;
DROP POLICY IF EXISTS "Admins can view all enquiries" ON public.enquiries;
DROP POLICY IF EXISTS "Admins can update enquiries" ON public.enquiries;
DROP POLICY IF EXISTS "Admins can delete enquiries" ON public.enquiries;
DROP POLICY IF EXISTS "Admins can manage enquiries" ON public.enquiries;

-- Allow ANYONE (including anonymous) to insert enquiries
CREATE POLICY "Public can insert enquiries" 
  ON public.enquiries
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Admins can do everything with enquiries
CREATE POLICY "Admins full access to enquiries" 
  ON public.enquiries
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- 2. FIX CONTACT MESSAGES TABLE
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can insert contact messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Admins can manage contact messages" ON public.contact_messages;

CREATE POLICY "Public can insert contact messages" 
  ON public.contact_messages
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Admins full access to contact messages" 
  ON public.contact_messages
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- 3. FIX GROUP MEMBERS TABLE (for Invest Now with groups)
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their memberships" ON public.group_members;
DROP POLICY IF EXISTS "Users can request to join" ON public.group_members;
DROP POLICY IF EXISTS "Admins can manage members" ON public.group_members;
DROP POLICY IF EXISTS "Authenticated users can request to join groups" ON public.group_members;

-- Allow authenticated users to insert (join groups)
CREATE POLICY "Authenticated can join groups" 
  ON public.group_members
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Allow users to see their own memberships
CREATE POLICY "Users see own memberships" 
  ON public.group_members
  FOR SELECT
  USING (user_id = auth.uid());

-- Admins can do everything
CREATE POLICY "Admins full access to group members" 
  ON public.group_members
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- 4. FIX PROPERTY LEADS TABLE
ALTER TABLE public.property_leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can insert property leads" ON public.property_leads;
DROP POLICY IF EXISTS "Admins can manage property leads" ON public.property_leads;

CREATE POLICY "Public can insert property leads" 
  ON public.property_leads
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Admins full access to property leads" 
  ON public.property_leads
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- 5. FIX NEWSLETTER SUBSCRIBERS
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can subscribe to newsletter" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Admins can manage newsletter" ON public.newsletter_subscribers;

CREATE POLICY "Public can subscribe to newsletter" 
  ON public.newsletter_subscribers
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Admins full access to newsletter" 
  ON public.newsletter_subscribers
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Verify: Check columns in enquiries table
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'enquiries' AND table_schema = 'public'
ORDER BY ordinal_position;
