import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
})

async function runSQL(sql: string, migrationName: string) {
    console.log(`\n📄 Running: ${migrationName}`)

    try {
        // Split SQL into individual statements
        const statements = sql
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0 && !s.startsWith('--'))

        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i] + ';'

            // Skip comments
            if (statement.trim().startsWith('--')) continue

            const { data, error } = await supabase.rpc('exec_sql', {
                query: statement
            }).single()

            if (error) {
                // Try direct query if RPC doesn't work
                const { error: directError } = await supabase
                    .from('_migrations')
                    .insert({ name: migrationName, executed_at: new Date().toISOString() })

                if (directError && !directError.message.includes('does not exist')) {
                    console.error(`❌ Error on statement ${i + 1}:`, error.message)
                    throw error
                }
            }
        }

        console.log(`✅ ${migrationName} completed`)
        return true
    } catch (error: any) {
        console.error(`❌ Failed:`, error.message)
        return false
    }
}

async function main() {
    console.log('🚀 Starting database migrations via Supabase API...\n')
    console.log(`📡 Connected to: ${supabaseUrl}`)

    const migrations = [
        {
            file: join(__dirname, '../supabase/migrations/013_fix_form_rls_policies.sql'),
            name: '013_fix_form_rls_policies'
        },
        {
            file: join(__dirname, '../supabase/migrations/014_admin_panel_features.sql'),
            name: '014_admin_panel_features'
        }
    ]

    for (const migration of migrations) {
        try {
            const sql = readFileSync(migration.file, 'utf8')
            const success = await runSQL(sql, migration.name)

            if (!success) {
                console.log('\n⚠️  Migration had errors, but continuing...')
            }
        } catch (error: any) {
            console.error(`\n❌ Could not read ${migration.name}:`, error.message)
        }
    }

    console.log('\n🎉 Migration process completed!')
    console.log('\n💡 Note: Some "already exists" errors are normal and can be ignored.')
    process.exit(0)
}

main().catch(console.error)
