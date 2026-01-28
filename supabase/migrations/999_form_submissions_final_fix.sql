-- ========================================
-- FINAL COMPREHENSIVE FIX FOR FORM SUBMISSIONS
-- Migration: 999_form_submissions_final_fix
-- ========================================

-- 1. FIX ENQUIRIES TABLE
DO $$
BEGIN
    -- Add investment_amount if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'enquiries' AND column_name = 'investment_amount') THEN
        ALTER TABLE public.enquiries ADD COLUMN investment_amount DECIMAL(15, 2);
    END IF;

    -- Ensure full_name exists (some components use full_name, others name)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'enquiries' AND column_name = 'full_name') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'enquiries' AND column_name = 'name') THEN
            ALTER TABLE public.enquiries RENAME COLUMN name TO full_name;
        ELSE
            ALTER TABLE public.enquiries ADD COLUMN full_name TEXT;
        END IF;
    END IF;
END $$;

-- 2. FIX PROPERTY LEADS TABLE
DO $$
BEGIN
    -- Update lead_type check constraint
    -- First drop the existing one
    ALTER TABLE public.property_leads DROP CONSTRAINT IF EXISTS property_leads_lead_type_check;
    
    -- Add the updated one
    ALTER TABLE public.property_leads ADD CONSTRAINT property_leads_lead_type_check 
        CHECK (lead_type IN ('coupon_download', 'join_group', 'book_visit', 'callback_request', 'live_tour', 'individual', 'business', 'partnership'));

    -- Ensure full_name exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'property_leads' AND column_name = 'full_name') THEN
        ALTER TABLE public.property_leads ADD COLUMN full_name TEXT;
    END IF;
END $$;

-- 3. FIX NEWSLETTER SUBSCRIBERS
DO $$
BEGIN
    -- Some routes expect 'subscribed' while others might expect 'is_active'
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'newsletter_subscribers' AND column_name = 'subscribed') THEN
        ALTER TABLE public.newsletter_subscribers ADD COLUMN subscribed BOOLEAN DEFAULT true;
    END IF;
END $$;

-- 4. FIX RLS POLICIES FOR ALL FORM TABLES
-- Enquiries
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can insert enquiries" ON public.enquiries;
DROP POLICY IF EXISTS "Public can insert enquiries" ON public.enquiries;
CREATE POLICY "Public can insert enquiries" ON public.enquiries FOR INSERT TO public WITH CHECK (true);

-- Contact Messages
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can insert contact messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Public can insert contact messages" ON public.contact_messages;
CREATE POLICY "Public can insert contact messages" ON public.contact_messages FOR INSERT TO public WITH CHECK (true);

-- Property Leads
ALTER TABLE public.property_leads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can insert property leads" ON public.property_leads;
DROP POLICY IF EXISTS "Public can insert property leads" ON public.property_leads;
CREATE POLICY "Public can insert property leads" ON public.property_leads FOR INSERT TO public WITH CHECK (true);

-- Newsletter Subscribers
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can subscribe to newsletter" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Public can subscribe to newsletter" ON public.newsletter_subscribers;
CREATE POLICY "Public can subscribe to newsletter" ON public.newsletter_subscribers FOR INSERT TO public WITH CHECK (true);

-- 5. FIX TRIGGER FUNCTIONS
-- Update create_new_enquiry_notification to use full_name and safe column access
CREATE OR REPLACE FUNCTION public.create_new_enquiry_notification()
RETURNS TRIGGER AS $$
DECLARE
  payload jsonb;
BEGIN
  payload := to_jsonb(NEW);
  
  -- Notify admins about new enquiries
  INSERT INTO public.notifications (type, title, message, link, target_audience, metadata)
  VALUES (
    'new_enquiry',
    'New Enquiry Received',
    'New enquiry from "' || COALESCE(payload ->> 'full_name', payload ->> 'name', 'Anonymous') || '" regarding "' || COALESCE(payload ->> 'subject', 'General Enquiry') || '".',
    '/admin/enquiries',
    'admin',
    jsonb_build_object(
      'enquiry_id', NEW.id,
      'full_name', COALESCE(payload ->> 'full_name', payload ->> 'name'),
      'email', NEW.email,
      'subject', payload ->> 'subject'
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update create_enquiry_update_notification to use full_name and safe column access
CREATE OR REPLACE FUNCTION public.create_enquiry_update_notification()
RETURNS TRIGGER AS $$
DECLARE
  payload jsonb;
BEGIN
  payload := to_jsonb(NEW);
  
  -- Notify admins on enquiry status changes
  IF OLD.status != NEW.status THEN
    INSERT INTO public.notifications (type, title, message, link, target_audience, metadata)
    VALUES (
      'enquiry_update',
      'Enquiry Status Updated',
      'Enquiry from "' || COALESCE(payload ->> 'full_name', payload ->> 'name', 'Anonymous') || '" status changed to "' || NEW.status || '".',
      '/admin/enquiries',
      'admin',
      jsonb_build_object(
        'enquiry_id', NEW.id,
        'full_name', COALESCE(payload ->> 'full_name', payload ->> 'name'),
        'old_status', OLD.status,
        'new_status', NEW.status
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. ENSURE TRIGGER SECURITY
-- Make sure any triggers on these tables are SECURITY DEFINER if they call other functions
-- (None identified as strictly necessary but good practice for public forms)
