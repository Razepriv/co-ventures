import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
    try {
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name: string) {
                        return cookies().get(name)?.value
                    },
                },
            }
        )

        const { data: cities, error } = await supabase
            .from('cities')
            .select('id, name, state')
            .eq('is_active', true)
            .order('display_order')

        if (error) throw error

        return NextResponse.json({ cities: cities || [] })
    } catch (error: any) {
        console.error('Error fetching cities:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to fetch cities' },
            { status: 500 }
        )
    }
}
