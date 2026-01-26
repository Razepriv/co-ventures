-- ========================================
-- ADMIN PANEL ENHANCEMENTS
-- Add notifications and missing features
-- Migration: 014_admin_panel_features
-- ========================================

-- ========================================
-- NOTIFICATIONS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('enquiry', 'lead', 'contact', 'group_member', 'user_registration', 'property_update')),
  title TEXT NOT NULL,
  message TEXT,
  link TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- SITE SETTINGS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS public.site_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- INDEXES
-- ========================================
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_site_settings_key ON public.site_settings(key);

-- ========================================
-- TRIGGERS
-- ========================================
DROP TRIGGER IF EXISTS update_site_settings_updated_at ON public.site_settings;

CREATE TRIGGER update_site_settings_updated_at
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- RLS POLICIES
-- ========================================
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Users can view their own notifications
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Admins can create notifications
DROP POLICY IF EXISTS "Admins can create notifications" ON public.notifications;
CREATE POLICY "Admins can create notifications" ON public.notifications
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Admins can delete notifications
DROP POLICY IF EXISTS "Admins can delete notifications" ON public.notifications;
CREATE POLICY "Admins can delete notifications" ON public.notifications
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Anyone can view site settings
DROP POLICY IF EXISTS "Anyone can view site settings" ON public.site_settings;
CREATE POLICY "Anyone can view site settings" ON public.site_settings
  FOR SELECT USING (true);

-- Only super admins can manage site settings
DROP POLICY IF EXISTS "Super admins can manage site settings" ON public.site_settings;
CREATE POLICY "Super admins can manage site settings" ON public.site_settings
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- ========================================
-- SEED DEFAULT SETTINGS
-- ========================================
INSERT INTO public.site_settings (key, value) VALUES
  ('company_name', '"Co-Housing Ventures"'::jsonb),
  ('company_email', '"info@cohousingventures.com"'::jsonb),
  ('company_phone', '"+91 9876543210"'::jsonb),
  ('company_address', '"123 Co-Housing Avenue, Bangalore, Karnataka 560001, India"'::jsonb),
  ('default_currency', '"INR"'::jsonb),
  ('enable_group_buying', 'true'::jsonb),
  ('enable_ai_assistant', 'true'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- ========================================
-- ADD MISSING RLS POLICIES
-- ========================================

-- Contact messages - admins can view all
DROP POLICY IF EXISTS "Admins can view contact messages" ON public.contact_messages;
CREATE POLICY "Admins can view contact messages" ON public.contact_messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Contact messages - admins can update
DROP POLICY IF EXISTS "Admins can update contact messages" ON public.contact_messages;
CREATE POLICY "Admins can update contact messages" ON public.contact_messages
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Contact messages - admins can delete
DROP POLICY IF EXISTS "Admins can delete contact messages" ON public.contact_messages;
CREATE POLICY "Admins can delete contact messages" ON public.contact_messages
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Property leads - admins can view all
DROP POLICY IF EXISTS "Admins can view property leads" ON public.property_leads;
CREATE POLICY "Admins can view property leads" ON public.property_leads
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Property leads - admins can update
DROP POLICY IF EXISTS "Admins can update property leads" ON public.property_leads;
CREATE POLICY "Admins can update property leads" ON public.property_leads
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Property leads - admins can delete
DROP POLICY IF EXISTS "Admins can delete property leads" ON public.property_leads;
CREATE POLICY "Admins can delete property leads" ON public.property_leads
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Newsletter subscribers - admins can view all
DROP POLICY IF EXISTS "Admins can view newsletter subscribers" ON public.newsletter_subscribers;
CREATE POLICY "Admins can view newsletter subscribers" ON public.newsletter_subscribers
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Newsletter subscribers - admins can delete
DROP POLICY IF EXISTS "Admins can delete newsletter subscribers" ON public.newsletter_subscribers;
CREATE POLICY "Admins can delete newsletter subscribers" ON public.newsletter_subscribers
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Property groups - admins can manage
DROP POLICY IF EXISTS "Admins can view property groups" ON public.property_groups;
CREATE POLICY "Admins can view property groups" ON public.property_groups
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

DROP POLICY IF EXISTS "Admins can update property groups" ON public.property_groups;
CREATE POLICY "Admins can update property groups" ON public.property_groups
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Group members - admins can manage
DROP POLICY IF EXISTS "Admins can view group members" ON public.group_members;
CREATE POLICY "Admins can view group members" ON public.group_members
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

DROP POLICY IF EXISTS "Admins can delete group members" ON public.group_members;
CREATE POLICY "Admins can delete group members" ON public.group_members
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Developers - admins can manage
DROP POLICY IF EXISTS "Admins can manage developers" ON public.developers;
CREATE POLICY "Admins can manage developers" ON public.developers
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Anyone can view active developers
DROP POLICY IF EXISTS "Anyone can view developers" ON public.developers;
CREATE POLICY "Anyone can view developers" ON public.developers
  FOR SELECT
  USING (is_active = true);
