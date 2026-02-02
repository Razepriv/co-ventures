import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Create admin client that bypasses RLS for profile creation
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

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

    // Check if user already exists by email (using admin client to bypass RLS)
    const { data: existingByEmail } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    if (existingByEmail) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      )
    }

    // Check if user exists by phone (if provided)
    if (phone) {
      const { data: existingByPhone } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('phone', phone)
        .single()

      if (existingByPhone) {
        return NextResponse.json(
          { error: 'Phone number already registered' },
          { status: 409 }
        )
      }
    }

    // Create auth user using admin client (auto-confirmed for phone auth)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm for phone-verified users
      user_metadata: {
        full_name: fullName,
        phone: phone || null,
      },
    })

    if (authError) {
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      )
    }

    // Update or create user profile in the users table with 'user' role
    // Note: A database trigger may have already created a basic profile, so we use upsert
    const { error: profileError } = await supabaseAdmin
      .from('users')
      .upsert({
        id: authData.user.id,
        email: authData.user.email!,
        full_name: fullName,
        phone: phone || null,
        role: 'user', // Regular user role
        firebase_uid: firebase_uid || null,
        phone_verified: !!phone,
      }, {
        onConflict: 'id',
        ignoreDuplicates: false // We want to update existing records
      })

    if (profileError) {
      console.error('Profile creation error:', profileError)
      // Clean up auth user if profile creation fails
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json(
        { error: `Profile creation failed: ${profileError.message}` },
        { status: 500 }
      )
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
