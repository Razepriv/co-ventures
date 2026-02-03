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
 * Production-ready Rate Limiter with automatic TTL cleanup
 *
 * Features:
 * - Sliding window rate limiting
 * - Automatic cleanup of expired entries (prevents memory leaks)
 * - Configurable max entries to prevent unbounded growth
 * - Thread-safe for single Node.js process
 */

interface RateLimitEntry {
  count: number
  resetTime: number
}

class RateLimiter {
  private store: Map<string, RateLimitEntry> = new Map()
  private cleanupInterval: NodeJS.Timeout | null = null
  private readonly maxEntries: number
  private readonly cleanupIntervalMs: number

  constructor(options?: { maxEntries?: number; cleanupIntervalMs?: number }) {
    this.maxEntries = options?.maxEntries ?? 10000 // Max 10k entries
    this.cleanupIntervalMs = options?.cleanupIntervalMs ?? 60000 // Cleanup every minute
    this.startCleanup()
  }

  /**
   * Start periodic cleanup of expired entries
   */
  private startCleanup(): void {
    // Only start cleanup in server environment
    if (typeof setInterval !== 'undefined' && !this.cleanupInterval) {
      this.cleanupInterval = setInterval(() => {
        this.cleanup()
      }, this.cleanupIntervalMs)

      // Don't prevent Node.js from exiting
      if (this.cleanupInterval.unref) {
        this.cleanupInterval.unref()
      }
    }
  }

  /**
   * Remove expired entries and enforce max entries limit
   */
  private cleanup(): void {
    const now = Date.now()
    let deletedCount = 0

    // Remove expired entries
    for (const [key, value] of this.store) {
      if (now > value.resetTime) {
        this.store.delete(key)
        deletedCount++
      }
    }

    // If still over max entries, remove oldest entries
    if (this.store.size > this.maxEntries) {
      const entries = Array.from(this.store.entries())
        .sort((a, b) => a[1].resetTime - b[1].resetTime)

      const toRemove = this.store.size - this.maxEntries
      for (let i = 0; i < toRemove; i++) {
        this.store.delete(entries[i][0])
      }
    }

    if (deletedCount > 0 || this.store.size > this.maxEntries * 0.9) {
      console.log(`[RateLimiter] Cleanup: removed ${deletedCount} expired entries, ${this.store.size} active`)
    }
  }

  /**
   * Check and update rate limit for an identifier
   */
  check(
    identifier: string,
    maxRequests: number,
    windowMs: number
  ): { success: boolean; remaining: number; resetTime: number } {
    const now = Date.now()
    const record = this.store.get(identifier)

    // New entry or expired entry
    if (!record || now > record.resetTime) {
      const resetTime = now + windowMs
      this.store.set(identifier, { count: 1, resetTime })
      return { success: true, remaining: maxRequests - 1, resetTime }
    }

    // Rate limit exceeded
    if (record.count >= maxRequests) {
      return { success: false, remaining: 0, resetTime: record.resetTime }
    }

    // Increment count
    record.count++
    return {
      success: true,
      remaining: maxRequests - record.count,
      resetTime: record.resetTime,
    }
  }

  /**
   * Get current store size (for monitoring)
   */
  get size(): number {
    return this.store.size
  }

  /**
   * Stop the cleanup interval (for graceful shutdown)
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }
    this.store.clear()
  }
}

// Singleton rate limiter instance
const rateLimiter = new RateLimiter()

/**
 * Rate limit a request by identifier
 *
 * @param identifier - Unique identifier (e.g., IP address, user ID)
 * @param maxRequests - Maximum requests allowed in the window (default: 100)
 * @param windowMs - Time window in milliseconds (default: 60000 = 1 minute)
 * @returns Object with success status, remaining requests, and reset time
 */
export function rateLimit(
  identifier: string,
  maxRequests = 100,
  windowMs = 60000
): { success: boolean; remaining: number; resetTime: number } {
  return rateLimiter.check(identifier, maxRequests, windowMs)
}

/**
 * Get rate limiter stats (for monitoring endpoints)
 */
export function getRateLimiterStats(): { activeEntries: number } {
  return { activeEntries: rateLimiter.size }
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
