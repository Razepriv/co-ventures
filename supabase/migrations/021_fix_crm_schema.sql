-- Migration: Fix CRM Schema and Lead Management
-- Adds missing columns and unifies status constraints across lead tables

-- 1. Property Groups Enhancements
-- Add status column to track group state explicitly
ALTER TABLE public.property_groups ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'open';

-- 2. Contact Messages Enhancements
-- Add assigned_to for CRM workflow
ALTER TABLE public.contact_messages ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES public.users(id) ON DELETE SET NULL;

-- 3. Unify Status Constraints
-- Standard CRM Statuses: 'new', 'contacted', 'in_progress', 'qualified', 'converted', 'resolved', 'closed', 'lost'

-- Update contact_messages
ALTER TABLE public.contact_messages DROP CONSTRAINT IF EXISTS contact_messages_status_check;
ALTER TABLE public.contact_messages ADD CONSTRAINT contact_messages_status_check 
    CHECK (status IN ('new', 'contacted', 'in_progress', 'qualified', 'converted', 'resolved', 'closed', 'lost'));

-- Update property_leads
ALTER TABLE public.property_leads DROP CONSTRAINT IF EXISTS property_leads_status_check;
ALTER TABLE public.property_leads ADD CONSTRAINT property_leads_status_check 
    CHECK (status IN ('new', 'contacted', 'in_progress', 'qualified', 'converted', 'resolved', 'closed', 'lost'));

-- Update enquiries
ALTER TABLE public.enquiries DROP CONSTRAINT IF EXISTS enquiries_status_check;
ALTER TABLE public.enquiries ADD CONSTRAINT enquiries_status_check 
    CHECK (status IN ('new', 'contacted', 'in_progress', 'qualified', 'converted', 'resolved', 'closed', 'lost'));

-- 4. Enable Realtime for all concerned tables
DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.property_groups;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.property_leads;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.enquiries;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.contact_messages;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
