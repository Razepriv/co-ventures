import { updateSession } from '@/lib/supabase/middleware'
import { type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Only run middleware on routes that need authentication:
     * - /admin (admin panel)
     * - /profile (user profile)
     * - /api routes (except public ones like search)
     *
     * Public pages like /, /properties, /blog, /about, /contact
     * don't need middleware auth checks - this significantly improves load time
     */
    '/admin/:path*',
    '/profile/:path*',
    '/api/((?!search|public).*)',
  ],
}
