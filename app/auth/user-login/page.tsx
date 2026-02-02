"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

// This page redirects to the phone-login page
// Kept for backwards compatibility with old links
export default function UserLoginPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/auth/phone-login')
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-coral-light via-white to-blue-50 flex items-center justify-center p-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-coral-600"></div>
    </div>
  )
}
