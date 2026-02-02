import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { successResponse, errorResponse, handleApiError } from '@/lib/api/utils'

// Lazy initialize Supabase admin client to avoid build-time errors
function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase URL and Service Role Key are required')
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin()
    const { email, password, fullName } = await request.json()

    if (!email || !password || !fullName) {
      return errorResponse('Email, password, and full name are required', 400)
    }

    // Check if user already exists (using admin client to bypass RLS)
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    if (existingUser) {
      return errorResponse('Email already registered', 409)
    }

    // Create auth user (auto-confirmed)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
      },
    })

    if (authError) {
      return errorResponse(authError.message, 400)
    }

    if (!authData.user) {
      return errorResponse('Failed to create user', 500)
    }

    // Create/update profile in public.users table as super_admin (bypasses RLS)
    // Note: A database trigger may have already created a basic profile, so we use upsert
    const { error: profileError } = await supabaseAdmin
      .from('users')
      .upsert({
        id: authData.user.id,
        email: email,
        role: 'super_admin',
        full_name: fullName,
      }, {
        onConflict: 'id',
        ignoreDuplicates: false // We want to update existing records
      })

    if (profileError) {
      // Clean up auth user if profile creation fails
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      return errorResponse(`Profile creation failed: ${profileError.message}`, 500)
    }

    return successResponse(
      {
        user: {
          id: authData.user.id,
          email: authData.user.email,
        },
        message: 'Super admin account created successfully',
      },
      201
    )
  } catch (error: any) {
    return handleApiError(error)
  }
}
