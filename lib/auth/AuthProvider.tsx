'use client'

import { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react'
import { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [supabase] = useState(() => createClient())

  // Track which user ID we've already loaded a profile for to prevent duplicate fetches
  const loadedProfileRef = useRef<string | null>(null)
  const profileLoadingRef = useRef<Promise<void> | null>(null)

  const loadProfile = useCallback(async (userId: string, force = false) => {
    // Skip if we already loaded this user's profile (prevents duplicate calls)
    if (!force && loadedProfileRef.current === userId) {
      setLoading(false)
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
        setProfile(profileData)
      } catch (error) {
        console.error('Error loading profile:', error)
        setProfile(null)
        loadedProfileRef.current = null
      } finally {
        setLoading(false)
        profileLoadingRef.current = null
      }
    })()

    profileLoadingRef.current = loadPromise
    await loadPromise
  }, [])

  useEffect(() => {
    // Get initial session
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setUser(session?.user ?? null)
        if (session?.user) {
          await loadProfile(session.user.id)
        } else {
          setLoading(false)
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
        setLoading(false)
      }
    }

    initializeAuth()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
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

    return () => subscription.unsubscribe()
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
