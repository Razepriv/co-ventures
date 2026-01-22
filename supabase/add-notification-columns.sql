-- Add missing columns to existing notifications table
-- Run this if you already have a notifications table

-- Add user_id column (optional, for future user-specific notifications)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'notifications' 
    AND column_name = 'user_id'
  ) THEN
    ALTER TABLE public.notifications 
    ADD COLUMN user_id UUID REFERENCES public.users(id) ON DELETE CASCADE;
    
    RAISE NOTICE 'Added user_id column to notifications table';
  ELSE
    RAISE NOTICE 'user_id column already exists';
  END IF;
END $$;

-- Add target_audience column (required for dual notification system)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'notifications' 
    AND column_name = 'target_audience'
  ) THEN
    -- Add column with default value 'admin'
    ALTER TABLE public.notifications 
    ADD COLUMN target_audience TEXT NOT NULL DEFAULT 'admin' 
    CHECK (target_audience IN ('admin', 'user', 'all'));
    
    RAISE NOTICE 'Added target_audience column to notifications table';
  ELSE
    RAISE NOTICE 'target_audience column already exists';
  END IF;
END $$;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_target_audience ON public.notifications(target_audience);

-- Drop old policies
DROP POLICY IF EXISTS "Admin users can view all notifications" ON public.notifications;
DROP POLICY IF EXISTS "Admin users can update notifications" ON public.notifications;
DROP POLICY IF EXISTS "Admin users can delete notifications" ON public.notifications;
DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can delete their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Admin users can view admin notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can view their notifications" ON public.notifications;
DROP POLICY IF EXISTS "Admin users can update admin notifications" ON public.notifications;
DROP POLICY IF EXISTS "Admin users can delete admin notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can delete their own notifications" ON public.notifications;

-- Create new policies for dual notification system
-- Admin users can see all admin-targeted notifications
CREATE POLICY "Admin users can view admin notifications"
ON public.notifications
FOR SELECT
TO authenticated
USING (
  target_audience IN ('admin', 'all') AND
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.role IN ('super_admin', 'admin')
  )
);

-- Regular users can see user-targeted notifications
CREATE POLICY "Users can view their notifications"
ON public.notifications
FOR SELECT
TO authenticated
USING (
  target_audience IN ('user', 'all') AND
  (user_id IS NULL OR user_id = auth.uid())
);

-- Admin users can update admin notifications (mark as read)
CREATE POLICY "Admin users can update admin notifications"
ON public.notifications
FOR UPDATE
TO authenticated
USING (
  target_audience IN ('admin', 'all') AND
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.role IN ('super_admin', 'admin')
  )
)
WITH CHECK (
  target_audience IN ('admin', 'all') AND
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.role IN ('super_admin', 'admin')
  )
);

-- Users can update their own notifications
CREATE POLICY "Users can update their own notifications"
ON public.notifications
FOR UPDATE
TO authenticated
USING (
  target_audience IN ('user', 'all') AND
  (user_id IS NULL OR user_id = auth.uid())
)
WITH CHECK (
  target_audience IN ('user', 'all') AND
  (user_id IS NULL OR user_id = auth.uid())
);

-- Admin users can delete admin notifications
CREATE POLICY "Admin users can delete admin notifications"
ON public.notifications
FOR DELETE
TO authenticated
USING (
  target_audience IN ('admin', 'all') AND
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.role IN ('super_admin', 'admin')
  )
);

-- Users can delete their own notifications
CREATE POLICY "Users can delete their own notifications"
ON public.notifications
FOR DELETE
TO authenticated
USING (
  target_audience IN ('user', 'all') AND
  (user_id IS NULL OR user_id = auth.uid())
);

-- System can insert notifications
CREATE POLICY "System can insert notifications"
ON public.notifications
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Notification table columns and policies updated successfully!';
  RAISE NOTICE '📋 Added: user_id and target_audience columns';
  RAISE NOTICE '🔒 Updated RLS policies for dual notification system';
END $$;
