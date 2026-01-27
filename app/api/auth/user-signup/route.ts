import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const { email, fullName, phone, firebase_uid } = await request.json()

    // Validate required fields - Phone is strict requirement now
    if (!phone) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      )
    }

    // Create Supabase admin client for user operations (bypassing RLS)
    const supabaseAdmin = await createAdminClient()

    // 1. Check if user already exists in 'users' table
    const { data: existingUserProfile } = await supabaseAdmin
      .from('users')
      .select('*')
      .or(`phone.eq.${phone},firebase_uid.eq.${firebase_uid}`)
      .single()

    if (existingUserProfile) {
      // Update firebase_uid if missing
      const profile = existingUserProfile as any
      if (firebase_uid && !profile.firebase_uid) {
        await (supabaseAdmin.from('users') as any).update({ firebase_uid }).eq('id', profile.id)
      }

      return NextResponse.json({
        success: true,
        message: 'User already exists',
        user: existingUserProfile
      })
    }

    // 2. User doesn't exist. We need to create:
    //    a) Supabase Auth User (so RLS works, we'll use phone as identifier)
    //    b) Public User Profile

    let authUserId = null

    // Try to find if auth user exists (maybe from a previous attempt)
    // Note: Admin API doesn't easily search by phone, but `createUser` will fail if exists.

    // Attempt to create Supabase Auth User
    // We use phone as the primary identifier. Email is optional/placeholder.
    const placeholderEmail = email || `${phone}@placeholder.com`
    const userPassword = firebase_uid // Use firebase_uid as the password for the bridge

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: placeholderEmail,
      phone: phone,
      password: userPassword,
      email_confirm: true,
      phone_confirm: true,
      user_metadata: { full_name: fullName, firebase_uid }
    })

    if (authError) {
      // If error is "user already exists", we try to find that user to link profile
      if (authError.message?.toLowerCase().includes('already registered')) {
        // If Auth User exists, we should try to update their password to the current firebase_uid
        // to ensure the login bridge works.
        const { data: userList } = await supabaseAdmin.auth.admin.listUsers()
        const existingAuthUser = userList.users.find(u => u.phone === phone || u.email === placeholderEmail)

        if (existingAuthUser) {
          authUserId = existingAuthUser.id
          // Update password to match firebase_uid for the login bridge
          await supabaseAdmin.auth.admin.updateUserById(authUserId, {
            password: userPassword,
            user_metadata: { firebase_uid }
          })
        }
      } else {
        console.error('Supabase auth creation failed:', authError)
        return NextResponse.json({ error: authError.message }, { status: 400 })
      }
    }

    if (authData?.user) {
      authUserId = authData.user.id
    }

    if (!authUserId) {
      return NextResponse.json({ error: 'Failed to identify or create authenticated user.' }, { status: 400 })
    }

    // 3. Create user profile in the users table
    const { data: newUserProfile, error: profileError } = await supabaseAdmin
      .from('users')
      // @ts-ignore
      .insert({
        id: authUserId, // Use the auth user ID
        email: email || placeholderEmail,
        full_name: fullName,
        phone: phone,
        firebase_uid: firebase_uid,
        role: 'user',
        last_login_at: new Date().toISOString(),
        phone_verified: true,
        is_active: true
      })
      .select()
      .single()

    if (profileError) {
      console.error('Profile creation error:', profileError)
      return NextResponse.json({ error: 'Failed to create user profile' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'User account created successfully',
      user: newUserProfile
    })
  } catch (error) {
    console.error('User signup error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
