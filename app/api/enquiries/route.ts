import { NextRequest } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import {
  successResponse,
  handleApiError,
  validateRequest,
  rateLimit,
  getClientIp,
} from '@/lib/api/utils'
import { createEnquirySchema } from '@/lib/api/validation'

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = getClientIp(request)
    const rateLimitResult = rateLimit(ip, 5, 60000) // 5 requests per minute
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
    const { data, error } = await validateRequest(request, createEnquirySchema)
    if (error) return error

    // Use admin client to bypass RLS for inserting public enquiries
    const supabase = await createAdminClient()

    // Get current user if authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Create enquiry
    const { data: enquiry, error: createError } = await supabase
      .from('enquiries')
      // @ts-ignore
      .insert({
        property_id: data.propertyId,
        user_id: user?.id || null,
        full_name: data.name,
        email: data.email,
        phone: data.phone,
        message: data.message,
        status: 'new',
      })
      .select()
      .single()

    if (createError) throw createError

    // TODO: Send email notification to property owner
    // TODO: Send confirmation email to enquirer

    return successResponse(
      {
        enquiry,
        message: 'Enquiry submitted successfully. We will contact you soon.',
      },
      201
    )
  } catch (error) {
    return handleApiError(error)
  }
}
