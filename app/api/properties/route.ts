import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  successResponse,
  handleApiError,
  getPaginationParams,
  createPaginatedResponse,
} from '@/lib/api/utils'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const searchParams = request.nextUrl.searchParams
    const { page = 1, limit = 10 } = getPaginationParams(request)

    // Get filters from query params
    const categoryId = searchParams.get('categoryId')
    const location = searchParams.get('location')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const bedrooms = searchParams.get('bedrooms')
    const propertyType = searchParams.get('propertyType')
    const status = searchParams.get('status') || 'available'

    // Build query
    let query = supabase
      .from('properties')
      .select(
        `
        *,
        category:categories(*),
        images:property_images(*)
      `,
        { count: 'exact' }
      )
      .eq('status', status)
      .order('created_at', { ascending: false })

    // Apply filters
    if (categoryId) query = query.eq('category_id', categoryId)
    if (location) query = query.ilike('location', `%${location}%`)
    if (minPrice) query = query.gte('price', parseFloat(minPrice))
    if (maxPrice) query = query.lte('price', parseFloat(maxPrice))
    if (bedrooms) query = query.eq('bedrooms', parseInt(bedrooms))
    if (propertyType) query = query.eq('property_type', propertyType)

    // Apply pagination
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    const { data, error, count } = await query

    if (error) throw error

    const paginatedResponse = createPaginatedResponse(
      data || [],
      count || 0,
      page,
      limit
    )

    return successResponse(paginatedResponse)
  } catch (error) {
    return handleApiError(error)
  }
}
