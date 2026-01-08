const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ydmxdokrtjolqigbtqbd.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlkbXhkb2tydGpvbHFpZ2J0cWJkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzgxNTcwMiwiZXhwIjoyMDgzMzkxNzAyfQ.g6WOgWuEzRCr2gyatK0FLIVrWS7smAKKhyKAoWev7IA'

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function testMigration() {
  console.log('🧪 Testing Database Migration...\n')
  
  let allTestsPassed = true

  // Test 1: Subscription Plans
  console.log('Test 1: Subscription Plans Table')
  const { data: plans, error: plansError } = await supabase
    .from('subscription_plans')
    .select('*')
    .order('display_order', { ascending: true })
  
  if (plansError) {
    console.error('❌ FAILED:', plansError.message)
    allTestsPassed = false
  } else {
    console.log(`✅ PASSED: Found ${plans.length} plans`)
    plans.forEach(plan => {
      const price = plan.price_monthly === 0 ? 'Free' : `₹${plan.price_monthly}`
      console.log(`   - ${plan.name} (${plan.slug}): ${price}/mo | ${plan.analyses_per_month} analyses | ${plan.max_properties_comparison} comparisons`)
    })
  }
  console.log('')

  // Test 2: AI Agents
  console.log('Test 2: AI Agent Configurations Table')
  const { data: agents, error: agentsError } = await supabase
    .from('ai_agent_configurations')
    .select('*')
    .order('display_order', { ascending: true })
  
  if (agentsError) {
    console.error('❌ FAILED:', agentsError.message)
    allTestsPassed = false
  } else {
    console.log(`✅ PASSED: Found ${agents.length} agents`)
    agents.forEach(agent => {
      console.log(`   - ${agent.display_name} (${agent.agent_slug})`)
      console.log(`     Tier: ${agent.required_tier} | Model: ${agent.model} | Temp: ${agent.temperature}`)
    })
  }
  console.log('')

  // Test 3: User Subscriptions Table
  console.log('Test 3: User Subscriptions Table')
  const { data: subs, error: subsError } = await supabase
    .from('user_subscriptions')
    .select('*')
    .limit(1)
  
  if (subsError) {
    console.error('❌ FAILED:', subsError.message)
    allTestsPassed = false
  } else {
    console.log(`✅ PASSED: Table exists (${subs.length} active subscriptions)`)
  }
  console.log('')

  // Test 4: Usage Logs Table
  console.log('Test 4: Subscription Usage Logs Table')
  const { data: logs, error: logsError } = await supabase
    .from('subscription_usage_logs')
    .select('*')
    .limit(1)
  
  if (logsError) {
    console.error('❌ FAILED:', logsError.message)
    allTestsPassed = false
  } else {
    console.log(`✅ PASSED: Table exists`)
  }
  console.log('')

  // Test 5: User AI Assistant Table
  console.log('Test 5: User AI Assistant Table')
  const { data: assistant, error: assistantError } = await supabase
    .from('user_ai_assistant')
    .select('*')
    .limit(1)
  
  if (assistantError) {
    console.error('❌ FAILED:', assistantError.message)
    allTestsPassed = false
  } else {
    console.log(`✅ PASSED: Table exists`)
  }
  console.log('')

  // Test 6: AI Property Analyses Table
  console.log('Test 6: AI Property Analyses Table')
  const { data: analyses, error: analysesError } = await supabase
    .from('ai_property_analyses')
    .select('*')
    .limit(1)
  
  if (analysesError) {
    console.error('❌ FAILED:', analysesError.message)
    allTestsPassed = false
  } else {
    console.log(`✅ PASSED: Table exists`)
  }
  console.log('')

  // Test 7: Saved Comparisons Table
  console.log('Test 7: Saved Comparisons Table')
  const { data: comparisons, error: comparisonsError } = await supabase
    .from('saved_comparisons')
    .select('*')
    .limit(1)
  
  if (comparisonsError) {
    console.error('❌ FAILED:', comparisonsError.message)
    allTestsPassed = false
  } else {
    console.log(`✅ PASSED: Table exists`)
  }
  console.log('')

  // Test 8: Agent Configuration History Table
  console.log('Test 8: Agent Configuration History Table')
  const { data: history, error: historyError } = await supabase
    .from('ai_agent_configuration_history')
    .select('*')
    .limit(1)
  
  if (historyError) {
    console.error('❌ FAILED:', historyError.message)
    allTestsPassed = false
  } else {
    console.log(`✅ PASSED: Table exists`)
  }
  console.log('')

  // Final Summary
  console.log('='.repeat(50))
  if (allTestsPassed) {
    console.log('🎉 ALL TESTS PASSED!')
    console.log('\n✅ Migration successful! You can now:')
    console.log('   1. Start the dev server: npm run dev')
    console.log('   2. Test subscription hook on property pages')
    console.log('   3. Integrate Razorpay payments')
  } else {
    console.log('❌ SOME TESTS FAILED')
    console.log('\nPlease check the errors above and reapply the migration if needed.')
  }
  console.log('='.repeat(50))
}

testMigration().catch(err => {
  console.error('Error running tests:', err)
  process.exit(1)
})
