'use client'

/**
 * Simple in-memory cache with TTL support for admin panel data
 * This reduces redundant API calls when navigating between admin pages
 */

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

class CacheService {
  private cache = new Map<string, CacheEntry<any>>()
  private defaultTTL = 30000 // 30 seconds default TTL

  /**
   * Get cached data if not expired
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    if (!entry) return null

    const isExpired = Date.now() - entry.timestamp > entry.ttl
    if (isExpired) {
      this.cache.delete(key)
      return null
    }

    return entry.data as T
  }

  /**
   * Set data in cache with optional TTL (in milliseconds)
   */
  set<T>(key: string, data: T, ttl: number = this.defaultTTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    })
  }

  /**
   * Check if key exists and is not expired
   */
  has(key: string): boolean {
    return this.get(key) !== null
  }

  /**
   * Invalidate a specific key
   */
  invalidate(key: string): void {
    this.cache.delete(key)
  }

  /**
   * Invalidate all keys matching a pattern
   */
  invalidatePattern(pattern: string): void {
    const regex = new RegExp(pattern)
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key)
      }
    }
  }

  /**
   * Clear all cached data
   */
  clear(): void {
    this.cache.clear()
  }

  /**
   * Get or fetch data with caching
   * If cached data exists and is not expired, return it
   * Otherwise, call the fetcher function and cache the result
   */
  async getOrFetch<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number = this.defaultTTL
  ): Promise<T> {
    const cached = this.get<T>(key)
    if (cached !== null) {
      return cached
    }

    const data = await fetcher()
    this.set(key, data, ttl)
    return data
  }
}

// Singleton instance
export const cacheService = new CacheService()

// Cache keys for admin panel
export const CACHE_KEYS = {
  DASHBOARD_STATS: 'admin:dashboard:stats',
  PROPERTIES_LIST: 'admin:properties:list',
  USERS_LIST: 'admin:users:list',
  LEADS_LIST: 'admin:leads:list',
  GROUPS_LIST: 'admin:groups:list',
  BLOG_POSTS: 'admin:blog:posts',
  TESTIMONIALS: 'admin:testimonials:list',
  ANALYTICS: 'admin:analytics',
  SETTINGS: 'admin:settings',
} as const

// TTL values in milliseconds
export const CACHE_TTL = {
  SHORT: 10000,    // 10 seconds - for frequently changing data
  MEDIUM: 30000,   // 30 seconds - default
  LONG: 60000,     // 1 minute - for stable data
  VERY_LONG: 300000, // 5 minutes - for rarely changing data
} as const
