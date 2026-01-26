const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const regions = [
    'ap-south-1',       // Mumbai (Most likely)
    'us-east-1',        // N. Virginia (Default)
    'ap-southeast-1',   // Singapore
    'eu-central-1',     // Frankfurt
    'eu-west-1',        // Ireland
    'eu-west-2',        // London
    'us-west-1',        // N. California
    'us-west-2',        // Oregon
    'ap-northeast-1',   // Tokyo
    'ap-northeast-2',   // Seoul
    'sa-east-1',        // Sao Paulo
    'ca-central-1',     // Canada
    'ap-southeast-2'    // Sydney
];

async function tryConnect(region) {
    const host = `aws-0-${region}.pooler.supabase.com`;
    console.log(`\nTesting region: ${region} (${host})...`);

    const client = new Client({
        user: 'postgres.ydmxdokrtjolqigbtqbd',
        host: host,
        database: 'postgres',
        password: 'Coventures@2026',
        port: 5432,
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 3000 // 3s timeout
    });

    try {
        await client.connect();
        console.log(`✅ SUCCESS! Connected to region: ${region}`);
        return client;
    } catch (err) {
        await client.end().catch(() => { });

        if (err.message.includes('Tenant or user not found')) {
            console.log(`❌ Tenant not found in ${region}`);
        } else if (err.code === 'ENOTFOUND') {
            console.log(`❌ Host not found (DNS error) for ${region}`);
        } else {
            console.log(`❌ Connection failed: ${err.message}`);
        }
        return null;
    }
}

async function runMigration(client, filePath) {
    console.log(`\n📄 Processing: ${path.basename(filePath)}`);
    try {
        const sql = fs.readFileSync(filePath, 'utf8');
        await client.query(sql);
        console.log(`✅ Successfully applied: ${path.basename(filePath)}`);
        return true;
    } catch (err) {
        console.error(`❌ Error migrating ${path.basename(filePath)}:`, err.message);
        return false;
    }
}

async function verifySchema(client) {
    console.log('\n🔍 Verifying Schema...');
    try {
        const tablesRes = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('notifications', 'site_settings', 'property_groups', 'group_members');
    `);
        console.log('Found tables:', tablesRes.rows.map(r => r.table_name).join(', '));
    } catch (err) {
        console.error('❌ Error verifying schema:', err.message);
    }
}

async function main() {
    console.log('🚀 Starting Automatic Region Detection & Migration...');

    let connectedClient = null;

    // Try all regions
    for (const region of regions) {
        connectedClient = await tryConnect(region);
        if (connectedClient) break;
    }

    if (!connectedClient) {
        console.error('\n❌ Could not find valid region for project.');
        console.log('Please verify the project is actively running and password is correct.');
        process.exit(1);
        return;
    }

    try {
        const migrations = [
            'supabase/migrations/013_fix_form_rls_policies.sql',
            'supabase/migrations/014_admin_panel_features.sql'
        ];

        for (const migration of migrations) {
            const fullPath = path.join(__dirname, '..', migration);
            if (fs.existsSync(fullPath)) {
                await runMigration(connectedClient, fullPath);
            }
        }

        await verifySchema(connectedClient);

    } finally {
        await connectedClient.end();
        console.log('\n👋 Done.');
    }
}

main();
