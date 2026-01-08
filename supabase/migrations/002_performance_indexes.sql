-- ========================================
-- Performance Optimization - Indexes
-- Migration: 002_performance_indexes
-- ========================================

-- ========================================
-- PROPERTIES INDEXES
-- ========================================

-- Primary query pattern: Get available properties sorted by created_at
CREATE INDEX IF NOT EXISTS idx_properties_status_created 
  ON public.properties(status, created_at DESC) 
  WHERE deleted_at IS NULL;

-- Featured properties
CREATE INDEX IF NOT EXISTS idx_properties_featured 
  ON public.properties(is_featured, featured_at DESC) 
  WHERE is_featured = true AND status = 'available' AND deleted_at IS NULL;

-- Location-based queries
CREATE INDEX IF NOT EXISTS idx_properties_city_status 
  ON public.properties(city, status, created_at DESC) 
  WHERE deleted_at IS NULL;

-- Category filtering
CREATE INDEX IF NOT EXISTS idx_properties_category 
  ON public.properties(category_id, status, created_at DESC) 
  WHERE deleted_at IS NULL;

-- Price range queries
CREATE INDEX IF NOT EXISTS idx_properties_price 
  ON public.properties(price, status) 
  WHERE deleted_at IS NULL;

-- BHK filtering
CREATE INDEX IF NOT EXISTS idx_properties_bhk 
  ON public.properties(bhk_type, status, created_at DESC) 
  WHERE deleted_at IS NULL;

-- User's properties
CREATE INDEX IF NOT EXISTS idx_properties_user 
  ON public.properties(user_id, created_at DESC);

-- Slug lookup (for property detail pages)
CREATE INDEX IF NOT EXISTS idx_properties_slug 
  ON public.properties(slug) 
  WHERE deleted_at IS NULL;

-- Geospatial queries (if implementing map search)
CREATE INDEX IF NOT EXISTS idx_properties_location 
  ON public.properties USING gist(ll_to_earth(CAST(latitude AS DOUBLE PRECISION), CAST(longitude AS DOUBLE PRECISION)));

-- ========================================
-- PROPERTY IMAGES INDEXES
-- ========================================

-- Get images for a property
CREATE INDEX IF NOT EXISTS idx_property_images_property 
  ON public.property_images(property_id, display_order);

-- Get primary image
CREATE INDEX IF NOT EXISTS idx_property_images_primary 
  ON public.property_images(property_id) 
  WHERE is_primary = true;

-- ========================================
-- ENQUIRIES INDEXES
-- ========================================

-- Admin dashboard: Get new enquiries
CREATE INDEX IF NOT EXISTS idx_enquiries_status_created 
  ON public.enquiries(status, created_at DESC);

-- Property enquiries
CREATE INDEX IF NOT EXISTS idx_enquiries_property 
  ON public.enquiries(property_id, created_at DESC);

-- User's enquiries
CREATE INDEX IF NOT EXISTS idx_enquiries_user 
  ON public.enquiries(user_id, created_at DESC);

-- Assigned enquiries
CREATE INDEX IF NOT EXISTS idx_enquiries_assigned 
  ON public.enquiries(assigned_to, status, created_at DESC);

-- ========================================
-- SAVED PROPERTIES INDEXES
-- ========================================

-- User's saved properties
CREATE INDEX IF NOT EXISTS idx_saved_properties_user 
  ON public.saved_properties(user_id, created_at DESC);

-- Check if property is saved
CREATE INDEX IF NOT EXISTS idx_saved_properties_lookup 
  ON public.saved_properties(user_id, property_id);

-- ========================================
-- BLOG POSTS INDEXES
-- ========================================

-- Published blog posts
CREATE INDEX IF NOT EXISTS idx_blog_status_published 
  ON public.blog_posts(status, published_at DESC) 
  WHERE status = 'published';

-- Category filtering
CREATE INDEX IF NOT EXISTS idx_blog_category 
  ON public.blog_posts(category, published_at DESC) 
  WHERE status = 'published';

-- Tag search (using GIN index for array)
CREATE INDEX IF NOT EXISTS idx_blog_tags 
  ON public.blog_posts USING gin(tags);

-- Author's posts
CREATE INDEX IF NOT EXISTS idx_blog_author 
  ON public.blog_posts(author_id, created_at DESC);

-- Slug lookup
CREATE INDEX IF NOT EXISTS idx_blog_slug 
  ON public.blog_posts(slug);

