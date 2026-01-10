// @ts-nocheck
'use client'

import React, { useEffect } from 'react'
import { getCalApi } from '@calcom/embed-react'
import { X, Calendar } from 'lucide-react'
import { useAuth } from '@/lib/auth/AuthProvider'
import { toast } from 'sonner'

interface LiveTourModalProps {
  isOpen: boolean
  onClose: () => void
  propertyTitle: string
}

export function LiveTourModal({ isOpen, onClose, propertyTitle }: LiveTourModalProps) {
  const { user } = useAuth()

  useEffect(() => {
    if (isOpen) {
      (async function () {
        try {
          const cal = await getCalApi({ namespace: 'live-tour' })
          cal('ui', {
            cssVarsPerTheme: {
              light: {
                'cal-brand': '#FF6B4A',
                'cal-brand-emphasis': '#E85435',
                'cal-brand-text': 'white',
                'cal-border': '#E5E7EB',
                'cal-border-emphasis': '#D1D5DB'
              }
            },
            hideEventTypeDetails: false,
            layout: 'month_view'
          })

          // Pre-fill user data if logged in
          if (user) {
            cal('on', {
              action: 'bookingSuccessful',
              callback: (e: any) => {
                toast.success('Tour scheduled successfully! Check your email for confirmation.')
                onClose()
              }
            })
          }
        } catch (error) {
          console.error('Error loading Cal.com:', error)
          toast.error('Failed to load booking calendar. Please try again.')
        }
      })()
    }
  }, [isOpen, user, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-coral to-coral-light p-6 text-white z-10">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/20 transition-colors"
          >
            <X size={20} />
          </button>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
              <Calendar size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Schedule Live Tour</h2>
              <p className="text-white/90 text-sm mt-1">{propertyTitle}</p>
            </div>
          </div>
        </div>

        {/* Cal.com Embed */}
        <div className="p-6">
          {!user && (
            <div className="bg-coral/10 border border-coral/20 rounded-lg p-4 mb-6">
              <p className="text-sm text-charcoal">
                <strong>Tip:</strong>{' '}
                <a href="/auth/login" className="text-coral hover:underline">
                  Log in
                </a>{' '}
                to auto-fill your details and manage your bookings.
              </p>
            </div>
          )}

          <button
            data-cal-namespace="live-tour"
            data-cal-link="co-ventures/live-tour"
            data-cal-config={JSON.stringify({
              layout: 'month_view',
              name: user?.user_metadata?.full_name || '',
              email: user?.email || '',
              notes: `Property: ${propertyTitle}`
            })}
            className="w-full py-4 px-6 bg-coral hover:bg-coral-light text-white font-semibold rounded-lg transition-colors shadow-lg hover:shadow-xl"
          >
            Select Your Preferred Date & Time
          </button>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-charcoal mb-2">What to Expect:</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-coral mt-0.5">•</span>
                <span>45-minute personalized property tour</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-coral mt-0.5">•</span>
                <span>Meet with our property expert</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-coral mt-0.5">•</span>
                <span>Get answers to all your questions</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-coral mt-0.5">•</span>
                <span>Discuss investment opportunities and terms</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
