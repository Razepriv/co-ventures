"use client"

import { useState, useEffect, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { auth } from '@/lib/firebase/config'
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult
} from 'firebase/auth'
import { getSupabaseClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Phone, Lock, User, Mail, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

function UserSignupContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [step, setStep] = useState<'details' | 'otp'>('details')
  const [phoneNumber, setPhoneNumber] = useState(searchParams.get('phone') || '+91')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null)
  const [recaptchaVerifier, setRecaptchaVerifier] = useState<RecaptchaVerifier | null>(null)

  const verifierRef = useRef<RecaptchaVerifier | null>(null)

  useEffect(() => {
    // Initialize reCAPTCHA
    if (typeof window !== 'undefined' && !verifierRef.current) {
      const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => {
          console.log('reCAPTCHA verified')
        },
        'expired-callback': () => {
          toast.error('reCAPTCHA expired. Please try again.')
        }
      })
      verifierRef.current = verifier
      setRecaptchaVerifier(verifier)
    }

    return () => {
      if (verifierRef.current) {
        verifierRef.current.clear()
        verifierRef.current = null
      }
    }
  }, [])

  async function handleDetailsSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!fullName.trim()) {
      toast.error('Please enter your full name')
      return
    }

    if (!email.trim() || !email.includes('@')) {
      toast.error('Please enter a valid email')
      return
    }

    if (phoneNumber.length < 13) {
      toast.error('Please enter a valid phone number')
      return
    }

    setLoading(true)

    try {
      // Check if user already exists
      const supabase = getSupabaseClient()
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('phone', phoneNumber)
        .single()

      if (existingUser) {
        toast.error('Account already exists. Please login instead.')
        setLoading(false)
        router.push(`/auth/user-login?phone=${encodeURIComponent(phoneNumber)}`)
        return
      }

      // Send OTP
      await sendOTP()
      setStep('otp')
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  async function sendOTP() {
    if (!recaptchaVerifier) {
      toast.error('reCAPTCHA not initialized. Please refresh the page.')
      return
    }

    try {
      const confirmation = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier)
      setConfirmationResult(confirmation)
      toast.success('OTP sent successfully!')
    } catch (error: any) {
      console.error('Error sending OTP:', error)

      if (error.code === 'auth/invalid-phone-number') {
        toast.error('Invalid phone number format')
      } else if (error.code === 'auth/too-many-requests') {
        toast.error('Too many requests. Please try again later.')
      } else {
        toast.error('Failed to send OTP')
      }

      throw error
    }
  }

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
      // Verify OTP
      const result = await confirmationResult.confirm(otp)
      const firebaseUser = result.user

      // Create user via API
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
        setLoading(false)
        return
      }

      // Update with Firebase fields
      const supabase = getSupabaseClient()
      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single()

      const newUser = userData as any

      if (newUser) {
        await supabase
          .from('users')
          // @ts-ignore
          .update({
            firebase_uid: firebaseUser.uid,
            phone_verified: true,
            last_login_at: new Date().toISOString()
          })
          .eq('id', newUser.id)
      }

      toast.success('Account created successfully!')
      router.push('/')

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

  async function resendOTP() {
    setLoading(true)
    try {
      await sendOTP()
      toast.success('OTP resent successfully!')
    } catch (error) {
      console.error('Error resending OTP:', error)
    } finally {
      setLoading(false)
    }
  }

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

        {/* Signup Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-coral rounded-full mb-4">
              <Phone className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Create Account</h1>
            <p className="mt-2 text-gray-600">
              {step === 'details' && 'Enter your details to get started'}
              {step === 'otp' && 'Verify your phone number'}
            </p>
          </div>

          {/* Details Step */}
          {step === 'details' && (
            <form onSubmit={handleDetailsSubmit} className="space-y-6">
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
                  Phone Number *
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
                {loading ? 'Sending OTP...' : 'Continue'}
              </Button>
            </form>
          )}

          {/* OTP Step */}
          {step === 'otp' && (
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
                {loading ? 'Verifying...' : 'Create Account'}
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
                onClick={() => setStep('details')}
                className="w-full text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                ← Back to details
              </button>
            </form>
          )}

          {/* Login Link */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-center text-sm text-gray-600">
              Already have an account? {' '}
              <Link href="/auth/user-login" className="text-coral font-semibold hover:text-coral-dark">
                Login
              </Link>
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <p className="mt-6 text-center text-xs text-gray-500">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  )
}

export default function UserSignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-coral-light via-white to-blue-50 flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-coral-600"></div>
      </div>
    }>
      <UserSignupContent />
    </Suspense>
  )
}
