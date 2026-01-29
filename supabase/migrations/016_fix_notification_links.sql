-- Fix notification links to point to specific enquiry details
CREATE OR REPLACE FUNCTION public.create_new_enquiry_notification()
RETURNS TRIGGER AS $$
BEGIN
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
      'subject', NEW.subject
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
