import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import Razorpay from 'razorpay'

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || ''
})

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { planSlug } = body

    if (!planSlug) {
      return NextResponse.json({ error: 'Plan slug is required' }, { status: 400 })
    }

    // Get plan details
    const { data: plan, error: planError } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('slug', planSlug)
      .single()

    if (planError || !plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
    }

    // Don't allow subscribing to free plan
    // @ts-ignore
    if (plan.slug === 'free') {
      return NextResponse.json({ error: 'Cannot subscribe to free plan' }, { status: 400 })
    }

    // Check if user already has an active subscription
    const { data: existingSub } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    if (existingSub) {
      return NextResponse.json(
        { error: 'You already have an active subscription. Please cancel it first.' },
        { status: 400 }
      )
    }

    // Create Razorpay subscription
    const subscription = await razorpay.subscriptions.create({
      plan_id: process.env[`RAZORPAY_PLAN_${planSlug.toUpperCase()}`] || '',
      customer_notify: 1,
      quantity: 1,
      total_count: 12, // 12 months
      notes: {
        user_id: user.id,
        plan_slug: planSlug,
        // @ts-ignore
        plan_name: plan.name
      }
    })

    // Create subscription record in database (status: created, pending payment)
    const { data: newSubscription, error: insertError } = await supabase
      .from('user_subscriptions')
      // @ts-ignore
      .insert({
        user_id: user.id,
        // @ts-ignore
        plan_id: plan.id,
        status: 'created', // Will be updated to 'active' after payment
        razorpay_subscription_id: subscription.id,
        razorpay_plan_id: subscription.plan_id,
        current_period_start: new Date(subscription.start_at * 1000).toISOString(),
        current_period_end: new Date(subscription.end_at * 1000).toISOString()
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating subscription record:', insertError)
      return NextResponse.json(
        { error: 'Failed to create subscription record' },
        { status: 500 }
      )
    }

    // Return Razorpay subscription details for frontend to complete payment
    return NextResponse.json({
      subscriptionId: subscription.id,
      subscription: newSubscription,
      razorpay: {
        key: process.env.RAZORPAY_KEY_ID,
        subscriptionId: subscription.id,
        name: 'BluNest Real Estate',
        // @ts-ignore
        description: `${plan.name} - Monthly Subscription`,
        image: '/logo.png', // Add your logo
        prefill: {
          name: user.user_metadata?.full_name || user.email?.split('@')[0] || '',
          email: user.email || '',
          contact: user.user_metadata?.phone || ''
        },
        theme: {
          color: '#f97316' // Coral color
        }
      }
    })
  } catch (error) {
    console.error('Error creating Razorpay subscription:', error)
    return NextResponse.json(
      { error: 'Failed to create subscription', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
