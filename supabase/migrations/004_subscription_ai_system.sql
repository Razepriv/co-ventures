-- Subscription Plans Table
CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  price_monthly DECIMAL(10,2) NOT NULL,
  price_yearly DECIMAL(10,2),
  analyses_per_month INTEGER NOT NULL DEFAULT 0, -- 0 = unlimited
  max_properties_comparison INTEGER NOT NULL DEFAULT 0, -- 0 = unlimited
  agents_access TEXT[] DEFAULT ARRAY[]::TEXT[], -- Array of agent IDs or 'all'
  features JSONB DEFAULT '[]'::JSONB,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Subscriptions Table
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES subscription_plans(id),
  status VARCHAR(50) NOT NULL DEFAULT 'active', -- active, cancelled, expired, suspended
  razorpay_subscription_id VARCHAR(255),
  razorpay_plan_id VARCHAR(255),
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT false,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Subscription Usage Logs
CREATE TABLE IF NOT EXISTS subscription_usage_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subscription_id UUID NOT NULL REFERENCES user_subscriptions(id) ON DELETE CASCADE,
  usage_type VARCHAR(50) NOT NULL, -- ai_analysis, property_comparison, export_report
  property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Agent Configurations Table
CREATE TABLE IF NOT EXISTS ai_agent_configurations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_slug VARCHAR(100) NOT NULL UNIQUE,
  display_name VARCHAR(255) NOT NULL,
  description TEXT,
  system_prompt TEXT NOT NULL,
  model VARCHAR(100) NOT NULL DEFAULT 'gpt-4-turbo-preview',
  temperature DECIMAL(3,2) NOT NULL DEFAULT 0.3,
  max_tokens INTEGER NOT NULL DEFAULT 2000,
  required_tier VARCHAR(50) NOT NULL DEFAULT 'free', -- free, ai_basic, ai_pro, ai_enterprise
  icon VARCHAR(50) DEFAULT 'Sparkles',
  color_theme VARCHAR(50) DEFAULT '#8B5CF6',
  display_order INTEGER DEFAULT 0,
  is_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  version INTEGER DEFAULT 1
);

-- AI Agent Configuration History (for rollback)
CREATE TABLE IF NOT EXISTS ai_agent_configuration_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_config_id UUID NOT NULL REFERENCES ai_agent_configurations(id) ON DELETE CASCADE,
  system_prompt TEXT NOT NULL,
  model VARCHAR(100) NOT NULL,
  temperature DECIMAL(3,2) NOT NULL,
  max_tokens INTEGER NOT NULL,
  changed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  change_notes TEXT,
  version INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User AI Assistant (properties added for comparison)
CREATE TABLE IF NOT EXISTS user_ai_assistant (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  display_order INTEGER DEFAULT 0,
  UNIQUE(user_id, property_id)
);

-- AI Property Analyses
CREATE TABLE IF NOT EXISTS ai_property_analyses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  analysis_data JSONB NOT NULL,
  agents_used TEXT[] DEFAULT ARRAY[]::TEXT[],
  execution_time_seconds INTEGER,
  tokens_used INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Saved Comparisons
