const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function verify() {
    console.log('--- Verification Start ---')

    // 1. Test auto-creation on new property
    console.log('Testing auto-creation of group for new property...')
    const tempSlug = 'test-prop-' + Date.now()
    const { data: prop, error: propError } = await supabase
        .from('properties')
        .insert({
            title: 'Test Property for Group Automation',
            slug: tempSlug,
            price: 1000000,
            location: 'Test Location',
            status: 'active',
            type: 'apartment'
        })
        .select()
        .single()

    if (propError) {
        console.error('Failed to create test property:', propError)
    } else {
        console.log('Test property created. ID:', prop.id)

        // Wait a moment for trigger
        await new Promise(r => setTimeout(r, 1000))

        const { data: group, error: groupError } = await supabase
            .from('property_groups')
            .select('*')
            .eq('property_id', prop.id)
            .single()

        if (groupError) {
            console.error('Trigger failed. Group not found for new property:', groupError)
        } else {
            console.log('Success! Group auto-created. Group ID:', group.id)
        }
    }

    // 2. Cleanup test property (and group via CASCADE if setup, else manual)
    if (prop) {
        console.log('Cleaning up test property...')
        await supabase.from('properties').delete().eq('id', prop.id)
    }

    console.log('--- Verification End ---')
}

verify()
