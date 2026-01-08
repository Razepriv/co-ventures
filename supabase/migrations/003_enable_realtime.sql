-- ========================================
-- Enable Realtime for Admin Panel
-- Migration: 003_enable_realtime
-- ========================================

-- Enable Realtime on enquiries table for instant notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.enquiries;

-- Enable Realtime on properties for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.properties;

-- Enable Realtime on users for online status
ALTER PUBLICATION supabase_realtime ADD TABLE public.users;

-- Enable Realtime on contact messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.contact_messages;

-- Enable Realtime on cohousing interests
ALTER PUBLICATION supabase_realtime ADD TABLE public.cohousing_interests;

-- Enable Realtime on activity logs for live dashboard
ALTER PUBLICATION supabase_realtime ADD TABLE public.activity_logs;
