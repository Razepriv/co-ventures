-- ========================================
-- Co Housing Ventures - Complete Database Setup
-- Run this entire file in Supabase Dashboard → SQL Editor
-- ========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "earthdistance" CASCADE;

-- ========================================
-- TABLES
-- ========================================

-- Users Table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin', 'super_admin')),
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  email_verified BOOLEAN DEFAULT false,
  phone_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Properties Table
CREATE TABLE IF NOT EXISTS public.properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL DEFAULT 'Karnataka',
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  price DECIMAL(15, 2) NOT NULL,
  bedrooms INTEGER NOT NULL DEFAULT 0,
  bathrooms DECIMAL(3, 1) NOT NULL DEFAULT 0,
  area_sqft INTEGER NOT NULL,
  bhk_type TEXT NOT NULL,
  property_type TEXT NOT NULL,
  featured_image TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('available', 'pending', 'sold', 'draft')),
  amenities TEXT[] DEFAULT '{}',
  is_featured BOOLEAN DEFAULT false,
  featured_at TIMESTAMPTZ,
  views INTEGER DEFAULT 0,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Property Images Table
CREATE TABLE IF NOT EXISTS public.property_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  alt_text TEXT,
  is_primary BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enquiries Table
CREATE TABLE IF NOT EXISTS public.enquiries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'closed')),
  assigned_to UUID REFERENCES public.users(id) ON DELETE SET NULL,
  assigned_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Saved Properties Table
CREATE TABLE IF NOT EXISTS public.saved_properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, property_id)
);

-- Newsletter Subscribers Table
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  subscribed BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Blog Posts Table
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  featured_image TEXT NOT NULL,
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  published_at TIMESTAMPTZ,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Testimonials Table
CREATE TABLE IF NOT EXISTS public.testimonials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  role TEXT,
  company TEXT,
  content TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  avatar_url TEXT,
  is_featured BOOLEAN DEFAULT false,
  is_approved BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  approved_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contact Messages Table
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'resolved')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cohousing Interests Table
CREATE TABLE IF NOT EXISTS public.cohousing_interests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  location_preference TEXT NOT NULL,
  budget_range TEXT NOT NULL,
  move_in_timeline TEXT NOT NULL,
  household_size INTEGER NOT NULL,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'converted')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Site Settings Table
CREATE TABLE IF NOT EXISTS public.site_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activity Logs Table
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Media Files Table
CREATE TABLE IF NOT EXISTS public.media_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  file_size INTEGER NOT NULL,
  mime_type TEXT NOT NULL,
  width INTEGER,
  height INTEGER,
  uploaded_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  folder TEXT DEFAULT 'uploads',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- FUNCTIONS & TRIGGERS
-- ========================================

-- Update updated_at timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_categories_updated_at ON public.categories;
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_properties_updated_at ON public.properties;
CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON public.properties
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_enquiries_updated_at ON public.enquiries;
CREATE TRIGGER update_enquiries_updated_at BEFORE UPDATE ON public.enquiries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_newsletter_updated_at ON public.newsletter_subscribers;
CREATE TRIGGER update_newsletter_updated_at BEFORE UPDATE ON public.newsletter_subscribers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_blog_updated_at ON public.blog_posts;
CREATE TRIGGER update_blog_updated_at BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_testimonials_updated_at ON public.testimonials;
CREATE TRIGGER update_testimonials_updated_at BEFORE UPDATE ON public.testimonials
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_contact_updated_at ON public.contact_messages;
CREATE TRIGGER update_contact_updated_at BEFORE UPDATE ON public.contact_messages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_cohousing_updated_at ON public.cohousing_interests;
CREATE TRIGGER update_cohousing_updated_at BEFORE UPDATE ON public.cohousing_interests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_settings_updated_at ON public.site_settings;
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- INDEXES
-- ========================================

