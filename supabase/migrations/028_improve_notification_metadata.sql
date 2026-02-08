-- ========================================
-- IMPROVE NOTIFICATION METADATA FOR DEEP-LINKING
-- Ensures all notifications have proper IDs in metadata for admin panel navigation
-- ========================================

-- 1. Update notification type constraint to include 'contact_submission' and 'group_member'
ALTER TABLE public.notifications
DROP CONSTRAINT IF EXISTS notifications_type_check;

ALTER TABLE public.notifications
ADD CONSTRAINT notifications_type_check
CHECK (type IN (
  'new_user', 'new_enquiry', 'new_property', 'property_update', 'enquiry_update', 
  'new_blog', 'new_testimonial', 'group_added', 'group_member', 'contact_submission',
  'new_lead', 'lead_update'
));

-- 2. Create notification trigger for contact form submissions
CREATE OR REPLACE FUNCTION public.create_contact_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Notify admins about new contact form submissions
  INSERT INTO public.notifications (type, title, message, link, target_audience, metadata)
  VALUES (
    'contact_submission',
    'New Contact Message',
    'New message from "' || NEW.full_name || '" - ' || COALESCE(NEW.subject, 'General Inquiry'),
    '/admin/contacts/' || NEW.id,
    'admin',
    jsonb_build_object(
      'contact_id', NEW.id,
      'name', NEW.full_name,
      'email', NEW.email,
      'subject', NEW.subject
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for contact messages
DROP TRIGGER IF EXISTS trigger_contact_notification ON public.contact_messages;
CREATE TRIGGER trigger_contact_notification
AFTER INSERT ON public.contact_messages
FOR EACH ROW
EXECUTE FUNCTION public.create_contact_notification();

-- 3. Update the group member notification function to use proper type and link
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

  -- Notify admins about new group member (with proper type and link)
  INSERT INTO public.notifications (
    type,
    title,
    message,
    link,
    target_audience,
    metadata
  )
  VALUES (
    'group_member',
    'New Group Member',
    '"' || NEW.full_name || '" has joined the investment group for "' || COALESCE(property_title, 'a property') || '".',
    '/admin/groups/' || NEW.group_id,
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

-- 4. Update enquiry notification to include direct link
CREATE OR REPLACE FUNCTION public.create_new_enquiry_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Notify admins about new enquiries with direct link
  INSERT INTO public.notifications (type, title, message, link, target_audience, metadata)
  VALUES (
    'new_enquiry',
    'New Enquiry Received',
    'New enquiry from "' || NEW.name || '" regarding "' || COALESCE(NEW.subject, 'General Enquiry') || '".',
    '/admin/enquiries/' || NEW.id,
    'admin',
    jsonb_build_object(
      'enquiry_id', NEW.id,
      'name', NEW.name,
      'email', NEW.email,
      'subject', NEW.subject,
      'property_id', NEW.property_id
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Create lead notification trigger
CREATE OR REPLACE FUNCTION public.create_lead_notification()
RETURNS TRIGGER AS $$
DECLARE
  property_title TEXT;
BEGIN
  -- Get property title if property_id exists
  IF NEW.property_id IS NOT NULL THEN
    SELECT title INTO property_title
    FROM public.properties
    WHERE id = NEW.property_id;
  END IF;

  -- Notify admins about new leads
  INSERT INTO public.notifications (type, title, message, link, target_audience, metadata)
  VALUES (
    'new_lead',
    'New Lead',
    'New ' || COALESCE(NEW.lead_type, 'general') || ' lead from "' || NEW.full_name || '"' || 
    CASE WHEN property_title IS NOT NULL THEN ' for "' || property_title || '"' ELSE '' END,
    '/admin/leads/' || NEW.id,
    'admin',
    jsonb_build_object(
      'lead_id', NEW.id,
      'name', NEW.full_name,
      'email', NEW.email,
      'lead_type', NEW.lead_type,
      'property_id', NEW.property_id,
      'property_title', property_title
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for leads
DROP TRIGGER IF EXISTS trigger_lead_notification ON public.property_leads;
CREATE TRIGGER trigger_lead_notification
AFTER INSERT ON public.property_leads
FOR EACH ROW
EXECUTE FUNCTION public.create_lead_notification();

-- 6. Update user registration notification to include direct link
CREATE OR REPLACE FUNCTION public.create_new_user_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create notification for non-admin users (notify admins)
  IF NEW.role = 'user' THEN
    INSERT INTO public.notifications (type, title, message, link, target_audience, metadata)
    VALUES (
      'new_user',
      'New User Registered',
      'A new user "' || COALESCE(NEW.full_name, NEW.email) || '" has registered on the platform.',
      '/admin/users/' || NEW.id,
      'admin',
      jsonb_build_object(
        'user_id', NEW.id,
        'user_email', NEW.email,
        'user_name', NEW.full_name
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

SELECT 'Notification metadata improved for deep-linking!' as status;
