import { NextRequest, NextResponse } from 'next/server'
import { ZodError, ZodSchema } from 'zod'

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  errors?: Record<string, string[]>
}

/**
 * Create a successful API response
 */
export function successResponse<T>(data: T, status = 200): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
    },
    { status }
  )
}

/**
 * Create an error API response
 */
export function errorResponse(
  error: string,
  status = 400,
  errors?: Record<string, string[]>
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error,
      errors,
    },
    { status }
  )
}

/**
 * Validate request body against a Zod schema
 */
export async function validateRequest<T>(
  request: NextRequest,
  schema: ZodSchema<T>
): Promise<{ data: T; error: null } | { data: null; error: NextResponse }> {
  try {
    const body = await request.json()
    const validatedData = schema.parse(body)
    return { data: validatedData, error: null }
  } catch (error) {
    if (error instanceof ZodError) {
      const errors = error.issues.reduce((acc: Record<string, string[]>, curr) => {
        const path = curr.path.join('.')
        if (!acc[path]) {
          acc[path] = []
        }
        acc[path].push(curr.message)
        return acc
      }, {} as Record<string, string[]>)

      return {
        data: null,
        error: errorResponse('Validation failed', 400, errors),
      }
    }

    return {
      data: null,
      error: errorResponse('Invalid request body', 400),
    }
  }
}

/**
 * Handle API errors consistently
 */
export function handleApiError(error: unknown): NextResponse<ApiResponse> {
  console.error('API Error:', error)

  if (error instanceof Error) {
    return errorResponse(error.message, 500)
  }

  return errorResponse('Internal server error', 500)
}

/**
 * Rate limiting (simple in-memory implementation)
 */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

export function rateLimit(
  identifier: string,
  maxRequests = 100,
  windowMs = 60000
): { success: boolean; remaining: number; resetTime: number } {
  const now = Date.now()
  const record = rateLimitMap.get(identifier)

  if (!record || now > record.resetTime) {
    const resetTime = now + windowMs
    rateLimitMap.set(identifier, { count: 1, resetTime })
    return { success: true, remaining: maxRequests - 1, resetTime }
  }

  if (record.count >= maxRequests) {
    return { success: false, remaining: 0, resetTime: record.resetTime }
  }

  record.count++
  return {
    success: true,
    remaining: maxRequests - record.count,
    resetTime: record.resetTime,
  }
}

/**
 * Extract IP address from request
 */
export function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0] : 'unknown'
  return ip
}

/**
 * Paginate results
 */
export interface PaginationParams {
  page?: number
  limit?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasMore: boolean
  }
}

export function getPaginationParams(request: NextRequest): PaginationParams {
  const searchParams = request.nextUrl.searchParams
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '10')

  return {
    page: Math.max(1, page),
    limit: Math.min(100, Math.max(1, limit)),
  }
}

export function createPaginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): PaginatedResponse<T> {
  const totalPages = Math.ceil(total / limit)
  const hasMore = page < totalPages

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasMore,
    },
  }
}
