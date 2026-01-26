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

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: placeholderEmail,
      phone: phone,
      email_confirm: true,
      phone_confirm: true,
      user_metadata: { full_name: fullName, firebase_uid }
    })

    if (authError) {
      // If error is "user already exists", we try to find that user to link profile
      if (authError.message?.toLowerCase().includes('already registered')) {
        // We can't easily get the ID from the error. 
        // Ideally we should have found the profile in Step 1.
        // If we are here, it means Auth User exists but Profile User DOES NOT.
        // We'll proceed to create Profile User. But we need the ID.
        // We can fetch user list and filter (expensive) or just skip Auth creation and try to insert profile?
        // But Profile needs ID referenced to auth.users.

        // Workaround: We will use a random UUID if we can't find the auth user, 
        // BUT that breaks RLS foreign key if 'users.id' references 'auth.users.id'.
        // Let's assume we can't easily recover here without more complex logic, 
        // so we return error asking to contact support or try to just insert profile if the table allows it.
        console.error('Auth User exists but Profile missing for phone:', phone)
      } else {
        console.error('Supabase auth creation failed:', authError)
        return NextResponse.json({ error: authError.message }, { status: 400 })
      }
    }

    if (authData?.user) {
      authUserId = authData.user.id
    }

    // If we still don't have authUserId (e.g. user existed), and we really need one for the FK...
    // We'll skip that complex recovery for now and rely on the happy path or non-FK table.

    if (!authUserId) {
      // Fallback: If we couldn't create/get Auth User, we might fail to insert into public.users if it has FK.
      // Let's try to proceed only if we have an ID or if we can generate one (if no FK).
      // Assuming standard Supabase setup, public.users.id references auth.users.id.
      // If we can't get the ID, we error out.
      if (authError) return NextResponse.json({ error: 'User exists in Auth but profile missing. Contact support.' }, { status: 400 })
    }

    // 3. Create user profile in the users table
    const { data: newUserProfile, error: profileError } = await supabaseAdmin
      .from('users')
      // @ts-ignore
      .insert({
        id: authUserId, // Use the auth user ID
        email: email || null,
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
