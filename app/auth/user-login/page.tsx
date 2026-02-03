"use client"

import { useState, useEffect, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { auth } from '@/lib/firebase/config'
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
} from 'firebase/auth'
import { getSupabaseClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/auth/AuthProvider'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Phone, Lock, User, Mail, ArrowLeft, Loader2, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

type FlowState = 'phone_input' | 'signup_details' | 'otp_login' | 'otp_signup' | 'complete'

function UserLoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, loading: authLoading, signIn: bridgeSignIn } = useAuth()

  // State machine
  const [flowState, setFlowState] = useState<FlowState>('phone_input')

  // Form fields
  const [phoneNumber, setPhoneNumber] = useState(searchParams.get('phone') || '+91')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')

  // Loading
  const [loading, setLoading] = useState(false)

  // Firebase refs
  const verifierRef = useRef<RecaptchaVerifier | null>(null)
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null)

  // Existing user data (populated during phone check for login flow)
  const existingUserRef = useRef<{ id: string; email: string; full_name: string } | null>(null)

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      router.push('/')
    }
  }, [user, authLoading, router])

  // Cleanup reCAPTCHA on unmount
  useEffect(() => {
    return () => {
      if (verifierRef.current) {
        try {
          verifierRef.current.clear()
        } catch (e) {
          // Ignore errors during cleanup
        }
        verifierRef.current = null
      }
    }
  }, [])

  // Show loading while checking auth state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-coral-light via-white to-blue-50 flex items-center justify-center p-4">
        <Loader2 className="h-8 w-8 animate-spin text-coral" />
      </div>
    )
  }

  // Don't render if already logged in (redirect will happen)
  if (user) {
    return null
  }

  // ── Shared helper: initialize reCAPTCHA lazily ──
  function getRecaptchaVerifier(): RecaptchaVerifier {
    // If we already have a valid verifier, return it
    if (verifierRef.current) {
      return verifierRef.current
    }

    // Check DOM element exists
    const container = document.getElementById('recaptcha-container')
    if (!container) {
      throw new Error('reCAPTCHA container not found in DOM')
    }

    // Create new verifier
    const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
      size: 'invisible',
      callback: () => {
        console.log('reCAPTCHA verified')
      },
      'expired-callback': () => {
        toast.error('reCAPTCHA expired. Please try again.')
        // Clear so it can be re-initialized
        if (verifierRef.current) {
          try {
            verifierRef.current.clear()
          } catch (e) {
            // Ignore
          }
          verifierRef.current = null
        }
      }
    })

    verifierRef.current = verifier
    return verifier
  }

  // ── Shared helper: send OTP via Firebase ──
  async function sendOTP() {
    let verifier: RecaptchaVerifier

    try {
      verifier = getRecaptchaVerifier()
    } catch (e: any) {
      console.error('Failed to initialize reCAPTCHA:', e)
      toast.error('Failed to initialize verification. Please refresh the page.')
      throw e
    }

    try {
      const confirmation = await signInWithPhoneNumber(auth, phoneNumber, verifier)
      setConfirmationResult(confirmation)
    } catch (error: any) {
      console.error('Error sending OTP:', error)

      // If captcha-related error, clear and re-init on next attempt
      if (error.code === 'auth/captcha-check-failed' || error.code === 'auth/argument-error') {
        if (verifierRef.current) {
          try {
            verifierRef.current.clear()
          } catch (e) {
            // Ignore cleanup errors
          }
          verifierRef.current = null
        }
      }

      if (error.code === 'auth/invalid-phone-number') {
        toast.error('Invalid phone number format. Use +[country code][number]')
      } else if (error.code === 'auth/too-many-requests') {
        toast.error('Too many requests. Please try again later.')
      } else if (error.code === 'auth/operation-not-allowed') {
        toast.error('Phone authentication is not enabled. Please contact support.')
      } else if (error.code === 'auth/captcha-check-failed') {
        toast.error('reCAPTCHA verification failed. Please refresh and try again.')
      } else if (error.code === 'auth/argument-error') {
        toast.error('Authentication error. Please refresh and try again.')
      } else {
        toast.error('Failed to send OTP. Please try again.')
      }

      throw error
    }
  }

  // ── Step 1: Phone number submission ──
  async function handlePhoneSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (phoneNumber.length < 13) {
      toast.error('Please enter a valid phone number')
      return
    }

    setLoading(true)

    try {
      // Check if phone exists in DB via server API
      const res = await fetch('/api/auth/check-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneNumber })
      })
      const data = await res.json()

      if (data.exists) {
        // LOGIN PATH: user exists, send OTP immediately
        existingUserRef.current = data.user
        await sendOTP()
        setFlowState('otp_login')
        toast.success('OTP sent to your phone!')
      } else {
        // SIGNUP PATH: show details form
        setFlowState('signup_details')
        toast.info('No account found. Let\'s create one!')
      }
    } catch (error: any) {
      console.error('Error:', error)
      // sendOTP already shows specific error toasts
    } finally {
      setLoading(false)
    }
  }

  // ── Step 2 (signup only): Details submission ──
  async function handleSignupDetailsSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!fullName.trim()) {
      toast.error('Please enter your full name')
      return
    }

    if (!email.trim() || !email.includes('@')) {
      toast.error('Please enter a valid email address')
      return
    }

    setLoading(true)

    try {
      await sendOTP()
      setFlowState('otp_signup')
      toast.success('OTP sent to your phone!')
    } catch (error: any) {
      console.error('Error sending OTP:', error)
    } finally {
      setLoading(false)
    }
  }

  // ── Step 3: OTP verification ──
  async function handleOTPSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (otp.length !== 6) {
      toast.error('Please enter the 6-digit OTP')
      return
    }

    if (!confirmationResult) {
      toast.error('Please request OTP first')
      return
    }

    setLoading(true)

    try {
      // Verify OTP with Firebase
      const result = await confirmationResult.confirm(otp)
      const firebaseUser = result.user

      if (flowState === 'otp_login') {
        await handleLoginAfterOTP(firebaseUser)
      } else if (flowState === 'otp_signup') {
        await handleSignupAfterOTP(firebaseUser)
      }
    } catch (error: any) {
      console.error('Error verifying OTP:', error)

      if (error.code === 'auth/invalid-verification-code') {
        toast.error('Invalid OTP. Please try again.')
      } else if (error.code === 'auth/code-expired') {
        toast.error('OTP expired. Please request a new one.')
      } else {
        toast.error('Verification failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  // ── Login completion (existing user) ──
  async function handleLoginAfterOTP(firebaseUser: any) {
    const existingUser = existingUserRef.current
    if (!existingUser) {
      toast.error('User data not found. Please try again.')
      return
    }

    // Update user record with latest firebase_uid and login timestamp
    const supabase = getSupabaseClient()
    await (supabase as any)
      .from('users')
      .update({
        firebase_uid: firebaseUser.uid,
        phone_verified: true,
        last_login_at: new Date().toISOString()
      })
      .eq('id', existingUser.id)

    // Bridge login: establish Supabase session via AuthProvider
    const { error } = await bridgeSignIn(
      existingUser.email,
      firebaseUser.uid
    )

    if (error) {
      console.error('Bridge login error:', error)
      toast.error('Login failed. Please try again.')
      return
    }

    toast.success('Welcome back!')
    setFlowState('complete')
    router.push('/')
  }

  // ── Signup completion (new user) ──
  async function handleSignupAfterOTP(firebaseUser: any) {
    // Step 1: Create user via API
    const response = await fetch('/api/auth/user-signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email,
        password: firebaseUser.uid,
        fullName: fullName,
        phone: phoneNumber,
        firebase_uid: firebaseUser.uid
      })
    })

    const data = await response.json()

    if (!response.ok) {
      toast.error(data.error || 'Failed to create account')
      return
    }

    // Step 2: Bridge login to establish Supabase session
    const { error } = await bridgeSignIn(email, firebaseUser.uid)

    if (error) {
      console.error('Bridge login after signup error:', error)
      toast.error('Account created but login failed. Please try logging in.')
      return
    }

    toast.success('Account created! Welcome to Co Housing Ventures!')
    setFlowState('complete')
    router.push('/')
  }

  // ── Resend OTP ──
  async function resendOTP() {
    setLoading(true)
    try {
      await sendOTP()
      setOtp('')
      toast.success('OTP resent successfully!')
    } catch (error) {
      console.error('Error resending OTP:', error)
    } finally {
      setLoading(false)
    }
  }

  // ── Header content based on state ──
  function getHeaderContent() {
    switch (flowState) {
      case 'phone_input':
        return {
          title: 'Welcome',
          subtitle: 'Enter your phone number to login or create an account'
        }
      case 'signup_details':
        return {
          title: 'Create Account',
          subtitle: 'No account found for this number. Let\'s set one up!'
        }
      case 'otp_login':
        return {
          title: 'Welcome Back',
          subtitle: `Enter the OTP sent to ${phoneNumber}`
        }
      case 'otp_signup':
        return {
          title: 'Verify Your Number',
          subtitle: `Enter the OTP sent to ${phoneNumber}`
        }
      case 'complete':
        return {
          title: 'Success!',
          subtitle: 'Redirecting you...'
        }
    }
  }

  const header = getHeaderContent()

  return (
    <div className="min-h-screen bg-gradient-to-br from-coral-light via-white to-blue-50 flex items-center justify-center p-4">
      {/* reCAPTCHA container */}
      <div id="recaptcha-container"></div>

      <div className="max-w-md w-full">
        {/* Back to Home */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-coral mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-coral rounded-full mb-4">
              {flowState === 'complete' ? (
                <CheckCircle className="h-8 w-8 text-white" />
              ) : (
                <Phone className="h-8 w-8 text-white" />
              )}
            </div>
            <h1 className="text-3xl font-bold text-gray-900">{header.title}</h1>
            <p className="mt-2 text-gray-600">{header.subtitle}</p>
          </div>

          {/* ── Phone Input Step ── */}
          {flowState === 'phone_input' && (
            <form onSubmit={handlePhoneSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+91 9876543210"
                    className="pl-10"
                    required
                  />
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  Enter number with country code (e.g., +91 for India)
                </p>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Checking...
                  </>
                ) : (
                  'Continue'
                )}
              </Button>
            </form>
          )}

          {/* ── Signup Details Step ── */}
          {flowState === 'signup_details' && (
            <form onSubmit={handleSignupDetailsSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Doe"
                    className="pl-10"
                    required
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@example.com"
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type="tel"
                    value={phoneNumber}
                    className="pl-10 bg-gray-50"
                    readOnly
                  />
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  OTP will be sent to this number
                </p>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending OTP...
                  </>
                ) : (
                  'Continue'
                )}
              </Button>

              <button
                type="button"
                onClick={() => setFlowState('phone_input')}
                className="w-full text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                ← Change phone number
              </button>
            </form>
          )}

          {/* ── OTP Step (both login and signup) ── */}
          {(flowState === 'otp_login' || flowState === 'otp_signup') && (
            <form onSubmit={handleOTPSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter OTP
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="123456"
                    className="pl-10 text-center text-2xl tracking-widest"
                    maxLength={6}
                    required
                    autoFocus
                  />
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  OTP sent to {phoneNumber}
                </p>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : flowState === 'otp_login' ? (
                  'Verify & Login'
                ) : (
                  'Verify & Create Account'
                )}
              </Button>

              <button
                type="button"
                onClick={resendOTP}
                disabled={loading}
                className="w-full text-sm text-coral hover:text-coral-dark transition-colors"
              >
                Resend OTP
              </button>

              <button
                type="button"
                onClick={() => {
                  setOtp('')
                  setFlowState(flowState === 'otp_login' ? 'phone_input' : 'signup_details')
                }}
                className="w-full text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                ← Back
              </button>
            </form>
          )}

          {/* ── Complete Step ── */}
          {flowState === 'complete' && (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-coral mx-auto" />
              <p className="mt-4 text-gray-600">Redirecting...</p>
            </div>
          )}

          {/* Admin Login Link */}
          {flowState === 'phone_input' && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-center text-sm text-gray-600">
                Admin? {' '}
                <Link href="/auth/login" className="text-coral font-semibold hover:text-coral-dark">
                  Login as Admin
                </Link>
              </p>
            </div>
          )}
        </div>

        {/* Additional Info */}
        <p className="mt-6 text-center text-xs text-gray-500">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  )
}

export default function UserLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-coral-light via-white to-blue-50 flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-coral-600"></div>
      </div>
    }>
      <UserLoginContent />
    </Suspense>
  )
}