CREATE TABLE IF NOT EXISTS saved_comparisons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  property_ids UUID[] NOT NULL,
  comparison_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscription_usage_logs_user_id ON subscription_usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_subscription_usage_logs_created_at ON subscription_usage_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_user_ai_assistant_user_id ON user_ai_assistant(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_property_analyses_user_id ON ai_property_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_property_analyses_property_id ON ai_property_analyses(property_id);
CREATE INDEX IF NOT EXISTS idx_saved_comparisons_user_id ON saved_comparisons(user_id);

-- Insert default subscription plans
INSERT INTO subscription_plans (name, slug, description, price_monthly, price_yearly, analyses_per_month, max_properties_comparison, agents_access, features, display_order) VALUES
('Free', 'free', 'Basic access to property listings', 0, 0, 0, 0, ARRAY[]::TEXT[], '[
  "Browse all properties",
  "Save favorite properties",
  "Contact property owners",
  "Basic property details"
]'::JSONB, 1),

('AI Basic', 'ai_basic', 'Get started with AI-powered property analysis', 999, 9990, 5, 3, ARRAY['market_pulse', 'deal_underwriter']::TEXT[], '[
  "5 AI analyses per month",
  "Compare up to 3 properties",
  "Market Pulse Agent",
  "Deal Underwriter Agent",
  "Export reports (PDF)",
  "Email support"
]'::JSONB, 2),

('AI Pro', 'ai_pro', 'Professional AI analysis with all agents', 2499, 24990, 20, 10, ARRAY['all']::TEXT[], '[
  "20 AI analyses per month",
  "Compare up to 10 properties",
  "All 6 AI agents",
  "Advanced visualizations",
  "Export reports (PDF & Excel)",
  "Priority support",
  "Comparison history",
  "AI chat insights"
]'::JSONB, 3),

('AI Enterprise', 'ai_enterprise', 'Unlimited AI power for serious investors', 9999, 99990, 0, 0, ARRAY['all']::TEXT[], '[
  "Unlimited AI analyses",
  "Unlimited property comparison",
  "All 6 AI agents",
  "Custom agent prompts",
  "Advanced analytics",
  "Export reports (all formats)",
  "Priority support with SLA",
  "API access",
  "Dedicated account manager",
  "White-label reports"
]'::JSONB, 4)
ON CONFLICT (slug) DO NOTHING;

-- Insert default AI agent configurations
INSERT INTO ai_agent_configurations (agent_slug, display_name, description, system_prompt, model, temperature, max_tokens, required_tier, icon, color_theme, display_order, is_enabled) VALUES
('market_pulse', 'Market Pulse Agent', 'Monitors macro trends and market dynamics', 
'You are a real estate market analyst specializing in Indian property markets. Analyze the property location, current market trends, supply-demand dynamics, infrastructure development, and economic indicators. Provide insights on market sentiment, absorption rates, rental yields, and future growth potential. Be data-driven and specific.', 
'gpt-4-turbo-preview', 0.3, 2000, 'ai_basic', 'TrendingUp', '#3B82F6', 1, true),

('deal_underwriter', 'Deal Underwriter Agent', 'Analyzes financial viability and returns', 
'You are a real estate financial analyst. Evaluate the property''s financial metrics including price per square foot, IRR projections, cash-on-cash returns, cap rates, and ROI potential. Conduct stress testing, scenario analysis, and provide risk-adjusted return expectations. Compare with similar properties in the area.', 
'gpt-4-turbo-preview', 0.3, 2000, 'ai_basic', 'DollarSign', '#10B981', 2, true),

('developer_verification', 'Developer Verification Agent', 'Assesses developer credibility and track record', 
'You are a developer due diligence specialist. Research and analyze the developer''s track record, completion history, quality standards, financial stability, ongoing projects, customer reviews, and reputation. Identify red flags, delays, legal issues, and provide a credibility score.', 
'gpt-4-turbo-preview', 0.4, 2000, 'ai_pro', 'Building2', '#F59E0B', 3, true),

('legal_regulatory', 'Legal & Regulatory Agent', 'Reviews legal compliance and documentation', 
'You are a real estate legal advisor. Verify RERA registration, title clarity, approval status, NOCs, occupancy certificates, and compliance with local regulations. Identify legal risks, pending litigations, documentation gaps, and regulatory concerns. Provide recommendations for due diligence.', 
'gpt-4-turbo-preview', 0.2, 2000, 'ai_pro', 'Scale', '#EF4444', 4, true),

('exit_optimizer', 'Exit Strategy Optimizer', 'Plans optimal exit scenarios and timing', 
'You are a real estate exit strategy advisor. Analyze liquidity scenarios, resale potential, holding period optimization, tax implications, and exit timing. Project property appreciation, rental income potential, and recommend optimal exit strategies based on investment goals and market cycles.', 
'gpt-4-turbo-preview', 0.4, 2000, 'ai_pro', 'LogOut', '#8B5CF6', 5, true),

('committee_synthesizer', 'Investment Committee Synthesizer', 'Synthesizes all agent insights into recommendations', 
'You are the chairman of an investment committee reviewing all agent analyses. Synthesize insights from Market Pulse, Deal Underwriter, Developer Verification, Legal & Regulatory, and Exit Optimizer agents. Provide a clear investment recommendation (STRONG_BUY, BUY, HOLD, AVOID) with confidence level, key risks, opportunities, and action items.', 
'gpt-4-turbo-preview', 0.5, 3000, 'ai_pro', 'Users', '#6366F1', 6, true)
ON CONFLICT (agent_slug) DO NOTHING;
