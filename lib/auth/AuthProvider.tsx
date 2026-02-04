'use client'

import { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react'
import { User, Session } from '@supabase/supabase-js'
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

// Session storage key for faster initial load
const SESSION_CACHE_KEY = 'cv_auth_session'
const PROFILE_CACHE_KEY = 'cv_auth_profile'

// Helper to check if an error is an abort (component unmounted during fetch)
function isAbortError(error: unknown): boolean {
  return error instanceof Error && (
    error.name === 'AbortError' ||
    error.message.includes('signal is aborted') ||
    error.message.includes('aborted')
  )
}

// Get cached session from sessionStorage for instant initial state
function getCachedAuth(): { user: User | null; profile: UserProfile | null } {
  if (typeof window === 'undefined') return { user: null, profile: null }
  
  try {
    const cachedSession = sessionStorage.getItem(SESSION_CACHE_KEY)
    const cachedProfile = sessionStorage.getItem(PROFILE_CACHE_KEY)
    
    if (cachedSession && cachedProfile) {
      const session = JSON.parse(cachedSession) as Session
      const profile = JSON.parse(cachedProfile) as UserProfile
      
      // Check if session is still valid (not expired)
      if (session.expires_at && session.expires_at * 1000 > Date.now()) {
        return { user: session.user, profile }
      }
    }
  } catch (e) {
    // Ignore errors reading cache
  }
  
  return { user: null, profile: null }
}

// Save session to sessionStorage for faster subsequent loads
function cacheAuth(session: Session | null, profile: UserProfile | null) {
  if (typeof window === 'undefined') return
  
  try {
    if (session && profile) {
      sessionStorage.setItem(SESSION_CACHE_KEY, JSON.stringify(session))
      sessionStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(profile))
    } else {
      sessionStorage.removeItem(SESSION_CACHE_KEY)
      sessionStorage.removeItem(PROFILE_CACHE_KEY)
    }
  } catch (e) {
    // Ignore errors writing cache
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Initialize with cached data for instant load
  const cachedAuth = getCachedAuth()
  const [user, setUser] = useState<User | null>(cachedAuth.user)
  const [profile, setProfile] = useState<UserProfile | null>(cachedAuth.profile)
  // If we have cached data, start as not loading
  const [loading, setLoading] = useState(!cachedAuth.user)

  // Use singleton client to prevent AbortError from multiple client instances
  const supabase = getSupabaseClient()

  // Track mounted state to prevent state updates after unmount
  const mountedRef = useRef(true)

  // Track which user ID we've already loaded a profile for to prevent duplicate fetches
  const loadedProfileRef = useRef<string | null>(cachedAuth.user?.id || null)
  const profileLoadingRef = useRef<Promise<void> | null>(null)
  const sessionRef = useRef<Session | null>(null)

  const loadProfile = useCallback(async (userId: string, force = false) => {
    // Skip if we already loaded this user's profile (prevents duplicate calls)
    if (!force && loadedProfileRef.current === userId && profile) {
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
        if (mountedRef.current) {
          setProfile(profileData)
          // Cache the session and profile for faster subsequent loads
          cacheAuth(sessionRef.current, profileData)
        }
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
  }, [profile])

  useEffect(() => {
    mountedRef.current = true

    // Get initial session
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!mountedRef.current) return
        
        sessionRef.current = session
        
        // If we already have cached data for the same user, just validate it
        if (session?.user && user?.id === session.user.id && profile) {
          setLoading(false)
          return
        }
        
        setUser(session?.user ?? null)
        if (session?.user) {
          await loadProfile(session.user.id)
        } else {
          // No session, clear cached data
          cacheAuth(null, null)
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
      
      sessionRef.current = session
      setUser(session?.user ?? null)
      
      if (session?.user) {
        // This will be a no-op if handleSignIn or initializeAuth already loaded the profile
        await loadProfile(session.user.id)
      } else {
        setProfile(null)
        loadedProfileRef.current = null
        cacheAuth(null, null)
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
    sessionRef.current = null
    cacheAuth(null, null)
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
