'use client'

import { useAuth } from './AuthProvider'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [user, loading, router])

  if (loading) {
    return <div>Loading...</div>
  }

  if (!user) {
    return null
  }

  return <>{children}</>
}

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/auth/login')
      } else if (
        profile &&
        profile.role !== 'admin' &&
        profile.role !== 'super_admin'
      ) {
        router.push('/unauthorized')
      }
    }
  }, [user, profile, loading, router])

  if (loading) {
    return <div>Loading...</div>
  }

  if (!user || !profile) {
    return null
  }

  if (profile.role !== 'admin' && profile.role !== 'super_admin') {
    return null
  }

  return <>{children}</>
}
