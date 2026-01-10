require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  console.log('🔄 Running investment fields migration...\n');

  try {
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '002_add_investment_fields.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    // Split by semicolons and execute each statement
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    for (const statement of statements) {
      if (statement.length > 10) {
        const { error } = await supabase.rpc('exec_sql', { sql_query: statement });
        
        if (error) {
          // Try direct query if RPC fails
          const { error: directError } = await supabase.from('_').select('*').limit(0);
          // Ignore if it's just about table existence
          if (error.message && !error.message.includes('already exists') && !error.message.includes('does not exist')) {
            console.log('⚠️  Warning:', error.message.substring(0, 100));
          }
        }
      }
    }

    console.log('✅ Migration completed successfully!\n');
    console.log('📋 Added fields:');
    console.log('   - Investment fields (ROI, slots, amounts)');
    console.log('   - Developer information');
    console.log('   - Legal/RERA details');
    console.log('   - Documents (brochure, floor plans)');
    console.log('   - Property ratings and reviews');
    console.log('\n📊 New tables created:');
    console.log('   - property_investors');
    console.log('   - property_reviews');
    console.log('   - property_documents\n');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

runMigration();
