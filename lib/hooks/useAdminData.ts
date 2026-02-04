'use client'

import useSWR, { mutate } from 'swr'
import { getSupabaseClient } from '@/lib/supabase/client'

/**
 * Centralized fetcher for SWR with better error handling
 */
const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) {
    const error = new Error('Failed to fetch')
    throw error
  }
  const json = await res.json()
  return json.data
}

/**
 * Get cached dashboard data from localStorage for instant loads
 */
function getDashboardFallback() {
  if (typeof window === 'undefined') return undefined
  try {
    const cached = localStorage.getItem('cv-dashboard-cache')
    if (cached) {
      const parsed = JSON.parse(cached)
      // Check if cache is less than 5 minutes old
      if (Date.now() - parsed.timestamp < 5 * 60 * 1000) {
        return parsed.data
      }
    }
  } catch (e) {
    // Ignore
  }
  return undefined
}

/**
 * Hook for fetching dashboard stats with caching and instant loads
 * Uses the cached API endpoint for server-side caching
 * Plus localStorage fallback for instant client-side loads
 */
export function useDashboardStats() {
  return useSWR('/api/admin/dashboard', fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 30000, // 30 seconds
    refreshInterval: 60000, // Refresh every 60 seconds
    fallbackData: getDashboardFallback(),
    keepPreviousData: true, // Show stale data while loading
    onSuccess: (data) => {
      // Cache in localStorage for instant loads on refresh
      if (typeof window !== 'undefined' && data) {
        try {
          localStorage.setItem('cv-dashboard-cache', JSON.stringify({
            data,
            timestamp: Date.now(),
          }))
        } catch (e) {
          // Ignore storage errors
        }
      }
    },
  })
}

/**
 * Invalidate dashboard cache - call this after mutations
 */
export function invalidateDashboard() {
  mutate('/api/admin/dashboard')
  if (typeof window !== 'undefined') {
    localStorage.removeItem('cv-dashboard-cache')
  }
}

/**
 * Hook for fetching properties list with caching
 */
export function useAdminProperties(filters?: Record<string, any>) {
  const supabase = getSupabaseClient()
  const cacheKey = ['admin-properties', filters]

  return useSWR(
    cacheKey,
    async () => {
      let query = supabase
        .from('properties')
        .select(`
          *,
          categories (name, icon),
          property_images (image_url, is_primary)
        `)
        .order('created_at', { ascending: false })

      if (filters?.status) {
        query = query.eq('status', filters.status)
      }
      if (filters?.is_featured !== undefined) {
        query = query.eq('is_featured', filters.is_featured)
      }

      const { data, error } = await query
      if (error) throw error
      return data
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 30000,
    }
  )
}

/**
 * Hook for fetching users list with caching
 */
export function useAdminUsers() {
  const supabase = getSupabaseClient()

  return useSWR(
    'admin-users',
    async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 30000,
    }
  )
}

/**
 * Hook for fetching leads/enquiries with caching
 */
export function useAdminLeads(dateRange?: { start: string | null; end: string | null }) {
  const supabase = getSupabaseClient()
  const cacheKey = ['admin-leads', dateRange]

  return useSWR(
    cacheKey,
    async () => {
      let leadsQuery = supabase
        .from('property_leads')
        .select('*, properties (title, location), users:assigned_to (full_name)')
        .order('created_at', { ascending: false })

      let enquiriesQuery = supabase
        .from('enquiries')
        .select('*, properties (title, location), users:assigned_to (full_name)')
        .order('created_at', { ascending: false })

      let contactsQuery = supabase
        .from('contact_messages')
        .select('*, users:assigned_to (full_name)')
        .order('created_at', { ascending: false })

      if (dateRange?.start && dateRange?.end) {
        const startDate = new Date(dateRange.start).toISOString()
        const endDate = new Date(dateRange.end + 'T23:59:59').toISOString()

        leadsQuery = leadsQuery.gte('created_at', startDate).lte('created_at', endDate)
        enquiriesQuery = enquiriesQuery.gte('created_at', startDate).lte('created_at', endDate)
        contactsQuery = contactsQuery.gte('created_at', startDate).lte('created_at', endDate)
      }

      const [leadsResult, enquiriesResult, contactsResult] = await Promise.all([
        leadsQuery,
        enquiriesQuery,
        contactsQuery,
      ])

      if (leadsResult.error) throw leadsResult.error
      if (enquiriesResult.error) throw enquiriesResult.error
      if (contactsResult.error) throw contactsResult.error

      return {
        leads: leadsResult.data || [],
        enquiries: enquiriesResult.data || [],
        contacts: contactsResult.data || [],
      }
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 30000,
    }
  )
}

