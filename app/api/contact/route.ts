import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  successResponse,
  handleApiError,
  validateRequest,
  rateLimit,
  getClientIp,
} from '@/lib/api/utils'
import { contactMessageSchema } from '@/lib/api/validation'

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
    const { data, error } = await validateRequest(request, contactMessageSchema)
    if (error) return error

    const supabase = await createClient()

    // Create contact message
    const { data: message, error: createError } = await supabase
      .from('contact_messages')
      // @ts-ignore
      .insert({
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        subject: data.subject,
        message: data.message,
        status: 'new',
      })
      .select()
      .single()

    if (createError) throw createError

    // TODO: Send email notification to admin
    // TODO: Send confirmation email to sender

    return successResponse(
      {
        message: 'Message sent successfully. We will get back to you soon.',
      },
      201
    )
  } catch (error) {
    return handleApiError(error)
  }
}
