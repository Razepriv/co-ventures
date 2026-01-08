import { NextRequest } from 'next/server'
import { signIn } from '@/lib/auth/auth'
import { successResponse, errorResponse, handleApiError, validateRequest } from '@/lib/api/utils'
import { signInSchema } from '@/lib/api/validation'

export async function POST(request: NextRequest) {
  try {
    // Validate request body
    const { data, error } = await validateRequest(request, signInSchema)
    if (error) return error

    // Sign in user
    const result = await signIn(data)

    return successResponse({
      user: result.user,
      session: result.session,
      message: 'Signed in successfully',
    })
  } catch (error: any) {
    if (error.message.includes('Invalid login credentials')) {
      return errorResponse('Invalid email or password', 401)
    }
    return handleApiError(error)
  }
}
