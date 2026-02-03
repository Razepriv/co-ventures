import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { successResponse, errorResponse, handleApiError } from '@/lib/api/utils'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Create admin client that bypasses RLS
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

export async function POST(request: NextRequest) {
  try {
    // SECURITY: Verify the requester is an authenticated super_admin
    const supabase = await createServerClient()
    const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser()

    if (authError || !currentUser) {
      return errorResponse('Unauthorized - Authentication required', 401)
    }

    // Check if current user is a super_admin
    const { data: currentUserProfile } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', currentUser.id)
      .single()

    if (!currentUserProfile || currentUserProfile.role !== 'super_admin') {
      return errorResponse('Forbidden - Only super admins can create admin accounts', 403)
    }

    const { email, password, fullName, role } = await request.json()

    if (!email || !password || !fullName) {
      return errorResponse('Email, password, and full name are required', 400)
    }

    // Validate role - only allow 'admin' or 'super_admin', default to 'admin'
    const validRoles = ['admin', 'super_admin']
    const assignedRole = validRoles.includes(role) ? role : 'admin'

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
    const { data: authData, error: createAuthError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
      },
    })

    if (createAuthError) {
      return errorResponse(createAuthError.message, 400)
    }

    if (!authData.user) {
      return errorResponse('Failed to create user', 500)
    }

    // Create/update profile in public.users table (bypasses RLS)
    // Note: A database trigger may have already created a basic profile, so we use upsert
    const { error: profileError } = await supabaseAdmin
      .from('users')
      .upsert({
        id: authData.user.id,
        email: email,
        role: assignedRole,
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
          role: assignedRole,
        },
        message: `${assignedRole === 'super_admin' ? 'Super admin' : 'Admin'} account created successfully`,
      },
      201
    )
  } catch (error: any) {
    return handleApiError(error)
  }
}
