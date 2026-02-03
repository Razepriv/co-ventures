-- ========================================
-- FIX NOTIFICATIONS RLS POLICIES
-- Replace all inline EXISTS subqueries with optimized is_admin() function
-- This significantly improves query performance
-- ========================================

-- Ensure the is_admin() function exists (from migration 022)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN COALESCE(
    (SELECT role IN ('admin', 'super_admin')
     FROM public.users
     WHERE id = auth.uid()),
    false
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon;

-- ========================================
-- Drop ALL existing notification policies
-- ========================================
DROP POLICY IF EXISTS "Admin users can view admin notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can view their notifications" ON public.notifications;
DROP POLICY IF EXISTS "Admin users can update admin notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Admin users can delete admin notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can delete their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;
DROP POLICY IF EXISTS "Admins can create notifications" ON public.notifications;
DROP POLICY IF EXISTS "Admins can delete notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;

-- ========================================
-- Create optimized SELECT policies
-- ========================================

-- Admins can view admin/all notifications
CREATE POLICY "notifications_select_admin" ON public.notifications
  FOR SELECT TO authenticated
  USING (
    target_audience IN ('admin', 'all') AND public.is_admin()
  );

-- Users can view user/all notifications (either global or specifically for them)
CREATE POLICY "notifications_select_user" ON public.notifications
  FOR SELECT TO authenticated
  USING (
    target_audience IN ('user', 'all') AND
    (user_id IS NULL OR user_id = auth.uid())
  );

-- ========================================
-- Create optimized UPDATE policies
-- ========================================

-- Admins can update admin/all notifications
CREATE POLICY "notifications_update_admin" ON public.notifications
  FOR UPDATE TO authenticated
  USING (target_audience IN ('admin', 'all') AND public.is_admin())
  WITH CHECK (target_audience IN ('admin', 'all') AND public.is_admin());

-- Users can update their own notifications
CREATE POLICY "notifications_update_user" ON public.notifications
  FOR UPDATE TO authenticated
  USING (
    target_audience IN ('user', 'all') AND
    (user_id IS NULL OR user_id = auth.uid())
  )
  WITH CHECK (
    target_audience IN ('user', 'all') AND
    (user_id IS NULL OR user_id = auth.uid())
  );

-- ========================================
-- Create optimized DELETE policies
-- ========================================

-- Admins can delete any notification
CREATE POLICY "notifications_delete_admin" ON public.notifications
  FOR DELETE TO authenticated
  USING (public.is_admin());

-- Users can delete their own notifications
CREATE POLICY "notifications_delete_user" ON public.notifications
  FOR DELETE TO authenticated
  USING (
    target_audience IN ('user', 'all') AND
    (user_id IS NULL OR user_id = auth.uid())
  );

-- ========================================
-- Create INSERT policy
-- ========================================

-- Allow system/triggers to insert notifications
CREATE POLICY "notifications_insert" ON public.notifications
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- Also allow service role and triggers
ALTER TABLE public.notifications FORCE ROW LEVEL SECURITY;

-- ========================================
-- Add index for faster notification queries
-- ========================================
CREATE INDEX IF NOT EXISTS idx_notifications_target_read ON public.notifications(target_audience, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_user_target ON public.notifications(user_id, target_audience);

SELECT 'Notifications RLS policies optimized!' as status;
