-- Complete Notifications Setup
-- Run this to finish setting up the notification system

-- Enable realtime for notifications (if not already enabled)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'notifications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
  END IF;
END $$;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS trigger_new_user_notification ON public.users;
DROP TRIGGER IF EXISTS trigger_new_enquiry_notification ON public.enquiries;
DROP TRIGGER IF EXISTS trigger_new_property_notification ON public.properties;
DROP TRIGGER IF EXISTS trigger_property_update_notification ON public.properties;
DROP TRIGGER IF EXISTS trigger_enquiry_update_notification ON public.enquiries;
DROP TRIGGER IF EXISTS trigger_update_notifications_updated_at ON public.notifications;

-- Drop existing functions
DROP FUNCTION IF EXISTS public.create_new_user_notification();
DROP FUNCTION IF EXISTS public.create_new_enquiry_notification();
DROP FUNCTION IF EXISTS public.create_new_property_notification();
DROP FUNCTION IF EXISTS public.create_property_update_notification();
DROP FUNCTION IF EXISTS public.create_enquiry_update_notification();
DROP FUNCTION IF EXISTS public.update_notifications_updated_at();

-- Create function to automatically create notifications for new users
CREATE OR REPLACE FUNCTION public.create_new_user_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create notification for non-admin users
  IF NEW.role = 'user' THEN
    INSERT INTO public.notifications (type, title, message, link, metadata)
    VALUES (
      'new_user',
      'New User Registered',
      'A new user "' || COALESCE(NEW.full_name, NEW.email) || '" has registered on the platform.',
      '/admin/users',
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

-- Create trigger for new users
CREATE TRIGGER trigger_new_user_notification
AFTER INSERT ON public.users
FOR EACH ROW
EXECUTE FUNCTION public.create_new_user_notification();

-- Create function to automatically create notifications for new enquiries
CREATE OR REPLACE FUNCTION public.create_new_enquiry_notification()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.notifications (type, title, message, link, metadata)
  VALUES (
    'new_enquiry',
    'New Enquiry Received',
    'New enquiry from "' || NEW.name || '" regarding "' || COALESCE(NEW.subject, 'General Enquiry') || '".',
    '/admin/enquiries',
    jsonb_build_object(
      'enquiry_id', NEW.id,
      'name', NEW.name,
      'email', NEW.email,
      'subject', NEW.subject
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new enquiries
CREATE TRIGGER trigger_new_enquiry_notification
AFTER INSERT ON public.enquiries
FOR EACH ROW
EXECUTE FUNCTION public.create_new_enquiry_notification();

-- Create function to automatically create notifications for new properties
CREATE OR REPLACE FUNCTION public.create_new_property_notification()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'published' THEN
    INSERT INTO public.notifications (type, title, message, link, metadata)
    VALUES (
      'new_property',
      'New Property Listed',
      'New property "' || NEW.title || '" has been published in ' || NEW.location || '.',
      '/admin/properties',
      jsonb_build_object(
        'property_id', NEW.id,
        'property_title', NEW.title,
        'location', NEW.location,
        'price', NEW.price
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new properties
CREATE TRIGGER trigger_new_property_notification
AFTER INSERT ON public.properties
FOR EACH ROW
EXECUTE FUNCTION public.create_new_property_notification();

-- Create function to automatically create notifications for property updates
CREATE OR REPLACE FUNCTION public.create_property_update_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Only notify on significant changes
  IF (OLD.status != NEW.status) OR 
     (OLD.is_featured != NEW.is_featured) OR
     (OLD.price != NEW.price) THEN
    
    INSERT INTO public.notifications (type, title, message, link, metadata)
    VALUES (
      'property_update',
      'Property Updated',
      'Property "' || NEW.title || '" has been updated.',
      '/admin/properties',
      jsonb_build_object(
        'property_id', NEW.id,
        'property_title', NEW.title,
        'changes', jsonb_build_object(
          'status_changed', OLD.status != NEW.status,
          'featured_changed', OLD.is_featured != NEW.is_featured,
          'price_changed', OLD.price != NEW.price
        )
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for property updates
CREATE TRIGGER trigger_property_update_notification
AFTER UPDATE ON public.properties
FOR EACH ROW
EXECUTE FUNCTION public.create_property_update_notification();

-- Create function to automatically create notifications for enquiry updates
CREATE OR REPLACE FUNCTION public.create_enquiry_update_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Only notify on status changes
  IF OLD.status != NEW.status THEN
    INSERT INTO public.notifications (type, title, message, link, metadata)
    VALUES (
      'enquiry_update',
      'Enquiry Status Updated',
      'Enquiry from "' || NEW.name || '" status changed to "' || NEW.status || '".',
      '/admin/enquiries',
      jsonb_build_object(
        'enquiry_id', NEW.id,
        'name', NEW.name,
        'old_status', OLD.status,
        'new_status', NEW.status
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for enquiry updates
CREATE TRIGGER trigger_enquiry_update_notification
AFTER UPDATE ON public.enquiries
FOR EACH ROW
EXECUTE FUNCTION public.create_enquiry_update_notification();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_notifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update updated_at
CREATE TRIGGER trigger_update_notifications_updated_at
BEFORE UPDATE ON public.notifications
FOR EACH ROW
EXECUTE FUNCTION public.update_notifications_updated_at();

-- Insert a welcome notification
INSERT INTO public.notifications (type, title, message, is_read)
VALUES (
  'new_user',
  '🎉 Notification System Activated!',
  'Your real-time notification system is now live. You will receive instant updates about new users, enquiries, and property changes.',
  false
)
ON CONFLICT DO NOTHING;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Notification system setup complete!';
  RAISE NOTICE '📋 All triggers are now active';
  RAISE NOTICE '🔔 Admins will receive real-time notifications';
END $$;
