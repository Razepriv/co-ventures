"use client"

import { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function PhoneLoginRedirect() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const phone = searchParams.get('phone')
    const url = phone
      ? `/auth/user-login?phone=${encodeURIComponent(phone)}`
      : '/auth/user-login'
    router.replace(url)
  }, [router, searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-coral-600"></div>
    </div>
  )
}

export default function PhoneLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-coral-600"></div>
      </div>
    }>
      <PhoneLoginRedirect />
    </Suspense>
  )
}
