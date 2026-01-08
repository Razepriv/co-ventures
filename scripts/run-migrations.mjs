// Migration Runner Script
// Run with: node --experimental-modules scripts/run-migrations.mjs

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local')
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Read all migration files
const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations')
const migrationFiles = fs.readdirSync(migrationsDir)
  .filter(file => file.endsWith('.sql'))
  .sort()

console.log('🚀 Starting database migrations...\n')

// Function to execute SQL
async function executeSql(sql) {
  const { data, error } = await supabase.rpc('exec_sql', { sql_string: sql })
  return { data, error }
}

// Run migrations
async function runMigrations() {
  for (const file of migrationFiles) {
    try {
      console.log(`📄 Running migration: ${file}`)
      
      const filePath = path.join(migrationsDir, file)
      const sql = fs.readFileSync(filePath, 'utf8')
      
      // Split SQL into individual statements (simple split, may need refinement)
      const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0)
      
      console.log(`   Found ${statements.length} SQL statements`)
      
      // Execute each statement
      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i]
        
        // Skip comments
        if (statement.startsWith('--')) continue
        
        try {
          // Use raw SQL query since exec_sql RPC might not exist
          const { error } = await supabase.rpc('exec_sql', { 
            query: statement + ';' 
          }).catch(async (rpcError) => {
            // If RPC doesn't exist, try direct query
            // Note: This won't work for DDL, need to use Supabase dashboard or CLI
            console.log(`   ⚠️  RPC method not available, please run migrations via Supabase Dashboard`)
            return { error: rpcError }
          })
          
          if (error) {
            // Some errors are expected (like "already exists")
            if (
              error.message?.includes('already exists') ||
              error.message?.includes('duplicate')
            ) {
              console.log(`   ⚠️  Skipping (already exists)`)
            } else {
              console.error(`   ❌ Error:`, error.message)
            }
          }
        } catch (err) {
          console.error(`   ❌ Error executing statement ${i + 1}:`, err.message)
        }
      }
      
      console.log(`   ✅ Migration completed\n`)
    } catch (error) {
      console.error(`❌ Failed to run migration ${file}:`, error.message)
      // Continue with next migration
    }
  }
}

// Note about direct SQL execution
console.log('⚠️  NOTE: Supabase requires migrations to be run via:')
console.log('   1. Supabase Dashboard → SQL Editor')
console.log('   2. Supabase CLI (supabase db push)')
console.log('   3. Or copy/paste SQL into Dashboard\n')
console.log('📋 Migrations to run manually:\n')

migrationFiles.forEach(file => {
  const filePath = path.join(migrationsDir, file)
  console.log(`\n${'='.repeat(60)}`)
  console.log(`FILE: ${file}`)
  console.log('='.repeat(60))
  const sql = fs.readFileSync(filePath, 'utf8')
  console.log(sql)
})

console.log(`\n${'='.repeat(60)}`)
console.log('\n✅ Migration files listed above')
console.log('📝 Copy and paste into Supabase Dashboard → SQL Editor')
console.log(`   URL: ${supabaseUrl.replace('.supabase.co', '')}/project/_/sql\n`)
