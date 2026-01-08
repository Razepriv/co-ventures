import { NextRequest } from 'next/server'
import { signOut } from '@/lib/auth/auth'
import { successResponse, handleApiError } from '@/lib/api/utils'

export async function POST(request: NextRequest) {
  try {
    await signOut()
    return successResponse({ message: 'Signed out successfully' })
  } catch (error) {
    return handleApiError(error)
  }
}
