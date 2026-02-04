import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Cache for dashboard stats (server-side)
// Note: In serverless environments, this cache resets on cold starts
// The client-side SWR + localStorage cache provides consistent caching
let statsCache: { data: any; timestamp: number } | null = null
const CACHE_TTL = 30000 // 30 seconds

// Allow Next.js to cache this route for 30 seconds
export const revalidate = 30

export async function GET() {
  try {
    // Check if we have valid cached data
    if (statsCache && Date.now() - statsCache.timestamp < CACHE_TTL) {
      return NextResponse.json({
        success: true,
        data: statsCache.data,
        cached: true,
      })
    }

    const supabase = await createClient()

    // Fetch all data in parallel with optimized queries
    const [
      { data: allProperties },
      { count: totalEnquiries },
      { count: totalUsers },
      { data: recentActivity },
      { data: featuredProperties },
      { data: recentUsers },
    ] = await Promise.all([
      // Single query for all property stats
      supabase
        .from('properties')
        .select('id, status, price, is_featured'),
      // Enquiries count for last 30 days
      supabase
        .from('enquiries')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
      // Total users
      supabase.from('users').select('*', { count: 'exact', head: true }),
      // Recent activity
      supabase
        .from('activity_logs')
        .select('id, action, entity_type, entity_id, details, created_at, user:users(full_name)')
        .order('created_at', { ascending: false })
        .limit(5),
      // Featured properties
      supabase
        .from('properties')
        .select('id, title, price, featured_image, bedrooms, bathrooms, area_sqft, location, status, property_type')
        .eq('is_featured', true)
        .order('created_at', { ascending: false })
        .limit(3),
      // Recent users
      supabase
        .from('users')
        .select('id, full_name, email, avatar_url, created_at')
        .order('created_at', { ascending: false })
        .limit(4),
    ])

    // Compute stats from properties data
    const properties = allProperties || []
    const totalProperties = properties.length
    const onSell = properties.filter((p: any) => p.status === 'available').length
    const totalLeases = properties.filter((p: any) => p.status === 'leased').length
    const propertySold = properties.filter((p: any) => p.status === 'sold').length
    const revenue = properties
      .filter((p: any) => p.status === 'sold')
      .reduce((sum: number, prop: any) => sum + (prop.price || 0), 0)

    const data = {
      stats: {
        totalProperties,
        newEnquiries: totalEnquiries || 0,
        totalUsers: totalUsers || 0,
        revenue,
        onSell,
        totalLeases,
        propertySold,
      },
      salesAnalytics: {
        propertySold,
        totalProperties,
        soldPercentage: totalProperties > 0 ? Math.round((propertySold / totalProperties) * 100) : 0,
        availablePercentage: totalProperties > 0 ? Math.round((onSell / totalProperties) * 100) : 0,
      },
      recentActivity: recentActivity || [],
      featuredProperties: featuredProperties || [],
      recentUsers: recentUsers || [],
    }

    // Update cache
    statsCache = {
      data,
      timestamp: Date.now(),
    }

    return NextResponse.json(
      {
        success: true,
        data,
        cached: false,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
        },
      }
    )
  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    )
  }
}

// Invalidate cache endpoint (called when data changes)
export async function POST() {
  statsCache = null
  return NextResponse.json({ success: true, message: 'Cache invalidated' })
}
