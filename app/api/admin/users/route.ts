import { NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { successResponse, errorResponse, handleApiError } from '@/lib/api/utils'
import { z } from 'zod'

const createUserSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    full_name: z.string().min(2),
    role: z.enum(['user', 'admin', 'super_admin']).default('user'),
})

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { email, password, full_name, role } = createUserSchema.parse(body)

        const supabase = await createAdminClient()

        // 1. Create user in auth.users
        const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true, // Auto confirm email since an admin is creating it
            user_metadata: {
                full_name,
            },
        })

        if (authError) {
            return errorResponse(authError.message, 400)
        }

        if (!authUser.user) {
            return errorResponse('Failed to create user', 500)
        }

        // 2. Update role in public.users
        // The trigger might have already created the user, so we update it.
        // If the trigger is slow, we might need to wait or upsert.
        // Upserting is safer.
        const { error: profileError } = await supabase
            .from('users')
            // @ts-ignore
            .upsert({
                id: authUser.user.id,
                email: email,
                full_name: full_name,
                role: role,
                // valid defaults
                created_at: new Date().toISOString(),
            })

        if (profileError) {
            // If profile update fails, we might want to delete the auth user to keep consistency?
            // Or just return error. For now, let's return error.
            console.error('Error updating public user profile:', profileError)
            return errorResponse('User created but failed to set profile details', 500)
        }

        return successResponse({
            user: {
                id: authUser.user.id,
                email,
                full_name,
                role,
            }
        }, 201)

    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return errorResponse(error.errors[0].message, 400)
        }
        return handleApiError(error)
    }
}
