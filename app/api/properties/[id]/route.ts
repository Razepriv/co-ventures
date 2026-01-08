import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { successResponse, errorResponse, handleApiError } from '@/lib/api/utils'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { id } = params

    const { data, error } = await supabase
      .from('properties')
      .select(
        `
        *,
        category:categories(*),
        images:property_images(*),
        user:users(id, full_name, email, phone)
      `
      )
      .eq('id', id)
      .single()

    if (error) throw error
    if (!data) {
      return errorResponse('Property not found', 404)
    }

    // Increment view count
    // @ts-expect-error - Supabase RPC type inference issue
    await supabase.rpc('increment_property_views', { property_id: id })

    return successResponse(data)
  } catch (error) {
    return handleApiError(error)
  }
}
