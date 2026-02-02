import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import crypto from 'crypto'

// Lazy initialize Supabase admin client to avoid build-time errors
function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase URL and Service Role Key are required')
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

function verifyWebhookSignature(body: string, signature: string, secret: string): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex')
  
  return expectedSignature === signature
}

export async function POST(request: Request) {
  try {
    const supabase = getSupabaseAdmin()
    const body = await request.text()
    const signature = request.headers.get('x-razorpay-signature') || ''
    
    // Verify webhook signature
    const isValid = verifyWebhookSignature(
      body,
      signature,
      process.env.RAZORPAY_WEBHOOK_SECRET || ''
    )

    if (!isValid) {
      console.error('Invalid webhook signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const event = JSON.parse(body)
    const { event: eventType, payload } = event

    console.log(`Razorpay webhook: ${eventType}`)

    switch (eventType) {
      case 'subscription.activated':
        await handleSubscriptionActivated(supabase, payload.subscription.entity)
        break

      case 'subscription.charged':
        await handleSubscriptionCharged(supabase, payload.payment.entity, payload.subscription.entity)
        break

      case 'subscription.cancelled':
        await handleSubscriptionCancelled(supabase, payload.subscription.entity)
        break

      case 'subscription.completed':
        await handleSubscriptionCompleted(supabase, payload.subscription.entity)
        break

      case 'subscription.paused':
        await handleSubscriptionPaused(supabase, payload.subscription.entity)
        break

      case 'subscription.resumed':
        await handleSubscriptionResumed(supabase, payload.subscription.entity)
        break

      case 'payment.failed':
        await handlePaymentFailed(supabase, payload.payment.entity)
        break

      default:
        console.log(`Unhandled event type: ${eventType}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

async function handleSubscriptionActivated(supabase: SupabaseClient, subscription: any) {
  try {
    const { data, error } = await supabase
      .from('user_subscriptions')
      .update({
        status: 'active',
        current_period_start: new Date(subscription.start_at * 1000).toISOString(),
        current_period_end: new Date(subscription.end_at * 1000).toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('razorpay_subscription_id', subscription.id)

    if (error) throw error
    console.log('Subscription activated:', subscription.id)
  } catch (error) {
    console.error('Error activating subscription:', error)
  }
}

async function handleSubscriptionCharged(supabase: SupabaseClient, payment: any, subscription: any) {
  try {
    // Update subscription period dates
    await supabase
      .from('user_subscriptions')
      .update({
        current_period_start: new Date(subscription.current_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_end * 1000).toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('razorpay_subscription_id', subscription.id)

    console.log('Subscription charged:', subscription.id, 'Payment:', payment.id)
  } catch (error) {
    console.error('Error processing subscription charge:', error)
  }
}

async function handleSubscriptionCancelled(supabase: SupabaseClient, subscription: any) {
  try {
    const { data, error } = await supabase
      .from('user_subscriptions')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('razorpay_subscription_id', subscription.id)

    if (error) throw error
    console.log('Subscription cancelled:', subscription.id)
  } catch (error) {
    console.error('Error cancelling subscription:', error)
  }
}

async function handleSubscriptionCompleted(supabase: SupabaseClient, subscription: any) {
  try {
    const { data, error } = await supabase
      .from('user_subscriptions')
      .update({
        status: 'expired',
        updated_at: new Date().toISOString()
      })
      .eq('razorpay_subscription_id', subscription.id)

    if (error) throw error
    console.log('Subscription completed:', subscription.id)
  } catch (error) {
    console.error('Error completing subscription:', error)
  }
}

async function handleSubscriptionPaused(supabase: SupabaseClient, subscription: any) {
  try {
    const { data, error } = await supabase
      .from('user_subscriptions')
      .update({
        status: 'suspended',
        updated_at: new Date().toISOString()
      })
      .eq('razorpay_subscription_id', subscription.id)

    if (error) throw error
    console.log('Subscription paused:', subscription.id)
  } catch (error) {
    console.error('Error pausing subscription:', error)
  }
}

async function handleSubscriptionResumed(supabase: SupabaseClient, subscription: any) {
  try {
    const { data, error } = await supabase
      .from('user_subscriptions')
      .update({
        status: 'active',
        updated_at: new Date().toISOString()
      })
      .eq('razorpay_subscription_id', subscription.id)

    if (error) throw error
    console.log('Subscription resumed:', subscription.id)
  } catch (error) {
    console.error('Error resuming subscription:', error)
  }
}

async function handlePaymentFailed(supabase: SupabaseClient, payment: any) {
  try {
    console.log('Payment failed:', payment.id, 'for subscription:', payment.subscription_id)
    
    // Optionally update subscription status or send notification
    // You might want to suspend the subscription after multiple failed payments
  } catch (error) {
    console.error('Error handling payment failure:', error)
  }
}
