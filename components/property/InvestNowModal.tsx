// @ts-nocheck
'use client'

import React, { useState } from 'react'
import { X, DollarSign, User, Mail, Phone, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/label'
import { getSupabaseClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { useAuth } from '@/lib/auth/AuthProvider'

interface InvestNowModalProps {
  isOpen: boolean
  onClose: () => void
  propertyId: string
  propertyTitle: string
  minInvestment?: number
}

export function InvestNowModal({ isOpen, onClose, propertyId, propertyTitle, minInvestment }: InvestNowModalProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    full_name: user?.user_metadata?.full_name || '',
    email: user?.email || '',
    phone: '',
    investment_amount: minInvestment?.toString() || '',
    message: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = getSupabaseClient()
      
      // Save investment enquiry
      const { error } = await supabase
        .from('enquiries')
        .insert({
          property_id: propertyId,
          user_id: user?.id || null,
          full_name: formData.full_name,
          email: formData.email,
          phone: formData.phone,
          enquiry_type: 'investment',
          message: `Investment Amount: ₹${parseInt(formData.investment_amount).toLocaleString('en-IN')}
          
${formData.message}`,
          status: 'new'
        })

      if (error) throw error

      toast.success('Investment enquiry submitted successfully! Our team will contact you soon.')
      onClose()
      setFormData({
        full_name: user?.user_metadata?.full_name || '',
        email: user?.email || '',
        phone: '',
        investment_amount: minInvestment?.toString() || '',
        message: ''
      })
    } catch (error: any) {
      console.error('Error submitting enquiry:', error)
      toast.error('Failed to submit enquiry. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-coral to-coral-light p-6 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/20 transition-colors"
          >
            <X size={20} />
          </button>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
              <DollarSign size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Invest Now</h2>
              <p className="text-white/90 text-sm mt-1">{propertyTitle}</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {!user && (
            <div className="bg-coral/10 border border-coral/20 rounded-lg p-4 mb-4">
              <p className="text-sm text-charcoal">
                <strong>Note:</strong> You&apos;re submitting as a guest. Consider{' '}
                <a href="/auth/login" className="text-coral hover:underline">
                  logging in
                </a>{' '}
                for a better experience.
              </p>
            </div>
          )}

          <div>
            <Label htmlFor="full_name" className="flex items-center gap-2">
              <User size={16} />
              Full Name *
            </Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              placeholder="Enter your full name"
              required
            />
          </div>

          <div>
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail size={16} />
              Email Address *
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="your.email@example.com"
              required
            />
          </div>

          <div>
            <Label htmlFor="phone" className="flex items-center gap-2">
              <Phone size={16} />
              Phone Number *
            </Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+91 98765 43210"
              required
            />
          </div>

          <div>
            <Label htmlFor="investment_amount" className="flex items-center gap-2">
              <Building2 size={16} />
              Investment Amount (₹) *
            </Label>
            <Input
              id="investment_amount"
              type="number"
              value={formData.investment_amount}
              onChange={(e) => setFormData({ ...formData, investment_amount: e.target.value })}
              placeholder="Enter investment amount"
              min={minInvestment || 0}
              required
            />
            {minInvestment && (
              <p className="text-xs text-gray-500 mt-1">
                Minimum investment: ₹{minInvestment.toLocaleString('en-IN')}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="message">Additional Information</Label>
            <textarea
              id="message"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Any questions or special requirements?"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coral"
            />
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-xs text-gray-600">
              By submitting this form, you agree to be contacted by our investment team regarding this property.
              All investments are subject to verification and approval.
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit Enquiry'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