/**
 * Hook for fetching groups with caching
 */
export function useAdminGroups() {
  const supabase = getSupabaseClient()

  return useSWR(
    'admin-groups',
    async () => {
      const { data, error } = await supabase
        .from('property_groups')
        .select(`
          *,
          properties (title, location, price),
          group_members (id, investment_amount)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Process data
      return (data || []).map((group: any) => {
        const members = group.group_members || []
        const currentAmount = members.reduce((sum: number, m: any) => sum + (m.investment_amount || 0), 0)
        const isFull = (group.filled_slots || 0) >= (group.total_slots || 5)
        const status = group.is_locked ? 'closed' : (isFull ? 'full' : 'open')

        return {
          ...group,
          status: group.status || status,
          _count: { group_members: members.length },
          current_amount: currentAmount,
        }
      })
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 30000,
    }
  )
}

// ============================================
// Public website hooks with long-term caching
// ============================================

/**
 * Get cached cities from localStorage
 */
function getCitiesFallback(): any[] | undefined {
  if (typeof window === 'undefined') return undefined
  try {
    const cached = localStorage.getItem('cv-cities-cache')
    if (cached) {
      const parsed = JSON.parse(cached)
      // Cities cache for 30 minutes
      if (Date.now() - parsed.timestamp < 30 * 60 * 1000) {
        return parsed.data
      }
    }
  } catch (e) {
    // Ignore
  }
  return undefined
}

/**
 * Hook for fetching cities list - rarely changes, so long cache
 */
export function useCities() {
  return useSWR(
    '/api/search/cities',
    async (url) => {
      const res = await fetch(url)
      if (!res.ok) throw new Error('Failed to fetch cities')
      const json = await res.json()
      return json.cities || []
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 300000, // 5 minutes
      refreshInterval: 600000, // Refresh every 10 minutes
      fallbackData: getCitiesFallback(),
      keepPreviousData: true,
      onSuccess: (data) => {
        if (typeof window !== 'undefined' && data && data.length > 0) {
          try {
            localStorage.setItem('cv-cities-cache', JSON.stringify({
              data,
              timestamp: Date.now(),
            }))
          } catch (e) {
            // Ignore
          }
        }
      },
    }
  )
}

/**
 * Get cached configurations from localStorage
 */
function getConfigurationsFallback(): any[] | undefined {
  if (typeof window === 'undefined') return undefined
  try {
    const cached = localStorage.getItem('cv-configurations-cache')
    if (cached) {
      const parsed = JSON.parse(cached)
      if (Date.now() - parsed.timestamp < 30 * 60 * 1000) {
        return parsed.data
      }
    }
  } catch (e) {
    // Ignore
  }
  return undefined
}

/**
 * Hook for fetching property configurations - rarely changes, so long cache
 */
export function useConfigurations() {
  return useSWR(
    '/api/search/configurations',
    async (url) => {
      const res = await fetch(url)
      if (!res.ok) throw new Error('Failed to fetch configurations')
      const json = await res.json()
      return json.configurations || []
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 300000,
      refreshInterval: 600000,
      fallbackData: getConfigurationsFallback(),
      keepPreviousData: true,
      onSuccess: (data) => {
        if (typeof window !== 'undefined' && data && data.length > 0) {
          try {
            localStorage.setItem('cv-configurations-cache', JSON.stringify({
              data,
              timestamp: Date.now(),
            }))
          } catch (e) {
            // Ignore
          }
        }
      },
    }
  )
}
