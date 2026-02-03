'use client'

import { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react'
import { User } from '@supabase/supabase-js'
import { getSupabaseClient } from '@/lib/supabase/client'
import { getUserProfile } from './auth'
import type { Database } from '@/lib/supabase/types'

type UserProfile = Database['public']['Tables']['users']['Row']

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Helper to check if an error is an abort (component unmounted during fetch)
function isAbortError(error: unknown): boolean {
  return error instanceof Error && (
    error.name === 'AbortError' ||
    error.message.includes('signal is aborted') ||
    error.message.includes('aborted')
  )
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  // Use singleton client to prevent AbortError from multiple client instances
  const supabase = getSupabaseClient()

  // Track mounted state to prevent state updates after unmount
  const mountedRef = useRef(true)

  // Track which user ID we've already loaded a profile for to prevent duplicate fetches
  const loadedProfileRef = useRef<string | null>(null)
  const profileLoadingRef = useRef<Promise<void> | null>(null)

  const loadProfile = useCallback(async (userId: string, force = false) => {
    // Skip if we already loaded this user's profile (prevents duplicate calls)
    if (!force && loadedProfileRef.current === userId) {
      if (mountedRef.current) setLoading(false)
      return
    }

    // If a load is already in progress for the same user, wait for it
    if (profileLoadingRef.current && loadedProfileRef.current === userId) {
      await profileLoadingRef.current
      return
    }

    loadedProfileRef.current = userId

    const loadPromise = (async () => {
      try {
        const profileData = await getUserProfile(userId)
        if (mountedRef.current) setProfile(profileData)
      } catch (error) {
        if (isAbortError(error)) return // Silently ignore abort errors
        console.error('Error loading profile:', error)
        if (mountedRef.current) setProfile(null)
        loadedProfileRef.current = null
      } finally {
        if (mountedRef.current) setLoading(false)
        profileLoadingRef.current = null
      }
    })()

    profileLoadingRef.current = loadPromise
    await loadPromise
  }, [])

  useEffect(() => {
    mountedRef.current = true

    // Get initial session
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!mountedRef.current) return
        setUser(session?.user ?? null)
        if (session?.user) {
          await loadProfile(session.user.id)
        } else {
          if (mountedRef.current) setLoading(false)
        }
      } catch (error) {
        if (isAbortError(error)) return // Silently ignore abort errors
        console.error('Error initializing auth:', error)
        if (mountedRef.current) setLoading(false)
      }
    }

    initializeAuth()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mountedRef.current) return
      setUser(session?.user ?? null)
      if (session?.user) {
        // This will be a no-op if handleSignIn or initializeAuth already loaded the profile
        await loadProfile(session.user.id)
      } else {
        setProfile(null)
        loadedProfileRef.current = null
        setLoading(false)
      }
    })

    return () => {
      mountedRef.current = false
      subscription.unsubscribe()
    }
  }, [supabase, loadProfile])

  const refreshProfile = async () => {
    if (user) {
      await loadProfile(user.id, true)
    }
  }

  const handleSignIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return { error }
      }

      if (data.user) {
        setUser(data.user)
        await loadProfile(data.user.id)
      }

      return { error: null }
    } catch (err) {
      return { error: err as Error }
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    loadedProfileRef.current = null
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signIn: handleSignIn,
        signOut: handleSignOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
