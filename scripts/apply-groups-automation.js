const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing env vars')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function applyFix() {
    console.log('Applying property groups automation...')
    const migrationPath = path.join(__dirname, '../supabase/migrations/999_property_groups_automation.sql')
    const sql = fs.readFileSync(migrationPath, 'utf8')

    const { error } = await supabase.rpc('exec_sql', { query: sql })

    if (error) {
        console.error('Migration failed:', error)
    } else {
        console.log('Migration applied successfully!')
    }
}

applyFix()
