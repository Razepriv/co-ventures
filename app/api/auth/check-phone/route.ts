import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

export async function POST(request: Request) {
  try {
    const { phone } = await request.json()

    if (!phone) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      )
    }

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('id, email, full_name, phone, firebase_uid')
      .eq('phone', phone)
      .maybeSingle()

    if (error) {
      console.error('Phone check error:', error)
      return NextResponse.json(
        { error: 'Failed to check phone number' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      exists: !!user,
      user: user ? { id: user.id, email: user.email, full_name: user.full_name } : null
    })
  } catch (error) {
    console.error('Check phone error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
