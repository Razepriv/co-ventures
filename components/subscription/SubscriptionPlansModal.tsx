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
  ai_pro: 'from-coral to-coral-dark',
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
            className="fixed inset-4 md:inset-8 lg:inset-16 bg-gradient-to-br from-gray-50 to-white rounded-3xl shadow-2xl z-50 overflow-hidden border border-gray-200"
          >
            {/* Header */}
            <div className="relative bg-gradient-to-br from-charcoal via-charcoal-dark to-gray-900 text-white p-8 md:p-12">
              <button
                onClick={onClose}
                className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
              
              <div className="max-w-4xl mx-auto text-center">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="inline-flex items-center gap-2 bg-coral/10 border border-coral/20 px-4 py-2 rounded-full mb-6"
                >
                  <Crown className="h-4 w-4 text-coral" />
                  <span className="text-sm font-semibold text-coral">Premium Features</span>
                </motion.div>
                
                <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white via-white to-gray-300 bg-clip-text text-transparent">
                  Unlock AI-Powered Property Insights
                </h2>
                <p className="text-lg text-gray-300 max-w-2xl mx-auto">
                  Choose the perfect plan for your real estate investment journey
                </p>
              </div>
            </div>

            {/* Plans Grid */}
            <div className="overflow-y-auto max-h-[calc(100vh-280px)] md:max-h-[calc(100vh-320px)] p-6 md:p-12 bg-gray-50">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-white border-2 border-gray-200 rounded-2xl p-6 animate-pulse">
                      <div className="w-16 h-16 bg-gray-200 rounded-2xl mb-6" />
                      <div className="h-6 bg-gray-200 rounded w-24 mb-2" />
                      <div className="h-4 bg-gray-200 rounded w-full mb-6" />
                      <div className="h-10 bg-gray-200 rounded w-32 mb-6" />
                      <div className="space-y-3">
                        {[1, 2, 3, 4].map((j) => (
                          <div key={j} className="h-4 bg-gray-200 rounded" />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 max-w-7xl mx-auto">
                  {plans.map((plan, index) => {
                    const Icon = planIcons[plan.slug as keyof typeof planIcons] || Sparkles
                    const gradient = planColors[plan.slug as keyof typeof planColors]
                    const isPopular = plan.slug === 'ai_pro'
                    const isFree = plan.slug === 'free'

                    return (
                      <motion.div
                        key={plan.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ 
                          delay: index * 0.1,
                          type: 'spring',
                          stiffness: 100,
                          damping: 15
                        }}
                        className={`group relative bg-white rounded-2xl p-5 lg:p-6 transition-all duration-300 ${
                          isPopular 
                            ? 'border-2 border-coral shadow-xl shadow-coral/10 lg:scale-105 lg:hover:scale-110' 
                            : 'border-2 border-gray-200 hover:border-gray-300 hover:shadow-lg'
                        } ${isFree ? 'opacity-90' : ''}`}
                      >
                        {/* Most Popular Badge */}
                        {isPopular && (
                          <motion.div 
                            initial={{ y: -10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="absolute -top-3 lg:-top-4 left-1/2 -translate-x-1/2 z-10"
                          >
                            <span className="bg-gradient-to-r from-coral to-coral-dark text-white text-[10px] lg:text-xs font-bold px-4 lg:px-6 py-1 lg:py-1.5 rounded-full shadow-lg uppercase tracking-wider whitespace-nowrap">
                              Most Popular
                            </span>
                          </motion.div>
                        )}

                        {/* Icon */}
                        <div className={`w-14 h-14 lg:w-16 lg:h-16 rounded-xl lg:rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-4 lg:mb-6 shadow-lg group-hover:shadow-xl transition-shadow duration-300`}>
                          <Icon className="h-7 w-7 lg:h-8 lg:w-8 text-white" />
                        </div>

                        {/* Plan Name */}
                        <h3 className="text-xl lg:text-2xl font-bold text-charcoal mb-1 lg:mb-2">
                          {plan.name}
                        </h3>

                        {/* Description */}
                        <p className="text-xs lg:text-sm text-gray-600 mb-4 lg:mb-6 min-h-[2.5rem] lg:min-h-[2.5rem] line-clamp-2">
                          {plan.description}
                        </p>

                        {/* Price */}
                        <div className="mb-4 lg:mb-6 pb-4 lg:pb-6 border-b border-gray-100">
                          {plan.price_monthly === 0 ? (
                            <div className="flex items-baseline gap-2">
                              <span className="text-3xl lg:text-4xl font-bold text-charcoal">Free</span>
                            </div>
                          ) : (
                            <div className="flex items-baseline gap-1">
                              <span className="text-3xl lg:text-4xl font-bold text-charcoal">
                                {formatPrice(plan.price_monthly)}
                              </span>
                              <span className="text-sm lg:text-base text-gray-500 font-medium">/month</span>
                            </div>
                          )}
                        </div>

                        {/* Features */}
                        <ul className="space-y-2.5 lg:space-y-3 mb-6 lg:mb-8 min-h-[180px] lg:min-h-[200px]">
                          {plan.features.slice(0, 6).map((feature: string, idx: number) => (
                            <motion.li 
                              key={idx} 
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 + idx * 0.05 }}
                              className="flex items-start gap-2.5 lg:gap-3"
                            >
                              <div className="flex-shrink-0 w-4 h-4 lg:w-5 lg:h-5 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                                <Check className="h-2.5 w-2.5 lg:h-3 lg:w-3 text-green-600 stroke-[3]" />
                              </div>
                              <span className="text-xs lg:text-sm text-gray-700 leading-relaxed">{feature}</span>
                            </motion.li>
                          ))}
                          {plan.features.length > 6 && (
                            <li className="text-xs text-gray-500 italic pl-7">
                              +{plan.features.length - 6} more features
                            </li>
                          )}
                        </ul>

                        {/* CTA Button */}
                        <Button
                          onClick={() => handleSelectPlan(plan.slug)}
                          disabled={isFree || processing}
                          className={`w-full py-2.5 lg:py-3 rounded-xl font-semibold transition-all duration-300 text-sm lg:text-base ${
                            isFree
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : isPopular
                              ? 'bg-gradient-to-r from-coral to-coral-dark hover:shadow-lg hover:shadow-coral/30 text-white transform hover:scale-105'
                              : 'bg-charcoal hover:bg-charcoal-dark text-white hover:shadow-lg transform hover:scale-105'
                          }`}
                        >
                          {processing ? (
                            <span className="flex items-center justify-center">
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              Processing...
                            </span>
                          ) : isFree ? (
                            'Current Plan'
                          ) : (
                            <>
                              Choose Plan
                              <span className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                            </>
                          )}
                        </Button>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 bg-white p-6 text-center">
              <p className="text-sm text-gray-600">
                All plans include <span className="font-semibold text-charcoal">14-day money-back guarantee</span> • Cancel anytime
              </p>
            </div>
          </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
