'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import type {
  SubscriptionPlan,
  UserSubscription,
  SubscriptionUsage
} from '@/lib/types/subscription'

export function useSubscription() {
  const [currentPlan, setCurrentPlan] = useState<SubscriptionPlan | null>(null)
  const [subscription, setSubscription] = useState<UserSubscription | null>(null)
  const [usage, setUsage] = useState<SubscriptionUsage | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = useMemo(() => createClient(), [])

  const calculateUsage = useCallback(async (
    userId: string,
    plan: SubscriptionPlan
  ): Promise<SubscriptionUsage> => {
    try {
      // Get start of current month
      const startOfMonth = new Date()
      startOfMonth.setDate(1)
      startOfMonth.setHours(0, 0, 0, 0)

      // Count AI analyses this month
      const { count: analysesCount } = await supabase
        .from('subscription_usage_logs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('usage_type', 'ai_analysis')
        .gte('created_at', startOfMonth.toISOString())

      // Count properties in comparison list
      const { count: propertiesCount } = await supabase
        .from('user_ai_assistant')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)

      const analyses_used = analysesCount || 0
      const analyses_limit = plan.analyses_per_month
      const properties_in_comparison = propertiesCount || 0
      const properties_limit = plan.max_properties_comparison

      return {
        analyses_used,
        analyses_limit,
        properties_in_comparison,
        properties_limit,
        can_analyze: analyses_limit === 0 || analyses_used < analyses_limit,
        can_add_property: properties_limit === 0 || properties_in_comparison < properties_limit
      }
    } catch (err) {
      console.error('Error calculating usage:', err)
      return {
        analyses_used: 0,
        analyses_limit: plan.analyses_per_month,
        properties_in_comparison: 0,
        properties_limit: plan.max_properties_comparison,
        can_analyze: false,
        can_add_property: false
      }
    }
  }, [supabase])

  const fetchSubscriptionData = useCallback(async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        // User not logged in, default to free plan
        const { data: freePlan } = await supabase
          .from('subscription_plans')
          .select('*')
          .eq('slug', 'free')
          .single()

        setCurrentPlan(freePlan)
        setUsage({
          analyses_used: 0,
          analyses_limit: 0,
          properties_in_comparison: 0,
          properties_limit: 0,
          can_analyze: false,
          can_add_property: false
        })
        setLoading(false)
        return
      }

      // Get user's active subscription
      const { data: userSub, error: subError } = await supabase
        .from('user_subscriptions')
        .select(`
          *,
          plan:subscription_plans(*)
        `)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle()

      if (subError && subError.code !== 'PGRST116') {
        throw subError
      }

      // @ts-ignore
      if (userSub && userSub.plan) {
        setSubscription(userSub)
        // @ts-ignore
        setCurrentPlan(userSub.plan as SubscriptionPlan)

        // Calculate usage
        // @ts-ignore
        const usageData = await calculateUsage(user.id, userSub.plan as SubscriptionPlan)
        setUsage(usageData)
      } else {
        // No active subscription, use free plan
        const { data: freePlan } = await supabase
          .from('subscription_plans')
          .select('*')
          .eq('slug', 'free')
          .single()

        setCurrentPlan(freePlan)
        // @ts-ignore
        const usageData = await calculateUsage(user.id, freePlan)
        setUsage(usageData)
      }

      setLoading(false)
    } catch (err) {
      console.error('Error fetching subscription:', err)
      setError(err instanceof Error ? err.message : 'Failed to load subscription')
      setLoading(false)
    }
  }, [supabase, calculateUsage])

  useEffect(() => {
    fetchSubscriptionData()
  }, [fetchSubscriptionData])

  async function canAccessAgent(agentSlug: string): Promise<boolean> {
    if (!currentPlan) return false

    // Free plan has no agent access
    if (currentPlan.slug === 'free') return false

    // Check if agent is in allowed list
    if (currentPlan.agents_access.includes('all')) return true
    return currentPlan.agents_access.includes(agentSlug)
  }

  async function trackUsage(
    type: 'ai_analysis' | 'property_comparison' | 'export_report',
    propertyId?: string,
    metadata?: Record<string, any>
  ) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || !subscription) return

      // @ts-ignore
      await supabase.from('subscription_usage_logs').insert({
        user_id: user.id,
        subscription_id: subscription.id,
        usage_type: type,
        property_id: propertyId || null,
        metadata: metadata || {}
      })

      // Refresh usage data
      if (currentPlan) {
        const newUsage = await calculateUsage(user.id, currentPlan)
        setUsage(newUsage)
      }
    } catch (err) {
      console.error('Error tracking usage:', err)
    }
  }

  async function addPropertyToComparison(propertyId: string): Promise<boolean> {
    try {
      if (!usage?.can_add_property) {
        setError('You have reached your property comparison limit')
        return false
      }

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('Please log in to add properties')
        return false
      }

      // Get current max display_order
      const { data: existing } = await supabase
        .from('user_ai_assistant')
        .select('display_order')
        .eq('user_id', user.id)
        .order('display_order', { ascending: false })
        .limit(1)
        .single()

      // @ts-ignore
      const nextOrder = existing ? existing.display_order + 1 : 1

      const { error: insertError } = await supabase
        .from('user_ai_assistant')
        // @ts-ignore
        .insert({
          user_id: user.id,
          property_id: propertyId,
          display_order: nextOrder
        })

      if (insertError) {
        if (insertError.code === '23505') {
          setError('Property already in comparison list')
        } else {
          throw insertError
        }
        return false
      }

      await trackUsage('property_comparison', propertyId)
      return true
    } catch (err) {
      console.error('Error adding property:', err)
      setError(err instanceof Error ? err.message : 'Failed to add property')
      return false
    }
  }

  async function removePropertyFromComparison(propertyId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return false

      const { error: deleteError } = await supabase
        .from('user_ai_assistant')
        .delete()
        .eq('user_id', user.id)
        .eq('property_id', propertyId)

      if (deleteError) throw deleteError

      // Refresh usage
      if (currentPlan) {
        const newUsage = await calculateUsage(user.id, currentPlan)
        setUsage(newUsage)
      }

      return true
    } catch (err) {
      console.error('Error removing property:', err)
      return false
    }
  }

  return {
    currentPlan,
    subscription,
    usage,
    loading,
    error,
    canAccessAgent,
    trackUsage,
    addPropertyToComparison,
    removePropertyFromComparison,
    refreshSubscription: fetchSubscriptionData
  }
}
