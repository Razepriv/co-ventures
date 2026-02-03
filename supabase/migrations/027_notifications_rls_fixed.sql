-- ========================================
-- RE-ENABLE RLS WITH OPTIMIZED POLICIES
-- Fixes user-specific notification visibility
-- ========================================

-- Re-enable RLS on notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Drop all existing notification policies
DROP POLICY IF EXISTS "notifications_select_admin" ON public.notifications;
DROP POLICY IF EXISTS "notifications_select_user" ON public.notifications;
DROP POLICY IF EXISTS "notifications_update_admin" ON public.notifications;
DROP POLICY IF EXISTS "notifications_update_user" ON public.notifications;
DROP POLICY IF EXISTS "notifications_delete_admin" ON public.notifications;
DROP POLICY IF EXISTS "notifications_delete_user" ON public.notifications;
DROP POLICY IF EXISTS "notifications_insert" ON public.notifications;
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
-- SIMPLE SELECT POLICY
-- Users see notifications that are:
-- 1. Targeted to 'user' or 'all' AND (user_id is null OR user_id matches them)
-- 2. OR they are admin and notification is for 'admin' or 'all'
-- ========================================

CREATE POLICY "notifications_view" ON public.notifications
  FOR SELECT
  USING (
    -- User-targeted notifications: must match user_id or be broadcast (user_id IS NULL)
    (
      target_audience IN ('user', 'all')
      AND (user_id IS NULL OR user_id = auth.uid())
    )
    OR
    -- Admin-targeted notifications: check if user is admin
    (
      target_audience IN ('admin', 'all')
      AND EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid()
        AND role IN ('admin', 'super_admin')
      )
    )
  );

-- ========================================
-- UPDATE POLICY - same logic as SELECT
-- ========================================

CREATE POLICY "notifications_update" ON public.notifications
  FOR UPDATE
  USING (
    (target_audience IN ('user', 'all') AND (user_id IS NULL OR user_id = auth.uid()))
    OR
    (target_audience IN ('admin', 'all') AND EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    ))
  );

-- ========================================
-- DELETE POLICY
-- ========================================

CREATE POLICY "notifications_delete" ON public.notifications
  FOR DELETE
  USING (
    (target_audience IN ('user', 'all') AND (user_id IS NULL OR user_id = auth.uid()))
    OR
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

-- ========================================
-- INSERT POLICY - allow authenticated users (for triggers/system)
-- ========================================

CREATE POLICY "notifications_insert" ON public.notifications
  FOR INSERT
  WITH CHECK (true);

SELECT 'Notifications RLS re-enabled with user-specific filtering!' as status;
