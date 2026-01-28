import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient()

        // Check if user is admin
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            )
        }

        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single()

        if (userError || !['admin', 'super_admin'].includes(userData?.role)) {
            return NextResponse.json(
                { error: 'Admin access required' },
                { status: 403 }
            )
        }

        // Get query parameters
        const searchParams = request.nextUrl.searchParams
        const property_id = searchParams.get('property_id')
        const lead_type = searchParams.get('lead_type')
        const status = searchParams.get('status')

        // Build query
        let query = supabase
            .from('property_leads')
            .select(`
        *,
        properties (
          id,
          title,
          slug
        ),
        users (
          id,
          full_name,
          email
        )
      `)
            .order('created_at', { ascending: false })

        if (property_id) {
            query = query.eq('property_id', property_id)
        }
        if (lead_type) {
            query = query.eq('lead_type', lead_type)
        }
        if (status) {
            query = query.eq('status', status)
        }

        const { data: leads, error } = await query

        if (error) throw error

        return NextResponse.json({ leads: leads || [] })
    } catch (error: any) {
        console.error('Error fetching leads:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to fetch leads' },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { property_id, lead_type, full_name, email, phone, message } = body

        // Validate required fields
        if (!lead_type || !full_name || !email) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        const supabase = await createClient()
        // Use admin client to bypass RLS for public leads
        const adminSupabase = await createAdminClient()

        // Get current user (optional for leads)
        const { data: { user } } = await supabase.auth.getUser()

        // Create lead using admin client
        const { data: lead, error } = await adminSupabase
            .from('property_leads')
            .insert({
                property_id,
                user_id: user?.id || null,
                lead_type,
                full_name,
                email,
                phone,
                message,
                status: 'new',
            })
            .select()
            .single()

        if (error) throw error

        return NextResponse.json({ success: true, lead })
    } catch (error: any) {
        console.error('Error creating lead:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to create lead' },
            { status: 500 }
        )
    }
}

export async function PUT(request: NextRequest) {
    try {
        const supabase = await createClient()

        // Check if user is admin
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            )
        }

        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single()

        if (userError || !['admin', 'super_admin'].includes(userData?.role)) {
            return NextResponse.json(
                { error: 'Admin access required' },
                { status: 403 }
            )
        }

        const body = await request.json()
        const { id, status, notes, assigned_to } = body

        // Update lead
        const { data: lead, error } = await supabase
            .from('property_leads')
            .update({
                status,
                notes,
                assigned_to,
            })
            .eq('id', id)
            .select()
            .single()

        if (error) throw error

        return NextResponse.json({ success: true, lead })
    } catch (error: any) {
        console.error('Error updating lead:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to update lead' },
            { status: 500 }
        )
    }
}
