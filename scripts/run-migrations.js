const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function runMigration(filePath) {
    console.log(`\n📄 Running migration: ${path.basename(filePath)}`)

    try {
        const sql = fs.readFileSync(filePath, 'utf8')

        const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql })

        if (error) {
            console.error('❌ Migration failed:', error.message)
            return false
        }

        console.log('✅ Migration completed successfully')
        return true
    } catch (error) {
        console.error('❌ Error:', error.message)
        return false
    }
}

async function main() {
    console.log('🚀 Starting database migrations...\n')

    const migrations = [
        'supabase/migrations/013_fix_form_rls_policies.sql',
        'supabase/migrations/014_admin_panel_features.sql'
    ]

    for (const migration of migrations) {
        const success = await runMigration(migration)
        if (!success) {
            console.log('\n⚠️  Migration failed, stopping...')
            process.exit(1)
        }
    }

    console.log('\n🎉 All migrations completed successfully!')
    process.exit(0)
}

main()
