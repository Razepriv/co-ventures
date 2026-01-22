-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL CHECK (type IN ('new_user', 'new_enquiry', 'new_property', 'property_update', 'enquiry_update')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications(type);

-- Enable Row Level Security
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for notifications
-- Admin users can see all notifications
CREATE POLICY "Admin users can view all notifications"
ON public.notifications
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.role IN ('super_admin', 'admin')
  )
);

-- Admin users can update notifications (mark as read)
CREATE POLICY "Admin users can update notifications"
ON public.notifications
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.role IN ('super_admin', 'admin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.role IN ('super_admin', 'admin')
  )
);

-- Admin users can delete notifications
CREATE POLICY "Admin users can delete notifications"
ON public.notifications
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.role IN ('super_admin', 'admin')
  )
);

-- System can insert notifications
CREATE POLICY "System can insert notifications"
ON public.notifications
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

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
DROP TRIGGER IF EXISTS trigger_new_user_notification ON public.users;
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
DROP TRIGGER IF EXISTS trigger_new_enquiry_notification ON public.enquiries;
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
DROP TRIGGER IF EXISTS trigger_new_property_notification ON public.properties;
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
DROP TRIGGER IF EXISTS trigger_property_update_notification ON public.properties;
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
DROP TRIGGER IF EXISTS trigger_enquiry_update_notification ON public.enquiries;
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
DROP TRIGGER IF EXISTS trigger_update_notifications_updated_at ON public.notifications;
CREATE TRIGGER trigger_update_notifications_updated_at
BEFORE UPDATE ON public.notifications
FOR EACH ROW
EXECUTE FUNCTION public.update_notifications_updated_at();

-- Insert a test notification (optional - for testing purposes)
INSERT INTO public.notifications (type, title, message, is_read)
VALUES (
  'new_user',
  'Welcome to the Notification System',
  'Notifications are now enabled! You will receive real-time updates about users, enquiries, and properties.',
  false
);

COMMENT ON TABLE public.notifications IS 'Stores system notifications for admin users';
COMMENT ON COLUMN public.notifications.type IS 'Type of notification: new_user, new_enquiry, new_property, property_update, enquiry_update';
COMMENT ON COLUMN public.notifications.metadata IS 'Additional JSON data related to the notification';
