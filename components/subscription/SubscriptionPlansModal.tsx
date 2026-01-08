'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Check, Sparkles, Zap, Crown, Rocket, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import type { SubscriptionPlan } from '@/lib/types/subscription'
import { useRouter } from 'next/navigation'
import Script from 'next/script'

interface SubscriptionPlansModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectPlan: (planSlug: string) => void
}

const planIcons = {
  free: Sparkles,
  ai_basic: Zap,
  ai_pro: Crown,
  ai_enterprise: Rocket
}

const planColors = {
  free: 'from-gray-500 to-gray-600',
  ai_basic: 'from-blue-500 to-blue-600',
  ai_pro: 'from-orange-500 to-red-500',
  ai_enterprise: 'from-purple-500 to-indigo-600'
}

declare global {
  interface Window {
    Razorpay: any
  }
}

export function SubscriptionPlansModal({ 
  isOpen, 
  onClose, 
  onSelectPlan 
}: SubscriptionPlansModalProps) {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [razorpayLoaded, setRazorpayLoaded] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (isOpen) {
      fetchPlans()
    }
  }, [isOpen])

  async function fetchPlans() {
    try {
      setLoading(true)
      const res = await fetch('/api/subscriptions/plans')
      const data = await res.json()
      setPlans(data.plans || [])
    } catch (error) {
      console.error('Error fetching plans:', error)
    } finally {
      setLoading(false)
    }
  }

  function formatPrice(price: number) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price)
  }

  async function handleSelectPlan(planSlug: string) {
    if (planSlug === 'free' || processing) return

    try {
      setProcessing(true)

      // Create subscription
      const response = await fetch('/api/razorpay/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planSlug })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create subscription')
      }

      const data = await response.json()

      // Initialize Razorpay checkout
      if (!window.Razorpay) {
        throw new Error('Razorpay SDK not loaded')
      }

      const options = {
        key: data.razorpay.key,
        subscription_id: data.razorpay.subscriptionId,
        name: data.razorpay.name,
        description: data.razorpay.description,
        image: data.razorpay.image,
        prefill: data.razorpay.prefill,
        theme: data.razorpay.theme,
        handler: function (response: any) {
          // Payment successful
          console.log('Payment successful:', response)
          onClose()
          router.refresh()
          // Show success message
          alert('Subscription activated successfully!')
        },
        modal: {
          ondismiss: function () {
            setProcessing(false)
          }
        }
      }

      const razorpay = new window.Razorpay(options)
      razorpay.open()
      
    } catch (error) {
      console.error('Error:', error)
      alert(error instanceof Error ? error.message : 'Failed to process payment')
      setProcessing(false)
    }
  }

  return (
    <>
      {/* Load Razorpay SDK */}
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        onLoad={() => setRazorpayLoaded(true)}
      />

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-4 md:inset-8 lg:inset-16 bg-white rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="relative bg-gradient-to-r from-orange-500 to-red-500 text-white p-6 md:p-8">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
              
              <div className="max-w-3xl mx-auto text-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-3">
                  Unlock AI-Powered Property Insights
                </h2>
                <p className="text-lg text-white/90">
                  Choose the perfect plan for your real estate investment journey
                </p>
              </div>
            </div>

            {/* Plans Grid */}
            <div className="overflow-y-auto max-h-[calc(100vh-200px)] md:max-h-[calc(100vh-250px)] p-6 md:p-8">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
                  {plans.map((plan, index) => {
                    const Icon = planIcons[plan.slug as keyof typeof planIcons] || Sparkles
                    const gradient = planColors[plan.slug as keyof typeof planColors]
                    const isPopular = plan.slug === 'ai_pro'

                    return (
                      <motion.div
                        key={plan.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`relative bg-white border-2 rounded-2xl p-6 hover:shadow-xl transition-shadow ${
                          isPopular 
                            ? 'border-orange-500 shadow-lg scale-105' 
                            : 'border-gray-200'
                        }`}
                      >
                        {/* Most Popular Badge */}
                        {isPopular && (
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                            <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-4 py-1 rounded-full shadow-lg">
                              MOST POPULAR
                            </span>
                          </div>
                        )}

                        {/* Icon */}
                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-4`}>
                          <Icon className="h-7 w-7 text-white" />
                        </div>

                        {/* Plan Name */}
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">
                          {plan.name}
                        </h3>

                        {/* Description */}
                        <p className="text-sm text-gray-600 mb-4 h-10">
                          {plan.description}
                        </p>

                        {/* Price */}
                        <div className="mb-6">
                          {plan.price_monthly === 0 ? (
                            <div className="flex items-baseline gap-2">
                              <span className="text-4xl font-bold text-gray-900">Free</span>
                            </div>
                          ) : (
                            <div className="flex items-baseline gap-2">
                              <span className="text-4xl font-bold text-gray-900">
                                {formatPrice(plan.price_monthly)}
                              </span>
                              <span className="text-gray-600">/month</span>
                            </div>
                          )}
                        </div>

                        {/* Features */}
                        <ul className="space-y-3 mb-6">
                          {plan.features.map((feature: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-2">
                              <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                              <span className="text-sm text-gray-700">{feature}</span>
                            </li>
                          ))}
                        </ul>

                        {/* CTA Button */}
                        <Button
                          onClick={() => handleSelectPlan(plan.slug)}
                          disabled={plan.slug === 'free' || processing}
                          className={`w-full ${
                            plan.slug === 'free'
                              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                              : isPopular
                              ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white'
                              : 'bg-gray-900 hover:bg-gray-800 text-white'
                          }`}
                        >
                          {processing ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              Processing...
                            </>
                          ) : plan.slug === 'free' ? (
                            'Current Plan'
                          ) : (
                            'Choose Plan'
                          )}
                        </Button>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 p-4 text-center text-sm text-gray-600">
              <p>All plans include 14-day money-back guarantee • Cancel anytime</p>
            </div>
          </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
