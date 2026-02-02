import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  successResponse,
  errorResponse,
  handleApiError,
  validateRequest,
  rateLimit,
  getClientIp,
} from '@/lib/api/utils'
import { subscribeNewsletterSchema } from '@/lib/api/validation'

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = getClientIp(request)
    const rateLimitResult = rateLimit(ip, 3, 60000) // 3 requests per minute
    if (!rateLimitResult.success) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Too many requests. Please try again later.',
        }),
        {
          status: 429,
          headers: {
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString(),
          },
        }
      )
    }

    // Validate request body
    const { data, error } = await validateRequest(request, subscribeNewsletterSchema)
    if (error) return error

    const supabase = await createClient()

    // Check if email already exists
    const { data: existing } = await supabase
      .from('newsletter_subscribers')
      .select('id, subscribed')
      .eq('email', data.email)
      .single()

    if (existing) {
      // @ts-ignore
      if (existing.subscribed) {
        return errorResponse('Email already subscribed', 409)
      } else {
        // Resubscribe
        const { error: updateError } = await supabase
          .from('newsletter_subscribers')
          // @ts-ignore
          .update({ subscribed: true, updated_at: new Date().toISOString() })
          // @ts-ignore
          .eq('id', existing.id)

        if (updateError) throw updateError

        return successResponse({
          message: 'Successfully resubscribed to newsletter',
        })
      }
    }

    // Create new subscriber
    const { error: insertError } = await supabase
      .from('newsletter_subscribers')
      // @ts-ignore
      .insert({
        email: data.email,
        subscribed: true,
      })

    if (insertError) throw insertError

    // TODO: Send welcome email
    // TODO: Add to email marketing platform (SendGrid, Mailchimp, etc.)

    return successResponse(
      {
        message: 'Successfully subscribed to newsletter',
      },
      201
    )
  } catch (error) {
    return handleApiError(error)
  }
}
