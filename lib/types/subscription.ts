export interface SubscriptionPlan {
  id: string
  name: string
  slug: 'free' | 'ai_basic' | 'ai_pro' | 'ai_enterprise'
  description: string
  price_monthly: number
  price_yearly: number | null
  analyses_per_month: number // 0 = unlimited
  max_properties_comparison: number // 0 = unlimited
  agents_access: string[] // ['all'] or ['market_pulse', 'deal_underwriter']
  features: string[]
  is_active: boolean
  display_order: number
  created_at: string
  updated_at: string
}

export interface UserSubscription {
  id: string
  user_id: string
  plan_id: string
  plan?: SubscriptionPlan
  status: 'active' | 'cancelled' | 'expired' | 'suspended'
  razorpay_subscription_id: string | null
  razorpay_plan_id: string | null
  current_period_start: string | null
  current_period_end: string | null
  cancel_at_period_end: boolean
  cancelled_at: string | null
  created_at: string
  updated_at: string
}

export interface SubscriptionUsageLog {
  id: string
  user_id: string
  subscription_id: string
  usage_type: 'ai_analysis' | 'property_comparison' | 'export_report'
  property_id: string | null
  metadata: Record<string, any>
  created_at: string
}

export interface AIAgentConfiguration {
  id: string
  agent_slug: string
  display_name: string
  description: string
  system_prompt: string
  model: string
  temperature: number
  max_tokens: number
  required_tier: 'free' | 'ai_basic' | 'ai_pro' | 'ai_enterprise'
  icon: string
  color_theme: string
  display_order: number
  is_enabled: boolean
  created_at: string
  updated_at: string
  version: number
}

export interface AIAgentConfigurationHistory {
  id: string
  agent_config_id: string
  system_prompt: string
  model: string
  temperature: number
  max_tokens: number
  changed_by: string | null
  change_notes: string | null
  version: number
  created_at: string
}

export interface UserAIAssistant {
  id: string
  user_id: string
  property_id: string
  property?: any
  added_at: string
  display_order: number
}

export interface AIPropertyAnalysis {
  id: string
  user_id: string
  property_id: string
  analysis_data: {
    market_pulse?: any
    deal_underwriter?: any
    developer_verification?: any
    legal_regulatory?: any
    exit_optimizer?: any
    committee_synthesizer?: any
    overall_score?: number
    recommendation?: 'STRONG_BUY' | 'BUY' | 'HOLD' | 'AVOID'
    confidence_level?: number
  }
  agents_used: string[]
  execution_time_seconds: number | null
  tokens_used: number | null
  created_at: string
}

export interface SavedComparison {
  id: string
  user_id: string
  name: string
  property_ids: string[]
  comparison_data: any
  created_at: string
  updated_at: string
}

export interface SubscriptionUsage {
  analyses_used: number
  analyses_limit: number
  properties_in_comparison: number
  properties_limit: number
  can_analyze: boolean
  can_add_property: boolean
}