-- ========================================
-- TESTIMONIALS INDEXES
-- ========================================

-- Approved testimonials
CREATE INDEX IF NOT EXISTS idx_testimonials_approved 
  ON public.testimonials(is_approved, display_order) 
  WHERE is_approved = true;

-- Featured testimonials
CREATE INDEX IF NOT EXISTS idx_testimonials_featured 
  ON public.testimonials(is_featured, display_order) 
  WHERE is_featured = true AND is_approved = true;

-- User's testimonials
CREATE INDEX IF NOT EXISTS idx_testimonials_user 
  ON public.testimonials(user_id, created_at DESC);

-- ========================================
-- CONTACT MESSAGES INDEXES
-- ========================================

-- New messages
CREATE INDEX IF NOT EXISTS idx_contact_status_created 
  ON public.contact_messages(status, created_at DESC);

-- ========================================
-- COHOUSING INTERESTS INDEXES
-- ========================================

-- New interests
CREATE INDEX IF NOT EXISTS idx_cohousing_status_created 
  ON public.cohousing_interests(status, created_at DESC);

-- User's interests
CREATE INDEX IF NOT EXISTS idx_cohousing_user 
  ON public.cohousing_interests(user_id, created_at DESC);

-- Location preference filtering
CREATE INDEX IF NOT EXISTS idx_cohousing_location 
  ON public.cohousing_interests(location_preference, status);

-- ========================================
-- ACTIVITY LOGS INDEXES
-- ========================================

-- User activity
CREATE INDEX IF NOT EXISTS idx_activity_user 
  ON public.activity_logs(user_id, created_at DESC);

-- Entity tracking
CREATE INDEX IF NOT EXISTS idx_activity_entity 
  ON public.activity_logs(entity_type, entity_id, created_at DESC);

-- Recent activity (for admin dashboard)
CREATE INDEX IF NOT EXISTS idx_activity_created 
  ON public.activity_logs(created_at DESC);

-- ========================================
-- MEDIA FILES INDEXES
-- ========================================

-- User's uploads
CREATE INDEX IF NOT EXISTS idx_media_uploader 
  ON public.media_files(uploaded_by, created_at DESC);

-- Folder browsing
CREATE INDEX IF NOT EXISTS idx_media_folder 
  ON public.media_files(folder, created_at DESC);

-- MIME type filtering
CREATE INDEX IF NOT EXISTS idx_media_type 
  ON public.media_files(mime_type, created_at DESC);

-- ========================================
-- USERS INDEXES
-- ========================================

-- Email lookup (for authentication)
CREATE INDEX IF NOT EXISTS idx_users_email 
  ON public.users(email);

-- Role filtering
CREATE INDEX IF NOT EXISTS idx_users_role 
  ON public.users(role, created_at DESC);

-- Active users
CREATE INDEX IF NOT EXISTS idx_users_active 
  ON public.users(is_active, created_at DESC);

-- ========================================
-- CATEGORIES INDEXES
-- ========================================

-- Display order
CREATE INDEX IF NOT EXISTS idx_categories_order 
  ON public.categories(display_order) 
  WHERE is_active = true;

-- Slug lookup
CREATE INDEX IF NOT EXISTS idx_categories_slug 
  ON public.categories(slug);

-- ========================================
-- SITE SETTINGS INDEXES
-- ========================================

-- Key lookup
CREATE INDEX IF NOT EXISTS idx_settings_key 
  ON public.site_settings(key);

-- ========================================
-- NEWSLETTER SUBSCRIBERS INDEXES
-- ========================================

-- Active subscribers
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribed 
  ON public.newsletter_subscribers(subscribed, created_at DESC);

-- Email lookup
CREATE INDEX IF NOT EXISTS idx_newsletter_email 
  ON public.newsletter_subscribers(email);

-- ========================================
-- ANALYZE TABLES
-- ========================================
-- Update table statistics for query planner

ANALYZE public.users;
ANALYZE public.categories;
ANALYZE public.properties;
ANALYZE public.property_images;
ANALYZE public.enquiries;
ANALYZE public.saved_properties;
ANALYZE public.newsletter_subscribers;
ANALYZE public.blog_posts;
ANALYZE public.testimonials;
ANALYZE public.contact_messages;
ANALYZE public.cohousing_interests;
ANALYZE public.site_settings;
ANALYZE public.activity_logs;
ANALYZE public.media_files;