-- Properties indexes
CREATE INDEX IF NOT EXISTS idx_properties_status_created ON public.properties(status, created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_properties_featured ON public.properties(is_featured, featured_at DESC) WHERE is_featured = true AND status = 'available' AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_properties_city_status ON public.properties(city, status, created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_properties_category ON public.properties(category_id, status, created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_properties_price ON public.properties(price, status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_properties_bhk ON public.properties(bhk_type, status, created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_properties_user ON public.properties(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_properties_slug ON public.properties(slug) WHERE deleted_at IS NULL;

-- Property images indexes
CREATE INDEX IF NOT EXISTS idx_property_images_property ON public.property_images(property_id, display_order);
CREATE INDEX IF NOT EXISTS idx_property_images_primary ON public.property_images(property_id) WHERE is_primary = true;

-- Enquiries indexes
CREATE INDEX IF NOT EXISTS idx_enquiries_status_created ON public.enquiries(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_enquiries_property ON public.enquiries(property_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_enquiries_user ON public.enquiries(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_enquiries_assigned ON public.enquiries(assigned_to, status, created_at DESC);

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_active ON public.users(is_active, created_at DESC);

-- Blog posts indexes
CREATE INDEX IF NOT EXISTS idx_blog_status_published ON public.blog_posts(status, published_at DESC) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_blog_category ON public.blog_posts(category, published_at DESC) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_blog_tags ON public.blog_posts USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_blog_slug ON public.blog_posts(slug);

-- ========================================
-- ROW LEVEL SECURITY
-- ========================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cohousing_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_files ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all users" ON public.users FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);
CREATE POLICY "Super admins can manage users" ON public.users FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'super_admin')
);

-- Categories policies
CREATE POLICY "Anyone can view active categories" ON public.categories FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage categories" ON public.categories FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);

-- Properties policies
CREATE POLICY "Anyone can view published properties" ON public.properties FOR SELECT USING (status = 'available' AND deleted_at IS NULL);
CREATE POLICY "Users can view own properties" ON public.properties FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all properties" ON public.properties FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);
CREATE POLICY "Admins can manage properties" ON public.properties FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);

-- Enquiries policies
CREATE POLICY "Users can view own enquiries" ON public.enquiries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all enquiries" ON public.enquiries FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);
CREATE POLICY "Anyone can create enquiries" ON public.enquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can manage enquiries" ON public.enquiries FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);

-- Blog posts policies
CREATE POLICY "Anyone can view published blog posts" ON public.blog_posts FOR SELECT USING (status = 'published');
CREATE POLICY "Admins can manage blog posts" ON public.blog_posts FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);

-- Testimonials policies
CREATE POLICY "Anyone can view approved testimonials" ON public.testimonials FOR SELECT USING (is_approved = true);
CREATE POLICY "Anyone can submit testimonials" ON public.testimonials FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can manage testimonials" ON public.testimonials FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);

-- Site settings policies
CREATE POLICY "Admins can view settings" ON public.site_settings FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);
CREATE POLICY "Super admins can manage settings" ON public.site_settings FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'super_admin')
);

-- Activity logs policies
CREATE POLICY "Admins can view activity logs" ON public.activity_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);

-- Media files policies
CREATE POLICY "Admins can manage media" ON public.media_files FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);

-- ========================================
-- REALTIME
-- ========================================

-- Enable Realtime for admin panel
ALTER PUBLICATION supabase_realtime ADD TABLE public.enquiries;
ALTER PUBLICATION supabase_realtime ADD TABLE public.properties;
ALTER PUBLICATION supabase_realtime ADD TABLE public.users;
ALTER PUBLICATION supabase_realtime ADD TABLE public.contact_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.cohousing_interests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.activity_logs;

-- ========================================
-- SEED DATA
-- ========================================

-- Insert default categories
INSERT INTO public.categories (name, slug, description, icon, display_order, is_active) VALUES
  ('Co-Housing', 'co-housing', 'Collaborative housing communities with shared spaces and values', 'Users', 1, true),
  ('Co-Living', 'co-living', 'Modern shared living spaces with private rooms and communal areas', 'Building', 2, true),
  ('Apartments', 'apartments', 'Traditional multi-unit residential buildings', 'Building2', 3, true),
  ('Villas', 'villas', 'Independent luxury homes with premium amenities', 'Home', 4, true),
  ('Plots', 'plots', 'Land parcels for building your dream home', 'Map', 5, true),
  ('Commercial', 'commercial', 'Office spaces and commercial properties', 'Briefcase', 6, true)
ON CONFLICT (slug) DO NOTHING;

-- Insert default site settings
INSERT INTO public.site_settings (key, value, description) VALUES
  ('site_name', '"Co Housing Ventures"', 'Website name'),
  ('site_tagline', '"Find Your Perfect Co-Living Space"', 'Website tagline'),
  ('contact_email', '"info@cohousingventures.com"', 'Primary contact email'),
  ('contact_phone', '"+91 9876543210"', 'Primary contact phone'),
  ('office_address', '"Bangalore, Karnataka, India"', 'Office address')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();

-- ========================================
-- COMPLETION MESSAGE
-- ========================================
DO $$
BEGIN
  RAISE NOTICE '✅ Database schema created successfully!';
  RAISE NOTICE '✅ All tables, indexes, and RLS policies configured';
  RAISE NOTICE '✅ Realtime enabled for admin panel';
  RAISE NOTICE '✅ Seed data inserted';
END $$;
