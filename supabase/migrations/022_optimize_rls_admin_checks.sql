-- ========================================
-- OPTIMIZE RLS ADMIN CHECKS
-- Replace all inline EXISTS subqueries with cached SECURITY DEFINER STABLE functions
-- This allows Postgres to evaluate the admin check once per statement instead of per-row
-- ========================================

-- 1. Ensure is_admin() function exists with STABLE marker for query planner optimization
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

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_super_admin() TO authenticated;

-- ========================================
-- 2. ENQUIRIES - Replace inline EXISTS with is_admin()
-- ========================================
DROP POLICY IF EXISTS "Admins can view all enquiries" ON public.enquiries;
CREATE POLICY "Admins can view all enquiries" ON public.enquiries
  FOR SELECT TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update enquiries" ON public.enquiries;
CREATE POLICY "Admins can update enquiries" ON public.enquiries
  FOR UPDATE TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete enquiries" ON public.enquiries;
CREATE POLICY "Admins can delete enquiries" ON public.enquiries
  FOR DELETE TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage enquiries" ON public.enquiries;
CREATE POLICY "Admins can manage enquiries" ON public.enquiries
  FOR ALL TO authenticated
  USING (public.is_admin());

-- ========================================
-- 3. CONTACT MESSAGES - Replace inline EXISTS with is_admin()
-- ========================================
DROP POLICY IF EXISTS "Admins can view contact messages" ON public.contact_messages;
CREATE POLICY "Admins can view contact messages" ON public.contact_messages
  FOR SELECT TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update contact messages" ON public.contact_messages;
CREATE POLICY "Admins can update contact messages" ON public.contact_messages
  FOR UPDATE TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete contact messages" ON public.contact_messages;
CREATE POLICY "Admins can delete contact messages" ON public.contact_messages
  FOR DELETE TO authenticated
  USING (public.is_admin());

-- ========================================
-- 4. PROPERTY LEADS - Replace inline EXISTS with is_admin()
-- ========================================
DROP POLICY IF EXISTS "Admins can view property leads" ON public.property_leads;
CREATE POLICY "Admins can view property leads" ON public.property_leads
  FOR SELECT TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update property leads" ON public.property_leads;
CREATE POLICY "Admins can update property leads" ON public.property_leads
  FOR UPDATE TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete property leads" ON public.property_leads;
CREATE POLICY "Admins can delete property leads" ON public.property_leads
  FOR DELETE TO authenticated
  USING (public.is_admin());

-- ========================================
-- 5. NOTIFICATIONS - Replace inline EXISTS with is_admin()
-- ========================================
DROP POLICY IF EXISTS "Admins can create notifications" ON public.notifications;
CREATE POLICY "Admins can create notifications" ON public.notifications
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete notifications" ON public.notifications;
CREATE POLICY "Admins can delete notifications" ON public.notifications
  FOR DELETE TO authenticated
  USING (public.is_admin());

-- ========================================
-- 6. NEWSLETTER SUBSCRIBERS - Replace inline EXISTS with is_admin()
-- ========================================
DROP POLICY IF EXISTS "Admins can view newsletter subscribers" ON public.newsletter_subscribers;
CREATE POLICY "Admins can view newsletter subscribers" ON public.newsletter_subscribers
  FOR SELECT TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete newsletter subscribers" ON public.newsletter_subscribers;
CREATE POLICY "Admins can delete newsletter subscribers" ON public.newsletter_subscribers
  FOR DELETE TO authenticated
  USING (public.is_admin());

-- ========================================
-- 7. PROPERTY GROUPS - Replace inline EXISTS with is_admin()
-- ========================================
DROP POLICY IF EXISTS "Admins can view property groups" ON public.property_groups;
CREATE POLICY "Admins can view property groups" ON public.property_groups
  FOR SELECT TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update property groups" ON public.property_groups;
CREATE POLICY "Admins can update property groups" ON public.property_groups
  FOR UPDATE TO authenticated
  USING (public.is_admin());

-- ========================================
-- 8. GROUP MEMBERS - Replace inline EXISTS with is_admin()
-- ========================================
DROP POLICY IF EXISTS "Admins can view group members" ON public.group_members;
CREATE POLICY "Admins can view group members" ON public.group_members
  FOR SELECT TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete group members" ON public.group_members;
CREATE POLICY "Admins can delete group members" ON public.group_members
  FOR DELETE TO authenticated
  USING (public.is_admin());

-- ========================================
-- 9. DEVELOPERS - Replace inline EXISTS with is_admin()
-- ========================================
DROP POLICY IF EXISTS "Admins can manage developers" ON public.developers;
CREATE POLICY "Admins can manage developers" ON public.developers
  FOR ALL TO authenticated
  USING (public.is_admin());

-- ========================================
-- 10. SITE SETTINGS - Replace inline EXISTS with is_super_admin()
-- ========================================
DROP POLICY IF EXISTS "Super admins can manage site settings" ON public.site_settings;
CREATE POLICY "Super admins can manage site settings" ON public.site_settings
  FOR ALL TO authenticated
  USING (public.is_super_admin());

-- ========================================
-- 11. PROPERTIES - Replace inline EXISTS with is_admin()
-- ========================================
DROP POLICY IF EXISTS "Admins can view all properties" ON public.properties;
CREATE POLICY "Admins can view all properties" ON public.properties
  FOR SELECT TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage properties" ON public.properties;
CREATE POLICY "Admins can manage properties" ON public.properties
  FOR ALL TO authenticated
  USING (public.is_admin());

-- ========================================
-- 12. ACTIVITY LOGS - Replace inline EXISTS with is_admin()
-- ========================================
DROP POLICY IF EXISTS "Admins can view activity logs" ON public.activity_logs;
CREATE POLICY "Admins can view activity logs" ON public.activity_logs
  FOR SELECT TO authenticated
  USING (public.is_admin());

-- ========================================
-- 13. BLOG POSTS - Replace inline EXISTS with is_admin()
-- ========================================
DROP POLICY IF EXISTS "Admins can manage blog posts" ON public.blog_posts;
CREATE POLICY "Admins can manage blog posts" ON public.blog_posts
  FOR ALL TO authenticated
  USING (public.is_admin());

-- ========================================
-- 14. TESTIMONIALS - Replace inline EXISTS with is_admin()
-- ========================================
DROP POLICY IF EXISTS "Admins can manage testimonials" ON public.testimonials;
CREATE POLICY "Admins can manage testimonials" ON public.testimonials
  FOR ALL TO authenticated
  USING (public.is_admin());

-- ========================================
-- 15. MEDIA FILES - Replace inline EXISTS with is_admin()
-- ========================================
DROP POLICY IF EXISTS "Admins can manage media" ON public.media_files;
CREATE POLICY "Admins can manage media" ON public.media_files
  FOR ALL TO authenticated
  USING (public.is_admin());

-- ========================================
-- 16. CATEGORIES - Replace inline EXISTS with is_admin()
-- ========================================
DROP POLICY IF EXISTS "Admins can manage categories" ON public.categories;
CREATE POLICY "Admins can manage categories" ON public.categories
  FOR ALL TO authenticated
  USING (public.is_admin());

-- ========================================
-- 17. Add composite index for faster admin role lookups
-- ========================================
CREATE INDEX IF NOT EXISTS idx_users_id_role ON public.users(id, role);

SELECT 'RLS admin check optimization complete!' as status;
