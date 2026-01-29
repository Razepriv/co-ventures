const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Connection details
const client = new Client({
    user: 'postgres',
    host: 'db.ydmxdokrtjolqigbtqbd.supabase.co',
    database: 'postgres',
    password: 'Coventures@2026',
    port: 5432,
    ssl: {
        rejectUnauthorized: false
    }
});

async function runMigration(filePath) {
    console.log(`\n📄 Processing: ${path.basename(filePath)}`);

    try {
        const sql = fs.readFileSync(filePath, 'utf8');
        await client.query(sql);
        console.log(`✅ Successfully applied: ${path.basename(filePath)}`);
        return true;
    } catch (err) {
        console.error(`❌ Error migrating ${path.basename(filePath)}:`, err.message);
        // Don't stop on error, proceed to try next migration or verification
        return false;
    }
}

async function verifySchema() {
    console.log('\n🔍 Verifying Schema...');

    try {
        // Check tables
        const tablesRes = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('notifications', 'site_settings', 'property_groups', 'group_members');
    `);

        console.log('Found tables:', tablesRes.rows.map(r => r.table_name).join(', '));

        // Check policies
        const policiesRes = await client.query(`
      SELECT policyname, tablename 
      FROM pg_policies 
      WHERE schemaname = 'public';
    `);

        console.log(`\nFound ${policiesRes.rowCount} RLS policies active.`);

    } catch (err) {
        console.error('❌ Error verifying schema:', err.message);
    }
}

async function main() {
    console.log('🚀 Starting Direct Database Repair (Pooler Mode)...');

    try {
        await client.connect();
        console.log('🔌 Connected to Supabase Database');

        const migrations = [
            'supabase/migrations/013_fix_form_rls_policies.sql',
            'supabase/migrations/014_admin_panel_features.sql',
            'supabase/migrations/016_fix_notification_links.sql'
        ];

        for (const migration of migrations) {
            const fullPath = path.join(__dirname, '..', migration);
            if (fs.existsSync(fullPath)) {
                await runMigration(fullPath);
            } else {
                console.error(`❌ Migration file not found: ${fullPath}`);
            }
        }

        await verifySchema();

    } catch (err) {
        console.error('❌ Connection failed:', err.message);
    } finally {
        await client.end();
        console.log('\n👋 Connection closed');
    }
}

main();
