const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ydmxdokrtjolqigbtqbd.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlkbXhkb2tydGpvbHFpZ2J0cWJkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzgxNTcwMiwiZXhwIjoyMDgzMzkxNzAyfQ.g6WOgWuEzRCr2gyatK0FLIVrWS7smAKKhyKAoWev7IA'

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function applyMigration() {
  try {
    console.log('🚀 Starting migration...\n')
    console.log('Reading migration file...')
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '004_subscription_ai_system.sql')
    const sql = fs.readFileSync(migrationPath, 'utf8')
    
    console.log('Applying migration to Supabase database...\n')
    
    // Use PostgreSQL REST API to execute the entire SQL file at once
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`
      },
      body: JSON.stringify({ query: sql })
    })

    if (!response.ok) {
      // If RPC doesn't work, execute via direct query
      console.log('Executing SQL via direct query...')
      
      // Create a simple query function
      const { error: execError } = await supabase.rpc('exec', { sql })
      
      if (execError) {
        console.error('Error executing migration:', execError)
        throw execError
      }
    }
    
    console.log('✅ Migration executed!\n')
    
    // Wait a bit for tables to be fully created
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Verify tables were created
    console.log('Verifying tables...\n')
    
    const { data: plans, error: plansError } = await supabase
      .from('subscription_plans')
      .select('name, slug, price_monthly')
      .order('display_order', { ascending: true })
    
    if (plansError) {
      console.error('Error fetching plans:', plansError.message)
    } else if (plans && plans.length > 0) {
      console.log('📊 Subscription Plans Created:')
      plans.forEach(plan => {
        const price = plan.price_monthly === 0 ? 'Free' : `₹${plan.price_monthly}/month`
        console.log(`  ✓ ${plan.name} (${plan.slug}): ${price}`)
      })
      console.log('')
    }
    
    const { data: agents, error: agentsError } = await supabase
      .from('ai_agent_configurations')
      .select('display_name, agent_slug, required_tier')
      .order('display_order', { ascending: true })
    
    if (agentsError) {
      console.error('Error fetching agents:', agentsError.message)
    } else if (agents && agents.length > 0) {
      console.log('🤖 AI Agents Configured:')
      agents.forEach(agent => {
        console.log(`  ✓ ${agent.display_name} (${agent.agent_slug}) - Tier: ${agent.required_tier}`)
      })
      console.log('')
    }
    
    console.log('✅ Migration completed successfully!\n')
    console.log('Next steps:')
    console.log('  1. Test the subscription flow')
    console.log('  2. Integrate Razorpay payments')
    console.log('  3. Add AI features to property pages\n')
    
  } catch (err) {
    console.error('\n❌ Migration failed:', err.message)
    console.error('\nPlease apply the migration manually:')
    console.log('  1. Go to: https://app.supabase.com/project/ydmxdokrtjolqigbtqbd/editor/sql')
    console.log('  2. Copy the contents of: supabase/migrations/004_subscription_ai_system.sql')
    console.log('  3. Paste and run in the SQL Editor\n')
    process.exit(1)
  }
}

applyMigration()
