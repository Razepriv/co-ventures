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

    // Get group info
    const { data: group, error } = await supabase
      .from('property_groups')
      .select(`
        *,
        group_members (
          id,
          user_id,
          full_name,
          email,
          joined_at
        )
      `)
      .eq('property_id', propertyId)
      .maybeSingle()

    if (error) throw error

    return NextResponse.json({
      group: group || { total_slots: 5, filled_slots: 0, is_locked: false, group_members: [] },
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

    // Get or create property group using admin client to bypass RLS
    let { data: group, error: groupError } = await adminSupabase
      .from('property_groups')
      .select('*')
      .eq('property_id', propertyId)
      .maybeSingle()

    if (!group) {
      // Create group if doesn't exist (using admin client)
      const { data: newGroup, error: createError } = await adminSupabase
        .from('property_groups')
        // @ts-ignore
        .insert({
          property_id: propertyId,
          total_slots: 5,
          filled_slots: 0,
        })
        .select()
        .single()

      if (createError) throw createError
      group = newGroup
    } else if (groupError) {
      throw groupError
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

    // Add member to group (using admin client)
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
