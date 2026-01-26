import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = await createClient()

    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's active subscription with plan details
    const { data: subscription, error: subError } = await supabase
      .from('user_subscriptions')
      .select(`
        *,
        plan:subscription_plans(*)
      `)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    if (subError && subError.code !== 'PGRST116') {
      throw subError
    }

    if (!subscription) {
      // Return free plan if no active subscription
      const { data: freePlan } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('slug', 'free')
        .single()

      return NextResponse.json({
        subscription: null,
        plan: freePlan
      })
    }

    // Calculate current month usage
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const { count: analysesCount } = await supabase
      .from('subscription_usage_logs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('usage_type', 'ai_analysis')
      .gte('created_at', startOfMonth.toISOString())

    const { count: propertiesCount } = await supabase
      .from('user_ai_assistant')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    return NextResponse.json({
      subscription,
      // @ts-ignore
      plan: subscription.plan,
      usage: {
        analyses_used: analysesCount || 0,
        // @ts-ignore
        analyses_limit: subscription.plan.analyses_per_month,
        properties_in_comparison: propertiesCount || 0,
        // @ts-ignore
        properties_limit: subscription.plan.max_properties_comparison
      }
    })
  } catch (error) {
    console.error('Error fetching subscription:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
