import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()

    // Resolve property ID if it's a slug
    let propertyId = params.id
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(params.id)

    if (!isUUID) {
      const { data: propData } = await supabase
        .from('properties')
        .select('id')
        .eq('slug', params.id)
        .single()
      if (propData) {
        // @ts-ignore
        propertyId = propData.id
      }
    }

    // First get the group info (without member filter)
    const { data: groupData, error: groupError } = await supabase
      .from('property_groups')
      .select('*')
      .eq('property_id', propertyId)
      .maybeSingle()

    if (groupError) throw groupError

    // If no group exists for this property, return null
    if (!groupData) {
      return NextResponse.json({ group: null })
    }

    // Now get approved members for this group
    const { data: members, error: membersError } = await supabase
      .from('group_members')
      .select('id, user_id, full_name, email, status, joined_at')
      .eq('group_id', groupData.id)
      .eq('status', 'approved')

    if (membersError) throw membersError

    return NextResponse.json({
      group: {
        ...groupData,
        group_members: members || []
      }
    })
  } catch (error: any) {
    console.error('Error fetching group:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch group' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const adminSupabase = await createAdminClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { full_name, email, phone } = body

    // Resolve property ID if it's a slug
    let propertyId = params.id
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(params.id)

    if (!isUUID) {
      const { data: propData } = await supabase
        .from('properties')
        .select('id')
        .eq('slug', params.id)
        .single()
      if (!propData) {
        return NextResponse.json({ error: 'Property not found' }, { status: 404 })
      }
      // @ts-ignore
      propertyId = propData.id
    }

    // Get property group (must be created by admin first)
    const { data: group, error: groupError } = await adminSupabase
      .from('property_groups')
      .select('*')
      .eq('property_id', propertyId)
      .maybeSingle()

    if (groupError) throw groupError

    if (!group) {
      return NextResponse.json(
        { error: 'No investment group exists for this property yet' },
        { status: 400 }
      )
    }

    // Check if group is locked
    // @ts-ignore
    if (group.is_locked) {
      return NextResponse.json(
        { error: 'This group is locked and not accepting new members' },
        { status: 400 }
      )
    }

    // Check if group is full
    // @ts-ignore
    if (group.filled_slots >= group.total_slots) {
      return NextResponse.json(
        { error: 'This group is full' },
        { status: 400 }
      )
    }

    // Add member to group with pending status (admin must approve)
    const { data: member, error: memberError } = await adminSupabase
      .from('group_members')
      // @ts-ignore
      .insert({
        // @ts-ignore
        group_id: group.id,
        user_id: user.id,
        full_name,
        email,
        phone,
        status: 'pending',
      })
      .select()
      .single()

    if (memberError) {
      if (memberError.code === '23505') {
        return NextResponse.json(
          { error: 'You have already joined this group' },
          { status: 400 }
        )
      }
      throw memberError
    }

    // Create lead (using admin client)
    // @ts-ignore
    await adminSupabase.from('property_leads').insert({
      property_id: propertyId,
      user_id: user.id,
      lead_type: 'join_group',
      full_name,
      email,
      phone,
      status: 'new',
    })

    return NextResponse.json({ success: true, member })
  } catch (error: any) {
    console.error('Error joining group:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to join group' },
      { status: 500 }
    )
  }
}
