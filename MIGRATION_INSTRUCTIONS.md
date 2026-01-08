# 📋 Manual Database Migration Instructions

Since automated migration isn't available, please follow these steps to apply the subscription system database schema:

## Step 1: Open Supabase SQL Editor

1. Go to: https://app.supabase.com/project/ydmxdokrtjolqigbtqbd/editor/sql
2. Log in with your Supabase account

## Step 2: Copy Migration SQL

Open the file: `supabase/migrations/004_subscription_ai_system.sql`

Or copy this entire SQL:

```sql
-- Copy the entire contents of 004_subscription_ai_system.sql here
-- The file is located at: d:\co-ventures\supabase\migrations\004_subscription_ai_system.sql
```

## Step 3: Execute in SQL Editor

1. Paste the SQL into the Supabase SQL Editor
2. Click "Run" button
3. Wait for completion (should take 2-5 seconds)

## Step 4: Verify Tables Created

After running, verify these 8 tables exist in your database:

✅ **subscription_plans** (4 rows)
- Free (₹0)
- AI Basic (₹999/month)
- AI Pro (₹2,499/month) 
- AI Enterprise (₹9,999/month)

✅ **user_subscriptions**
✅ **subscription_usage_logs**
✅ **ai_agent_configurations** (6 rows)
- market_pulse
- deal_underwriter
- developer_verification
- legal_regulatory
- exit_optimizer
- committee_synthesizer

✅ **ai_agent_configuration_history**
✅ **user_ai_assistant**
✅ **ai_property_analyses**
✅ **saved_comparisons**

## Step 5: Verify in Supabase Dashboard

1. Go to: https://app.supabase.com/project/ydmxdokrtjolqigbtqbd/editor
2. Check that all 8 tables appear in the left sidebar
3. Click on "subscription_plans" - should show 4 rows
4. Click on "ai_agent_configurations" - should show 6 rows

## What This Migration Creates

### 4 Subscription Tiers
| Plan | Price | Analyses | Comparisons | Agents |
|------|-------|----------|-------------|--------|
| Free | ₹0 | 0 | 0 | None |
| AI Basic | ₹999/mo | 5/month | 3 | 2 agents |
| AI Pro | ₹2,499/mo | 20/month | 10 | All 6 |
| AI Enterprise | ₹9,999/mo | Unlimited | Unlimited | All 6 + Custom |

### 6 AI Agents
1. **Market Pulse** (Basic) - Market trends & dynamics
2. **Deal Underwriter** (Basic) - Financial analysis (IRR, ROI)
3. **Developer Verification** (Pro) - Track record & credibility
4. **Legal & Regulatory** (Pro) - RERA compliance & docs
5. **Exit Optimizer** (Pro) - Liquidity scenarios
6. **Committee Synthesizer** (Pro) - Final recommendation

---

**Next Step After Migration:**
Once tables are created, come back and I'll continue with:
- ✅ Testing the database schema
- 🔄 Creating Razorpay payment integration
- 🔄 Adding AI features to property pages
