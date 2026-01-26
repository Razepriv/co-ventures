"use client"

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { auth } from '@/lib/firebase/config'
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
  PhoneAuthProvider,
  signInWithCredential
} from 'firebase/auth'
import { getSupabaseClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Phone, Lock, User, Mail, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

export default function PhoneLoginPage() {
  const router = useRouter()
  const [step, setStep] = useState<'phone' | 'details' | 'otp'>('phone')
  const [phoneNumber, setPhoneNumber] = useState('+91')
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

  async function handlePhoneSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (phoneNumber.length < 13) {
      toast.error('Please enter a valid phone number')
      return
    }

    setLoading(true)

    try {
      // Skip database check - just send OTP directly
      // User will be verified/created after OTP confirmation
      await sendOTP()
      setStep('otp')
      toast.success('OTP sent successfully!')
    } catch (error: any) {
      console.error('Error sending OTP:', error)
      if (error.code === 'auth/invalid-phone-number') {
        toast.error('Invalid phone number format')
      } else if (error.code === 'auth/too-many-requests') {
        toast.error('Too many attempts. Please try again later.')
      } else {
        toast.error('Failed to send OTP. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

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

    setLoading(true)

    try {
      await sendOTP()
      setStep('otp')
    } catch (error) {
      console.error('Error sending OTP:', error)
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
      console.log('Attempting to send OTP to:', phoneNumber)
      const confirmation = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier)
      setConfirmationResult(confirmation)
      toast.success('OTP sent successfully!')
    } catch (error: any) {
      console.error('Error sending OTP:', error)
      console.error('Error code:', error.code)
      console.error('Error message:', error.message)

      // More detailed error messages
      if (error.code === 'auth/invalid-phone-number') {
        toast.error('Invalid phone number format. Use +[country code][number]')
      } else if (error.code === 'auth/too-many-requests') {
        toast.error('Too many requests. Please try again later.')
      } else if (error.code === 'auth/operation-not-allowed') {
        toast.error('Phone authentication is not enabled. Please contact support.')
      } else if (error.code === 'auth/captcha-check-failed') {
        toast.error('reCAPTCHA verification failed. Please refresh and try again.')
      } else if (error.code === 'auth/missing-phone-number') {
        toast.error('Please enter a phone number')
      } else if (error.message.includes('Firebase')) {
        toast.error('Firebase error: ' + error.message)
      } else {
        toast.error('Failed to send OTP: ' + (error.message || 'Unknown error'))
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
      // Verify OTP with Firebase
      const result = await confirmationResult.confirm(otp)
      const firebaseUser = result.user

      // Create or update user in Supabase
      const supabase = getSupabaseClient()

      // Check if user exists by phone or firebase_uid
      const { data: existingUsers, error: queryError }: { data: any, error: any } = await supabase
        .from('users')
        .select('*')
        .eq('phone', phoneNumber)

      console.log('Query error:', queryError)
      console.log('Existing users found:', existingUsers)

      let existingUser = existingUsers && existingUsers.length > 0 ? existingUsers[0] : null

      // If not found by phone, try by firebase_uid
      if (!existingUser) {
        const { data: firebaseUsers } = await supabase
          .from('users')
          .select('*')
          .eq('firebase_uid', firebaseUser.uid)
          .maybeSingle()

        existingUser = firebaseUsers
      }

      if (existingUser) {
        // Update existing user
        await (supabase as any)
          .from('users')
          .update({
            firebase_uid: firebaseUser.uid,
            phone: phoneNumber,
            phone_verified: true,
            last_login_at: new Date().toISOString()
          })
          .eq('id', existingUser.id)

        // Sign in to Supabase auth (if not already signed in)
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: existingUser.email,
          password: firebaseUser.uid
        })

        if (signInError) {
          console.error('Sign in error:', signInError)
          // If password doesn't work, user might have registered with different method
          // Just continue without Supabase auth session for now
        }

        toast.success('Welcome back!')
      } else {
        // Create new user via API (which handles Supabase auth + profile creation)
        const response = await fetch('/api/auth/user-signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: email,
            password: firebaseUser.uid, // Use Firebase UID as password
            fullName: fullName,
            phone: phoneNumber,
            firebase_uid: firebaseUser.uid
          })
        })

        const data = await response.json()

        if (!response.ok) {
          console.error('Error creating user:', data.error)
          console.error('Response status:', response.status)
          console.error('Full response:', data)

          // Check if user already exists (might have been created in previous attempt)
          if (response.status === 409 || (data.error && data.error.includes('already'))) {
            // User exists, try to find and update
            const { data: retryUser } = await (supabase as any)
              .from('users')
              .select('id')
              .eq('email', email)
              .single()

            if (retryUser) {
              await (supabase as any)
                .from('users')
                .update({
                  firebase_uid: firebaseUser.uid,
                  phone: phoneNumber,
                  phone_verified: true,
                  last_login_at: new Date().toISOString()
                })
                .eq('id', retryUser.id)

              toast.success('Welcome back!')
              router.push('/')
              return
            }
          }

          toast.error(data.error || 'Failed to create account. Please try again.')
          return
        }

        // Update the newly created user with Firebase fields
        const { data: newUser } = await (supabase as any)
          .from('users')
          .select('id')
          .eq('email', email)
          .single()

        if (newUser) {
          await (supabase as any)
            .from('users')
            .update({
              firebase_uid: firebaseUser.uid,
              phone_verified: true,
              last_login_at: new Date().toISOString()
            })
            .eq('id', newUser.id)
        }

        toast.success('Account created successfully!')
      }

      // Redirect to home page
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

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-coral rounded-full mb-4">
              <Phone className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Phone Login</h1>
            <p className="mt-2 text-gray-600">
              {step === 'phone' && 'Enter your phone number to continue'}
              {step === 'details' && 'Complete your profile'}
              {step === 'otp' && 'Enter the OTP sent to your phone'}
            </p>
          </div>

          {/* Phone Number Step */}
          {step === 'phone' && (
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
                {loading ? 'Processing...' : 'Continue'}
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
                {loading ? 'Verifying...' : 'Verify OTP'}
              </Button>

              <button
                type="button"
                onClick={resendOTP}
                disabled={loading}
                className="w-full text-sm text-coral hover:text-coral-dark transition-colors"
              >
                Resend OTP
              </button>
            </form>
          )}

          {/* Sign Up Link */}
          {step === 'phone' && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-center text-sm text-gray-600">
                Don't have an account? {' '}
                <Link href="/auth/user-signup" className="text-coral font-semibold hover:text-coral-dark">
                  Sign up
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
