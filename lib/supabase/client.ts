import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '../types/database.types'

/**
 * Create a Supabase client for use in the browser
 * This client uses cookies for session management
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    console.error('[Supabase] Missing environment variables')
  }

  return createBrowserClient<Database>(
    url || '',
    key || ''
  )
}

/**
 * Singleton instance for client-side Supabase client
 */
let supabaseClient: ReturnType<typeof createClient> | null = null

export function getSupabaseClient() {
  if (!supabaseClient) {
    supabaseClient = createClient()
  }
  return supabaseClient
}
