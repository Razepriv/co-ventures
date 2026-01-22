import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const { email, password, fullName, phone, firebase_uid } = await request.json()

    // Validate required fields
    if (!email || !password || !fullName) {
      return NextResponse.json(
        { error: 'Email, password, and full name are required' },
        { status: 400 }
      )
    }

    // Create Supabase client
    const supabase = await createClient()

    // Sign up the user
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone: phone || null,
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback`,
      },
    })

    if (signUpError) {
      return NextResponse.json(
        { error: signUpError.message },
        { status: 400 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      )
    }

    // Create user profile in the users table with 'user' role
    const { error: profileError } = await supabase
      .from('users')
      // @ts-ignore
      .insert({
        id: authData.user.id,
        email: authData.user.email!,
        full_name: fullName,
        phone: phone || null,
        firebase_uid: firebase_uid || null,
        role: 'user', // Regular user role
      })

    if (profileError) {
      console.error('Profile creation error:', profileError)
      // Don't fail the signup if profile creation fails
      // The user is still created in auth
    }

    return NextResponse.json({
      success: true,
      message: 'User account created successfully',
      user: {
        id: authData.user.id,
        email: authData.user.email,
      },
    })
  } catch (error) {
    console.error('User signup error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
