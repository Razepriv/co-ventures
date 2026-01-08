-- ========================================
-- Seed Data - Categories
-- Migration: 004_seed_categories
-- ========================================

-- Insert default property categories
INSERT INTO public.categories (name, slug, description, icon, display_order, is_active) VALUES
  ('Co-Housing', 'co-housing', 'Collaborative housing communities with shared spaces and values', 'Users', 1, true),
  ('Co-Living', 'co-living', 'Modern shared living spaces with private rooms and communal areas', 'Building', 2, true),
  ('Apartments', 'apartments', 'Traditional multi-unit residential buildings', 'Building2', 3, true),
  ('Villas', 'villas', 'Independent luxury homes with premium amenities', 'Home', 4, true),
  ('Plots', 'plots', 'Land parcels for building your dream home', 'Map', 5, true),
  ('Commercial', 'commercial', 'Office spaces and commercial properties', 'Briefcase', 6, true)
ON CONFLICT (slug) DO NOTHING;

-- Insert default site settings
INSERT INTO public.site_settings (key, value, description) VALUES
  ('site_name', '"Co Housing Ventures"', 'Website name'),
  ('site_tagline', '"Find Your Perfect Co-Living Space"', 'Website tagline'),
  ('contact_email', '"info@cohousingventures.com"', 'Primary contact email'),
  ('contact_phone', '"+91 9876543210"', 'Primary contact phone'),
  ('office_address', '"Bangalore, Karnataka, India"', 'Office address'),
  ('social_facebook', '"https://facebook.com/cohousingventures"', 'Facebook profile URL'),
  ('social_instagram', '"https://instagram.com/cohousingventures"', 'Instagram profile URL'),
  ('social_twitter', '"https://twitter.com/cohousingventures"', 'Twitter profile URL'),
  ('social_linkedin', '"https://linkedin.com/company/cohousingventures"', 'LinkedIn profile URL'),
  ('enquiry_notification_emails', '["admin@cohousingventures.com"]', 'Email addresses to receive enquiry notifications'),
  ('featured_properties_limit', '6', 'Number of featured properties to show on homepage'),
  ('properties_per_page', '12', 'Number of properties per page in listings'),
  ('enable_testimonials', 'true', 'Enable/disable testimonials section'),
  ('enable_blog', 'true', 'Enable/disable blog section'),
  ('enable_newsletter', 'true', 'Enable/disable newsletter subscription'),
  ('analytics_tracking_id', '""', 'Google Analytics tracking ID'),
  ('meta_description', '"Discover premium co-housing and co-living spaces in Bangalore. Find your perfect community living experience with Co Housing Ventures."', 'Default meta description'),
  ('meta_keywords', '"co-housing, co-living, shared living, community housing, Bangalore properties"', 'Default meta keywords')
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  updated_at = NOW();
