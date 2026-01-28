const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing env vars')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runFix() {
    console.log('Running fix SQL...')
    const sql = `
        ALTER TABLE public.group_members ADD COLUMN IF NOT EXISTS investment_amount DECIMAL(15, 2);
        ALTER TABLE public.group_members ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected'));
    `;
    const { error } = await supabase.rpc('exec_sql', { query: sql })
    if (error) {
        console.error('Fix failed:', error)
    } else {
        console.log('Fix applied successfully')
    }
}

runFix()
