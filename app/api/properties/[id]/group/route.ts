import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase/client'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      }
    )

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
      .eq('property_id', params.id)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw error
    }

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
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      }
    )

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

    // Get or create property group
    let { data: group, error: groupError } = await supabase
      .from('property_groups')
      .select('*')
      .eq('property_id', params.id)
      .single()

    if (groupError && groupError.code === 'PGRST116') {
      // Create group if doesn't exist
      const { data: newGroup, error: createError } = await supabase
        .from('property_groups')
        .insert({
          property_id: params.id,
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
    if (group.is_locked) {
      return NextResponse.json(
        { error: 'This group is locked and not accepting new members' },
        { status: 400 }
      )
    }

    // Check if group is full
    if (group.filled_slots >= group.total_slots) {
      return NextResponse.json(
        { error: 'This group is full' },
        { status: 400 }
      )
    }

    // Add member to group
    const { data: member, error: memberError } = await supabase
      .from('group_members')
      .insert({
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

    // Create lead
    await supabase.from('property_leads').insert({
      property_id: params.id,
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
