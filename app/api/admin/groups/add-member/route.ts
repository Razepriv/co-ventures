import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()
        const adminSupabase = await createAdminClient()

        // 1. Check if user is admin
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
        }

        const { data: userData } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single()

        // @ts-ignore
        if (!['admin', 'super_admin'].includes(userData?.role)) {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
        }

        const body = await request.json()
        const { leadId } = body

        if (!leadId) {
            return NextResponse.json({ error: 'Lead ID is required' }, { status: 400 })
        }

        // 2. Get lead details
        // @ts-ignore
        const { data: lead, error: leadError } = await adminSupabase
            .from('property_leads')
            .select('*')
            .eq('id', leadId)
            .single()

        if (leadError || !lead) {
            return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
        }

        // @ts-ignore
        if (!lead.user_id) {
            return NextResponse.json({ error: 'Lead does not have a registered user account' }, { status: 400 })
        }

        // @ts-ignore
        if (!lead.property_id) {
            return NextResponse.json({ error: 'Lead is not associated with a property' }, { status: 400 })
        }

        // 3. Get group for property
        // @ts-ignore
        let { data: group, error: groupError } = await adminSupabase
            .from('property_groups')
            .select('*')
            // @ts-ignore
            .eq('property_id', lead.property_id)
            .maybeSingle()

        if (groupError) throw groupError

        if (!group) {
            // Should be auto-created by trigger now, but just in case
            // @ts-ignore
            const { data: newGroup, error: createError } = await adminSupabase
                .from('property_groups')
                // @ts-ignore
                .insert({
                    // @ts-ignore
                    property_id: lead.property_id,
                    total_slots: 5,
                    filled_slots: 0,
                })
                .select()
                .single()
            if (createError) throw createError
            group = newGroup
        }

        // 4. Add member to group
        // @ts-ignore
        const { data: member, error: memberError } = await adminSupabase
            .from('group_members')
            // @ts-ignore
            .insert({
                // @ts-ignore
                group_id: group.id,
                // @ts-ignore
                user_id: lead.user_id,
                // @ts-ignore
                full_name: lead.full_name,
                // @ts-ignore
                email: lead.email,
                // @ts-ignore
                phone: lead.phone,
            })
            .select()
            .single()

        if (memberError) {
            if (memberError.code === '23505') {
                return NextResponse.json({ error: 'User is already a member of this group' }, { status: 400 })
            }
            throw memberError
        }

        // 5. Update lead status
        await adminSupabase
            .from('property_leads')
            // @ts-ignore
            .update({ status: 'converted', notes: (lead.notes || '') + '\nAdded to property group by admin.' })
            .eq('id', leadId)

        return NextResponse.json({ success: true, member })
    } catch (error: any) {
        console.error('Error adding member to group:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to add member to group' },
            { status: 500 }
        )
    }
}
