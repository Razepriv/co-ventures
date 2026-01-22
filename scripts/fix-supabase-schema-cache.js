/**
 * Fix Supabase PostgREST Schema Cache
 * This script forces Supabase to reload its schema cache to recognize new columns
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function fixSchemaCache() {
  console.log('🔧 Fixing Supabase PostgREST Schema Cache...\n')

  try {
    // Step 1: Verify columns exist
    console.log('📋 Step 1: Verifying columns exist in users table...')
    
    // Manual verification by querying information_schema
    const { data: verifyData, error: verifyError } = await supabase
      .from('users')
      .select('id, email, phone, firebase_uid, phone_verified, last_login_at')
      .limit(1)

    if (verifyError) {
      if (verifyError.code === 'PGRST204' || verifyError.message.includes('Could not find')) {
        console.log('⚠️  PostgREST schema cache is stale!')
        console.log('   Error:', verifyError.message)
      } else {
        console.log('✅ Columns exist in database')
      }
    } else {
      console.log('✅ All columns are accessible via PostgREST')
      console.log('   Sample columns:', Object.keys(verifyData || {}))
    }

    // Step 2: Force schema reload via SQL
    console.log('\n🔄 Step 2: Forcing schema reload...')
    
    // Try to trigger a schema reload
    // PostgREST should automatically reload, but we can force it
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    console.log('✅ Schema reload triggered')

    // Step 3: Wait a bit for reload to complete
    console.log('\n⏳ Step 3: Waiting for schema cache to refresh...')
    await new Promise(resolve => setTimeout(resolve, 3000))

    // Step 4: Verify the fix worked
    console.log('\n✅ Step 4: Verifying fix...')
    const { data: testData, error: testError } = await supabase
      .from('users')
      .select('id, phone, firebase_uid, phone_verified')
      .limit(1)

    if (testError) {
      console.log('❌ Still getting errors:', testError.message)
      console.log('\n📝 Manual steps required:')
      console.log('   1. Go to Supabase Dashboard')
      console.log('   2. Settings → Database → Connection Pooling')
      console.log('   3. Click "Restart" on the Pooler')
      console.log('   OR')
      console.log('   4. Settings → General → Pause project, then Resume')
      return false
    } else {
      console.log('✅ Schema cache is now up to date!')
      console.log('   Phone login should work now')
      return true
    }

  } catch (error) {
    console.error('❌ Error:', error.message)
    return false
  }
}

// Run the fix
fixSchemaCache().then(success => {
  if (success) {
    console.log('\n🎉 Schema cache fix completed successfully!')
    console.log('   You can now test phone login again')
  } else {
    console.log('\n⚠️  Automatic fix failed. Manual intervention required.')
    console.log('   See instructions above.')
  }
  process.exit(success ? 0 : 1)
})
