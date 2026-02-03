-- ========================================
-- ADD GROUP MEMBERSHIP NOTIFICATIONS
-- When a user is added to an investment group, they receive a notification
-- ========================================

-- 1. Update the notifications table CHECK constraint to include 'group_added' type
ALTER TABLE public.notifications
DROP CONSTRAINT IF EXISTS notifications_type_check;

ALTER TABLE public.notifications
ADD CONSTRAINT notifications_type_check
CHECK (type IN ('new_user', 'new_enquiry', 'new_property', 'property_update', 'enquiry_update', 'new_blog', 'new_testimonial', 'group_added'));

-- 2. Create function to notify user when added to a group
CREATE OR REPLACE FUNCTION public.create_group_added_notification()
RETURNS TRIGGER AS $$
DECLARE
  property_title TEXT;
  property_id UUID;
BEGIN
  -- Get property info from the group
  SELECT p.title, p.id INTO property_title, property_id
  FROM public.property_groups pg
  JOIN public.properties p ON p.id = pg.property_id
  WHERE pg.id = NEW.group_id;

  -- Create notification for the user who was added
  INSERT INTO public.notifications (
    user_id,
    type,
    title,
    message,
    link,
    target_audience,
    metadata
  )
  VALUES (
    NEW.user_id,
    'group_added',
    'You''ve Joined an Investment Group!',
    'Congratulations! You''re now part of the investment group for "' || COALESCE(property_title, 'a property') || '". View the property details and track your group''s progress.',
    '/properties/' || property_id,
    'user',
    jsonb_build_object(
      'group_id', NEW.group_id,
      'property_id', property_id,
      'property_title', property_title,
      'member_name', NEW.full_name,
      'member_email', NEW.email,
      'joined_at', NEW.joined_at
    )
  );

  -- Also notify admins about new group member
  INSERT INTO public.notifications (
    type,
    title,
    message,
    link,
    target_audience,
    metadata
  )
  VALUES (
    'new_user',
    'New Group Member',
    '"' || NEW.full_name || '" has joined the investment group for "' || COALESCE(property_title, 'a property') || '".',
    '/admin/properties',
    'admin',
    jsonb_build_object(
      'group_id', NEW.group_id,
      'property_id', property_id,
      'property_title', property_title,
      'member_id', NEW.user_id,
      'member_name', NEW.full_name,
      'member_email', NEW.email
    )
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create trigger for group member notifications
DROP TRIGGER IF EXISTS trigger_group_added_notification ON public.group_members;
CREATE TRIGGER trigger_group_added_notification
AFTER INSERT ON public.group_members
FOR EACH ROW
EXECUTE FUNCTION public.create_group_added_notification();

-- 4. Add index for user-specific notification queries (improves performance)
CREATE INDEX IF NOT EXISTS idx_notifications_user_target ON public.notifications(user_id, target_audience);

SELECT 'Group membership notifications enabled!' as status;
