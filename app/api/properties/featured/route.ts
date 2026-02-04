import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

// Server-side cache for featured properties
// Note: Resets on serverless cold starts - client SWR provides consistent caching
let featuredCache: { data: any; timestamp: number } | null = null
const CACHE_TTL = 60000 // 1 minute cache

// Enable ISR - revalidate every 60 seconds
export const revalidate = 60

export async function GET() {
  try {
    // Check cache first for faster response
    if (featuredCache && Date.now() - featuredCache.timestamp < CACHE_TTL) {
      return NextResponse.json(
        { success: true, data: featuredCache.data, cached: true },
        {
          headers: {
            'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
          },
        }
      )
    }

    const supabase = createServiceClient()

    const { data, error } = await supabase
      .from('properties')
      .select(`
        id,
        title,
        slug,
        location,
        city,
        state,
        price,
        bhk_type,
        area_sqft,
        status,
        is_featured,
        featured_image,
        property_images (image_url, is_primary),
        categories (name, icon)
      `)
      .eq('is_featured', true)
      .eq('status', 'available')
      .order('created_at', { ascending: false })
      .limit(6)

    if (error) throw error

    // Update cache
    featuredCache = {
      data: data || [],
      timestamp: Date.now(),
    }

    return NextResponse.json(
      { success: true, data: data || [], cached: false },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
        },
      }
    )
  } catch (error) {
    console.error('Featured properties error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch featured properties' },
      { status: 500 }
    )
  }
}
