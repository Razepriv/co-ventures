-- ========================================
-- VERIFY AND FIX ALL FORM SUBMISSIONS & ADMIN OPERATIONS
-- Run this in Supabase SQL Editor
-- ========================================

-- ========================================
-- 1. CREATE MISSING TABLES IF THEY DON'T EXIST
-- ========================================

-- Contact Messages Table
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied', 'closed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enquiries Table
CREATE TABLE IF NOT EXISTS public.enquiries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'converted', 'closed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Newsletter Subscribers Table
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT true,
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  unsubscribed_at TIMESTAMPTZ
);

-- Property Leads Table
CREATE TABLE IF NOT EXISTS public.property_leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  lead_type TEXT NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'converted', 'lost')),
  notes TEXT,
  assigned_to UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- 2. ENABLE RLS ON ALL TABLES
-- ========================================
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_leads ENABLE ROW LEVEL SECURITY;

-- ========================================
-- 3. FIX RLS POLICIES FOR ANONYMOUS FORM SUBMISSIONS
-- ========================================

-- Contact Messages: Allow anyone to insert
DROP POLICY IF EXISTS "Anyone can insert contact messages" ON public.contact_messages;
CREATE POLICY "Anyone can insert contact messages" 
  ON public.contact_messages
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Contact Messages: Admins can do everything
DROP POLICY IF EXISTS "Admins can manage contact messages" ON public.contact_messages;
CREATE POLICY "Admins can manage contact messages" 
  ON public.contact_messages
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Enquiries: Allow anyone to insert
DROP POLICY IF EXISTS "Anyone can insert enquiries" ON public.enquiries;
CREATE POLICY "Anyone can insert enquiries" 
  ON public.enquiries
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Enquiries: Admins can do everything
DROP POLICY IF EXISTS "Admins can manage enquiries" ON public.enquiries;
CREATE POLICY "Admins can manage enquiries" 
  ON public.enquiries
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Newsletter: Allow anyone to subscribe
DROP POLICY IF EXISTS "Anyone can subscribe to newsletter" ON public.newsletter_subscribers;
CREATE POLICY "Anyone can subscribe to newsletter" 
  ON public.newsletter_subscribers
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Newsletter: Admins can manage
DROP POLICY IF EXISTS "Admins can manage newsletter" ON public.newsletter_subscribers;
CREATE POLICY "Admins can manage newsletter" 
  ON public.newsletter_subscribers
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Property Leads: Allow anyone to insert
DROP POLICY IF EXISTS "Anyone can insert property leads" ON public.property_leads;
CREATE POLICY "Anyone can insert property leads" 
  ON public.property_leads
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Property Leads: Admins can do everything
DROP POLICY IF EXISTS "Admins can manage property leads" ON public.property_leads;
CREATE POLICY "Admins can manage property leads" 
  ON public.property_leads
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- ========================================
-- 4. VERIFY PROPERTIES TABLE ADMIN ACCESS
-- ========================================
DROP POLICY IF EXISTS "Admins can manage properties" ON public.properties;
CREATE POLICY "Admins can manage properties" 
  ON public.properties
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- ========================================
-- 5. VERIFY BLOG POSTS TABLE ADMIN ACCESS
-- ========================================
DROP POLICY IF EXISTS "Admins can manage blog posts" ON public.blog_posts;
CREATE POLICY "Admins can manage blog posts" 
  ON public.blog_posts
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Anyone can view published blog posts
DROP POLICY IF EXISTS "Anyone can view published posts" ON public.blog_posts;
CREATE POLICY "Anyone can view published posts" 
  ON public.blog_posts
  FOR SELECT
  USING (status = 'published');

-- ========================================
-- 6. VERIFY TESTIMONIALS TABLE ACCESS
-- ========================================
DROP POLICY IF EXISTS "Anyone can view approved testimonials" ON public.testimonials;
CREATE POLICY "Anyone can view approved testimonials" 
  ON public.testimonials
  FOR SELECT
  USING (is_approved = true);

DROP POLICY IF EXISTS "Admins can manage testimonials" ON public.testimonials;
CREATE POLICY "Admins can manage testimonials" 
  ON public.testimonials
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- ========================================
-- VERIFICATION QUERIES
-- ========================================

-- Check table counts
SELECT 'contact_messages' as table_name, COUNT(*) as count FROM public.contact_messages
UNION ALL
SELECT 'enquiries', COUNT(*) FROM public.enquiries
UNION ALL
SELECT 'newsletter_subscribers', COUNT(*) FROM public.newsletter_subscribers
UNION ALL
SELECT 'property_leads', COUNT(*) FROM public.property_leads
UNION ALL
SELECT 'properties', COUNT(*) FROM public.properties
UNION ALL
SELECT 'blog_posts', COUNT(*) FROM public.blog_posts
UNION ALL
SELECT 'testimonials', COUNT(*) FROM public.testimonials
UNION ALL
SELECT 'cities', COUNT(*) FROM public.cities;
