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
    const rateLimitResult = rateLimit(ip, 10, 60000)
    if (!rateLimitResult.success) {
      return new Response(JSON.stringify({ error: 'Too many requests' }), { status: 429 })
    }

    const { data, error } = await validateRequest(request, createEnquirySchema)
    if (error) {
      console.log('Enquiry: Validation failed', error)
      return error
    }

    const adminSupabase = await createAdminClient()
    const supabase = await createClient()

    // Resolve propertyId if it's a slug
    let propertyId = data.propertyId
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(propertyId)

    if (!isUUID) {
      const { data: propData } = await adminSupabase
        .from('properties')
        .select('id')
        .eq('slug', propertyId)
        .single()

      if (propData) {
        // @ts-ignore
        propertyId = propData.id
      } else {
        return new Response(JSON.stringify({ error: 'Property not found' }), { status: 404 })
      }
    }

    // Get current user if authenticated
    const { data: { user } } = await supabase.auth.getUser()

    // Create enquiry using admin client
    const { data: enquiry, error: createError } = await adminSupabase
      .from('enquiries')
      // @ts-ignore
      .insert({
        property_id: propertyId,
        user_id: user?.id || null,
        full_name: data.name,
        email: data.email,
        phone: data.phone,
        message: data.message,
        investment_amount: data.investmentAmount ? parseFloat(String(data.investmentAmount)) : null,
        status: 'new',
      })
      .select()
      .single()

    if (createError) {
      console.error('Enquiry: Database creation failed:', createError)
      throw createError
    }

    return successResponse({
      enquiry,
      message: 'Enquiry submitted successfully.',
    }, 201)
  } catch (error: any) {
    console.error('Enquiry: Internal Error:', error)
    return handleApiError(error)
  }
}
