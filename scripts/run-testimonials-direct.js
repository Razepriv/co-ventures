const https = require('https');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

// Extract project ref from URL
const projectRef = SUPABASE_URL.replace('https://', '').split('.')[0];

async function executeSQL(sql, description) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({ query: sql });
    
    const options = {
      hostname: `${projectRef}.supabase.co`,
      port: 443,
      path: '/rest/v1/rpc/exec_sql',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    console.log(`\n📤 Executing: ${description}`);
    console.log(`📍 Endpoint: https://${options.hostname}${options.path}`);

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 201) {
          console.log(`✅ Success: ${description}`);
          resolve(data);
        } else {
          console.error(`❌ HTTP ${res.statusCode}: ${description}`);
          console.error('Response:', data);
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', (error) => {
      console.error(`❌ Network error: ${description}`);
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runMigrations() {
  console.log('🚀 Running testimonials migrations via Supabase REST API...\n');
  console.log(`🔗 Supabase URL: ${SUPABASE_URL}`);
  console.log(`🔑 Using service role key: ${SERVICE_ROLE_KEY.substring(0, 20)}...`);
  
  try {
    // Step 1: Create table
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 STEP 1: Creating testimonials table');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    const tableSql = fs.readFileSync('supabase/migrations/008_testimonials_table.sql', 'utf8');
    await executeSQL(tableSql, 'Create testimonials table with indexes');
    console.log('⏱️  Waiting 3 seconds for schema cache to update...');
    await sleep(3000);
    
    // Step 2: Create policies
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔒 STEP 2: Creating RLS policies');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    const policiesSql = fs.readFileSync('supabase/migrations/009_testimonials_policies.sql', 'utf8');
    await executeSQL(policiesSql, 'Create RLS policies');
    console.log('⏱️  Waiting 2 seconds for policies to apply...');
    await sleep(2000);
    
    // Step 3: Seed data
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🌱 STEP 3: Seeding sample testimonials');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    const seedSql = fs.readFileSync('supabase/migrations/010_testimonials_seed.sql', 'utf8');
    await executeSQL(seedSql, 'Insert 6 sample testimonials');
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 ALL MIGRATIONS COMPLETED SUCCESSFULLY!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✨ Testimonials system is now ready to use!');
    console.log('🔄 Refresh your browser to see the testimonials marquee');
    
  } catch (error) {
    console.error('\n❌ MIGRATION FAILED');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('Error message:', error.message);
    if (error.stack) {
      console.error('\nStack trace:', error.stack);
    }
    process.exit(1);
  }
}

runMigrations();
