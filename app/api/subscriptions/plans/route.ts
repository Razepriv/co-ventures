import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Plans rarely change - cache for 5 minutes
export const revalidate = 300

export async function GET() {
  try {
    const supabase = await createClient()

    // Get all active subscription plans ordered by display_order
    const { data: plans, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true })

    if (error) throw error

    return NextResponse.json(
      { plans },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    )
  } catch (error) {
    console.error('Error fetching plans:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
