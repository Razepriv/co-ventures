# ⚡ Quick Setup Checklist

## Before Testing

### ☐ 1. Configure Razorpay
- [ ] Sign up at https://dashboard.razorpay.com
- [ ] Get API keys (test mode)
- [ ] Create 3 subscription plans:
  - AI Basic: ₹999/month
  - AI Pro: ₹2,499/month
  - AI Enterprise: ₹9,999/month
- [ ] Copy Plan IDs to `.env.local`
- [ ] Set up webhook at `/api/razorpay/webhook`

### ☐ 2. Configure OpenAI
- [ ] Get API key from https://platform.openai.com/api-keys
- [ ] Add to `.env.local` as `OPENAI_API_KEY`
- [ ] Ensure billing is set up (GPT-4 access)

### ☐ 3. Update Environment Variables

Edit `d:/co-ventures/.env.local`:

```bash
# Replace these placeholders:
RAZORPAY_KEY_ID="rzp_test_xxxxx"           # Your test key ID
RAZORPAY_KEY_SECRET="xxxxx"                 # Your test secret
RAZORPAY_WEBHOOK_SECRET="xxxxx"             # From webhook setup

RAZORPAY_PLAN_AI_BASIC="plan_xxxxx"        # From step 1
RAZORPAY_PLAN_AI_PRO="plan_xxxxx"          # From step 1
RAZORPAY_PLAN_AI_ENTERPRISE="plan_xxxxx"   # From step 1

OPENAI_API_KEY="sk-proj-xxxxx"             # From step 2
```

### ☐ 4. Verify Database
```bash
node scripts/test-migration.js
```

Should show:
- ✅ 4 subscription plans
- ✅ 6 AI agents
- ✅ All 8 tables exist

### ☐ 5. Start Testing

Server already running at: http://localhost:3000

Test flow:
1. Navigate to `/properties/[any-id]`
2. Scroll to "AI Property Analysis"
3. Click "Unlock AI Features" (free user)
4. Select a plan → Complete Razorpay payment
5. Refresh page → See "Analyze with AI" button
6. Click analyze → Wait 10-30s
7. View results with scores and recommendations

---

## Test Cards (Razorpay Test Mode)

### Success
- **Card**: 4111 1111 1111 1111
- **CVV**: Any 3 digits
- **Expiry**: Any future date
- **OTP**: 1234 (test mode)

### Failure
- **Card**: 4000 0000 0000 0002

---

## Quick Commands

```bash
# Test migration
node scripts/test-migration.js

# Start dev server (if not running)
npm run dev

# Check Supabase tables
# Go to: https://app.supabase.com/project/ydmxdokrtjolqigbtqbd/editor

# View subscription plans
# Go to: http://localhost:3000 → Open any property → Click pricing button
```

---

## Verification Checklist

After subscribing, verify:
- [ ] Subscription status = "active" in `user_subscriptions` table
- [ ] Can see usage badge (e.g., "0/5 analyses")
- [ ] Can click "Analyze with AI"
- [ ] AI analysis completes successfully
- [ ] Results show overall score and recommendation
- [ ] Can add property to comparison list
- [ ] Usage count increments in `subscription_usage_logs`

---

## Troubleshooting

### Issue: Payment not completing
**Fix**: Check Razorpay dashboard for error logs, verify webhook is receiving events

### Issue: AI analysis fails
**Fix**: Check OpenAI API key is valid, verify billing is active

### Issue: Usage limit not enforcing
**Fix**: Check `subscription_usage_logs` table, refresh subscription hook state

### Issue: Agents not accessible
**Fix**: Verify `agents_access` in subscription plan includes agent slugs

---

## 🎯 Current Status

✅ **Phase 1**: Database & Infrastructure (Complete)
✅ **Phase 2**: Payment Integration (Complete)  
✅ **Phase 3**: Property AI Features (Complete)
⏳ **Phase 4**: Admin Config Panel (Not Started)
⏳ **Phase 5-6**: Comparison Page (Not Started)

**Total Progress**: 70% (7/10 todos complete)

**Next**: Configure Razorpay & OpenAI, then test the full flow!
