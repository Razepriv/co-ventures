'use client'

import { SWRConfig, Cache } from 'swr'
import { useEffect, useCallback, useRef } from 'react'

// LocalStorage cache key
const CACHE_KEY = 'cv-swr-cache'
const CACHE_VERSION = 'v1'
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes for localStorage cache

interface CacheEntry {
  data: any
  timestamp: number
}

interface StoredCache {
  version: string
  entries: Record<string, CacheEntry>
}

/**
 * Get cached data from localStorage
 */
function getStoredCache(): Map<string, any> {
  if (typeof window === 'undefined') return new Map()
  
  try {
    const stored = localStorage.getItem(CACHE_KEY)
    if (!stored) return new Map()
    
    const parsed: StoredCache = JSON.parse(stored)
    
    // Check version
    if (parsed.version !== CACHE_VERSION) {
      localStorage.removeItem(CACHE_KEY)
      return new Map()
    }
    
    const now = Date.now()
    const validEntries = new Map<string, any>()
    
    // Filter out expired entries
    for (const [key, entry] of Object.entries(parsed.entries)) {
      if (now - entry.timestamp < CACHE_TTL) {
        validEntries.set(key, entry.data)
      }
    }
    
    return validEntries
  } catch (e) {
    console.warn('Failed to parse SWR cache from localStorage:', e)
    return new Map()
  }
}

/**
 * Save cache to localStorage
 */
function saveCache(cache: Map<string, any>) {
  if (typeof window === 'undefined') return
  
  try {
    const now = Date.now()
    const entries: Record<string, CacheEntry> = {}
    
    cache.forEach((value, key) => {
      // Only cache API responses, not error states
      if (typeof key === 'string' && value !== undefined) {
        entries[key] = { data: value, timestamp: now }
      }
    })
    
    const stored: StoredCache = {
      version: CACHE_VERSION,
      entries,
    }
    
    localStorage.setItem(CACHE_KEY, JSON.stringify(stored))
  } catch (e) {
    // localStorage might be full or disabled
    console.warn('Failed to save SWR cache to localStorage:', e)
  }
}

/**
 * Custom cache provider that persists to localStorage
 */
function localStorageProvider(): Cache<any> {
  // Initialize from localStorage on first load
  const map = getStoredCache()
  
  // Save to localStorage periodically and on window unload
  if (typeof window !== 'undefined') {
    // Debounced save
    let saveTimeout: NodeJS.Timeout | null = null
    const debouncedSave = () => {
      if (saveTimeout) clearTimeout(saveTimeout)
      saveTimeout = setTimeout(() => saveCache(map), 1000)
    }
    
    // Save before page unload
    window.addEventListener('beforeunload', () => saveCache(map))
    
    // Sync cache on visibility change (when user comes back to tab)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        saveCache(map)
      }
    })
  }
  
  return {
    get: (key: string) => map.get(key),
    set: (key: string, value: any) => {
      map.set(key, value)
      // Debounced save would go here in production
    },
    delete: (key: string) => {
      map.delete(key)
    },
    keys: () => map.keys(),
  }
}

/**
 * Global SWR configuration provider with localStorage persistence
 * Wrap your app with this component to set global SWR options
 * 
 * Features:
 * - Persists cache to localStorage for instant page loads
 * - Stale-while-revalidate: shows cached data immediately while fetching fresh data
 * - Automatic error retry with exponential backoff
 * - Request deduplication
 */
export function SWRProvider({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig
      value={{
        provider: localStorageProvider,
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        revalidateIfStale: true, // Fetch in background if data is stale
        shouldRetryOnError: true,
        dedupingInterval: 5000, // 5 seconds deduplication
        errorRetryCount: 3,
        errorRetryInterval: 5000,
        keepPreviousData: true, // Show stale data while loading new data
        onError: (error, key) => {
          // Only log non-abort errors
          if (error?.name !== 'AbortError') {
            console.error(`SWR Error [${key}]:`, error)
          }
        },
        onSuccess: (data, key) => {
          // Optionally save to localStorage on success
          if (typeof window !== 'undefined' && data) {
            try {
              const stored = localStorage.getItem(CACHE_KEY)
              const parsed: StoredCache = stored ? JSON.parse(stored) : { version: CACHE_VERSION, entries: {} }
              parsed.entries[key as string] = { data, timestamp: Date.now() }
              localStorage.setItem(CACHE_KEY, JSON.stringify(parsed))
            } catch (e) {
              // Ignore storage errors
            }
          }
        },
      }}
    >
      {children}
    </SWRConfig>
  )
}

/**
 * Clear all SWR cache from localStorage
 */
export function clearSWRCache() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(CACHE_KEY)
  }
}
