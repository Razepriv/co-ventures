import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkColumns() {
    console.log('Checking columns for group_members...')
    const { data, error } = await supabase.rpc('exec_sql', {
        query: "SELECT column_name FROM information_schema.columns WHERE table_name = 'group_members';"
    })

    if (error) {
        console.error('Error:', error)
    } else {
        console.log('Columns:', data)
    }
}

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

runFix().then(checkColumns)
