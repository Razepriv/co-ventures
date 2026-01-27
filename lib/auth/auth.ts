"use client"
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

export interface SignUpData {
  email: string
  password: string
  fullName: string
  phone?: string
}

export interface SignInData {
  email: string
  password: string
}

export interface ResetPasswordData {
  email: string
}

export interface UpdatePasswordData {
  password: string
}

export interface UpdateProfileData {
  fullName?: string
  phone?: string
  avatarUrl?: string
}

/**
 * Sign up a new user with email and password
 */
export async function signUp({ email, password, fullName, phone }: SignUpData) {
  const supabase = createClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        phone,
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  })

  if (error) {
    throw error
  }

  return data
}

/**
 * Sign in an existing user with email and password
 */
export async function signIn({ email, password }: SignInData) {
  const supabase = createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    throw error
  }

  return data
}

/**
 * Sign out the current user
 */
export async function signOut() {
  const supabase = createClient()

  const { error } = await supabase.auth.signOut()

  if (error) {
    throw error
  }
}

/**
 * Get the current user session
 */
export async function getSession() {
  const supabase = createClient()

  const {
    data: { session },
    error,
  } = await supabase.auth.getSession()

  if (error) {
    throw error
  }

  return session
}

/**
 * Get the current user
 */
export async function getUser(): Promise<User | null> {
  const supabase = createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error) {
    throw error
  }

  return user
}

/**
 * Send a password reset email
 */
export async function resetPassword({ email }: ResetPasswordData) {
  const supabase = createClient()

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
  })

  if (error) {
    throw error
  }
}

/**
 * Update the user's password
 */
export async function updatePassword({ password }: UpdatePasswordData) {
  const supabase = createClient()

  const { error } = await supabase.auth.updateUser({
    password,
  })

  if (error) {
    throw error
  }
}

/**
 * Update the user's profile
 */
export async function updateProfile(data: UpdateProfileData) {
  const supabase = createClient()
  const user = await getUser()

  if (!user) {
    throw new Error('User not authenticated')
  }

  const { error } = await supabase
    .from('users')
    // @ts-expect-error - Supabase type inference issue
    .update({
      full_name: data.fullName,
      phone: data.phone,
      avatar_url: data.avatarUrl,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)

  if (error) {
    throw error
  }
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession()
  return !!session
}

/**
 * Check if user has admin role
 */
export async function isAdmin(): Promise<boolean> {
  const supabase = createClient()
  const user = await getUser()

  if (!user) {
    return false
  }

  const { data, error } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (error || !data) {
    return false
  }

  // @ts-expect-error - Supabase type inference issue
  return data.role === 'admin' || data.role === 'super_admin'
}

/**
 * Get user profile from database
 */
export async function getUserProfile(userId?: string) {
  const supabase = createClient()
  const id = userId || (await getUser())?.id

  if (!id) {
    throw new Error('User ID not provided')
  }

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    throw error
  }

  return data
}
