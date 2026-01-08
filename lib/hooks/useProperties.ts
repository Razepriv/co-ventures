'use client'

import useSWR from 'swr'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/supabase/types'

type Property = Database['public']['Tables']['properties']['Row']
type PropertyWithImages = Property & {
  images: Database['public']['Tables']['property_images']['Row'][]
  category: Database['public']['Tables']['categories']['Row']
}

interface PropertyFilters {
  categoryId?: string
  location?: string
  minPrice?: number
  maxPrice?: number
  bedrooms?: number
  propertyType?: string
  status?: 'available' | 'pending' | 'sold' | 'draft'
}

/**
 * Fetch all properties with optional filters
 */
export function useProperties(filters?: PropertyFilters) {
  const supabase = createClient()

  return useSWR(
    ['properties', filters],
    async () => {
      let query = supabase
        .from('properties')
        .select(
          `
          *,
          category:categories(*),
          images:property_images(*)
        `
        )
        .order('created_at', { ascending: false })

      // Apply filters
      if (filters?.categoryId) {
        query = query.eq('category_id', filters.categoryId)
      }
      if (filters?.location) {
        query = query.ilike('location', `%${filters.location}%`)
      }
      if (filters?.minPrice) {
        query = query.gte('price', filters.minPrice)
      }
      if (filters?.maxPrice) {
        query = query.lte('price', filters.maxPrice)
      }
      if (filters?.bedrooms) {
        query = query.eq('bedrooms', filters.bedrooms)
      }
      if (filters?.propertyType) {
        query = query.eq('property_type', filters.propertyType)
      }
      if (filters?.status) {
        query = query.eq('status', filters.status)
      }

      const { data, error } = await query

      if (error) throw error
      return data as PropertyWithImages[]
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  )
}

/**
 * Fetch a single property by ID
 */
export function useProperty(id: string) {
  const supabase = createClient()

  return useSWR(
    id ? ['property', id] : null,
    async () => {
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

      // Increment view count
      // @ts-expect-error - Supabase RPC type inference issue
      await supabase.rpc('increment_property_views', { property_id: id })

      return data
    },
    {
      revalidateOnFocus: false,
    }
  )
}

/**
 * Fetch featured properties
 */
export function useFeaturedProperties(limit = 6) {
  const supabase = createClient()

  return useSWR(
    ['featured-properties', limit],
    async () => {
      const { data, error } = await supabase
        .from('properties')
        .select(
          `
          *,
          category:categories(*),
          images:property_images(*)
        `
        )
        .eq('status', 'available')
        .order('views', { ascending: false })
        .limit(limit)

      if (error) throw error
      return data as PropertyWithImages[]
    },
    {
      revalidateOnFocus: false,
    }
  )
}

/**
 * Fetch user's saved properties
 */
export function useSavedProperties(userId?: string) {
  const supabase = createClient()

  return useSWR(
    userId ? ['saved-properties', userId] : null,
    async () => {
      const { data, error } = await supabase
        .from('saved_properties')
        .select(
          `
          *,
          property:properties(
            *,
            category:categories(*),
            images:property_images(*)
          )
        `
        )
        // @ts-ignore
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    }
  )
}

/**
 * Save/unsave a property
 */
export async function toggleSaveProperty(propertyId: string, userId: string) {
  const supabase = createClient()

  // Check if already saved
  const { data: existing } = await supabase
    .from('saved_properties')
    .select('id')
    .eq('property_id', propertyId)
    .eq('user_id', userId)
    .single()

  if (existing) {
    // Unsave
    // @ts-ignore
    const { error } = await supabase
      .from('saved_properties')
      .delete()
      .eq('property_id', propertyId)
      .eq('user_id', userId)

    if (error) throw error
    return { saved: false }
  } else {
    // Save
    const { error } = await supabase
      .from('saved_properties')
      // @ts-ignore - Supabase type inference issue
      .insert({ property_id: propertyId, user_id: userId })

    if (error) throw error
    return { saved: true }
  }
}
