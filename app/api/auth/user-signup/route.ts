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

    // 2. User doesn't exist in 'users' table. We need to create or link:
    //    a) Supabase Auth User (so RLS works, we'll use phone as identifier)
    //    b) Public User Profile

    let authUserId = null

    // Attempt to create Supabase Auth User
    // We use phone as the primary identifier. Email is optional/placeholder.
    const placeholderEmail = email || `${phone.replace(/\D/g, '')}@placeholder.com` // Clean phone for placeholder
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
      if (authError.message?.toLowerCase().includes('already registered') || authError.status === 422) {
        console.log('User already registered in Auth, finding user...');

        // Fetch users with a higher limit to ensure we find the existing user
        // Pagination might be needed for very large user bases, but 1000 is a safe start for this fix
        const { data: userList, error: listError } = await supabaseAdmin.auth.admin.listUsers({
          page: 1,
          perPage: 1000
        })

        if (listError) {
          console.error('Error listing users to find existing account:', listError);
          return NextResponse.json({ error: 'Failed to verify existing account.' }, { status: 500 });
        }

        const existingAuthUser = userList.users.find(u =>
          u.phone === phone ||
          (u.email && u.email.toLowerCase() === placeholderEmail.toLowerCase()) ||
          (u.email && email && u.email.toLowerCase() === email.toLowerCase())
        )

        if (existingAuthUser) {
          authUserId = existingAuthUser.id
          console.log('Found existing auth user:', authUserId);

          // Update password to match firebase_uid for the login bridge
          // Also link the firebase_uid in metadata
          await supabaseAdmin.auth.admin.updateUserById(authUserId, {
            password: userPassword,
            user_metadata: { ...existingAuthUser.user_metadata, firebase_uid }
          })
        } else {
          console.error('Could not find user in list despite "already registered" error. Phone:', phone);
          return NextResponse.json({ error: 'Account exists but could not be retrieved. Please contact support.' }, { status: 400 });
        }
      } else {
        console.error('Supabase auth creation failed:', authError)
        return NextResponse.json({ error: authError.message }, { status: 400 })
      }
    } else if (authData?.user) {
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
      // If profile creation fails (e.g., duplicate key), try to return the existing one if it exists now
      if (profileError.code === '23505') { // Unique violation
        const { data: retryProfile } = await supabaseAdmin
          .from('users')
          .select('*')
          .eq('id', authUserId)
          .single();

        if (retryProfile) {
          return NextResponse.json({
            success: true,
            message: 'User profile retrieved',
            user: retryProfile
          })
        }
      }

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
