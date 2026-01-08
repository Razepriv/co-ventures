# Database Migration Guide

## Quick Start

### Option 1: Copy & Paste (Recommended)

1. Open Supabase Dashboard: https://supabase.com/dashboard/project/ydmxdokrtjolqigbtqbd
2. Navigate to **SQL Editor** (left sidebar)
3. Click **New Query**
4. Open `supabase/complete-setup.sql` in this project
5. Copy the entire contents
6. Paste into the SQL Editor
7. Click **Run** (or press Ctrl+Enter)
8. Wait for completion message: ✅ Database schema created successfully!

### Option 2: Individual Migrations

If you prefer to run migrations one at a time:

1. `supabase/migrations/001_initial_schema.sql` - Creates all tables
2. `supabase/migrations/002_performance_indexes.sql` - Adds performance indexes
3. `supabase/migrations/003_enable_realtime.sql` - Enables realtime subscriptions
4. `supabase/migrations/004_seed_categories.sql` - Adds seed data

### What Gets Created

#### Tables (14 total)
- ✅ users - User profiles and authentication data
- ✅ categories - Property categories (Co-Housing, Co-Living, etc.)
- ✅ properties - Property listings
- ✅ property_images - Multiple images per property
- ✅ enquiries - Customer enquiries with status tracking
- ✅ saved_properties - User saved/favorited properties
- ✅ newsletter_subscribers - Email newsletter subscriptions
- ✅ blog_posts - Blog content management
- ✅ testimonials - Customer testimonials
- ✅ contact_messages - General contact form submissions
- ✅ cohousing_interests - Co-housing interest forms
- ✅ site_settings - Dynamic site configuration
- ✅ activity_logs - Admin activity tracking
- ✅ media_files - Media library for uploads

#### Indexes (30+ performance indexes)
- Optimized for common query patterns
- Status + created_at combinations
- Location-based searches
- Full-text search support

#### Row Level Security (RLS)
- Public can view published content
- Users can manage their own data
- Admins have full access
- Super admins can manage settings

#### Realtime Subscriptions
- Enquiries - Live notifications
- Properties - Live updates
- Users - Online status
- Contact messages - Real-time alerts
- Activity logs - Dashboard updates

#### Seed Data
- 6 property categories (Co-Housing, Co-Living, Apartments, Villas, Plots, Commercial)
- 5 essential site settings (name, tagline, contact info)

### Verification

After running the migration, verify in Supabase Dashboard:

1. **Table Editor** → Should see all 14 tables
2. **Database** → **Indexes** → Should see 30+ indexes
3. **Database** → **Replication** → Should see 6 realtime tables
4. **Table Editor** → `categories` → Should see 6 rows
5. **Table Editor** → `site_settings` → Should see 5 rows

### Troubleshooting

**Error: "relation already exists"**
- This is normal if you're re-running the migration
- Tables that already exist will be skipped

**Error: "permission denied"**
- Make sure you're using a project with owner access
- Check that RLS policies don't conflict

**Realtime not working**
- Go to **Database** → **Replication**
- Ensure publication `supabase_realtime` includes the tables
- Toggle replication off/on if needed

### Next Steps

After migration completes:

1. ✅ Database schema is ready
2. ✅ Create your first admin user (via Supabase Auth)
3. ✅ Update user role to 'admin' in `users` table
4. ✅ Start the dev server: `npm run dev`
5. ✅ Access admin panel: http://localhost:3000/admin

## Migration Files Reference

### complete-setup.sql (All-in-One)
Complete database setup in a single file. Includes:
- All table definitions
- All indexes
- All RLS policies
- All triggers
- Realtime configuration
- Seed data

### Individual Migration Files

**001_initial_schema.sql**
- Creates 14 tables
- Sets up foreign keys
- Adds check constraints
- Creates triggers for updated_at
- Implements RLS policies

**002_performance_indexes.sql**
- 30+ strategically placed indexes
- Optimized for admin dashboard queries
- Supports fast property searches
- Enables efficient pagination

**003_enable_realtime.sql**
- Enables realtime on 6 tables
- Configures publication settings

**004_seed_categories.sql**
- Inserts 6 property categories
- Adds default site settings

## Database Schema Summary

### Core Relationships

```
users (auth)
  ├─> properties (1:many)
  │    ├─> property_images (1:many)
  │    └─> enquiries (1:many)
  ├─> blog_posts (1:many)
  ├─> saved_properties (many:many with properties)
  └─> testimonials (1:many)

categories
  └─> properties (1:many)
```

### Key Features

1. **Soft Deletes**: Properties have `deleted_at` timestamp
2. **Status Tracking**: Enquiries, properties, blog posts have status enums
3. **Timestamps**: All tables have `created_at` and `updated_at`
4. **Full-Text Search**: Blog posts have GIN index on tags array
5. **Geospatial**: Properties support lat/lng coordinates
6. **Audit Trail**: Activity logs track all admin actions

### Performance Optimizations

1. **Composite Indexes**: `(status, created_at)` for fast dashboard queries
2. **Partial Indexes**: Where clauses on common filters
3. **Array Indexes**: GIN indexes on tags and amenities
4. **Foreign Key Indexes**: On all relationship columns

## Support

If you encounter issues:
1. Check Supabase project logs
2. Verify environment variables in `.env.local`
3. Ensure Supabase project is active (not paused)
4. Check RLS policies if data isn't visible

## License

Private - Co Housing Ventures
