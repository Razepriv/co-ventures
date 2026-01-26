import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(
    request: NextRequest,
    { params }: { params: { cityId: string } }
) {
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

        const { data: locations, error } = await supabase
            .from('city_locations')
            .select('id, name')
            .eq('city_id', params.cityId)
            .eq('is_active', true)
            .order('display_order')

        if (error) throw error

        return NextResponse.json({ locations: locations || [] })
    } catch (error: any) {
        console.error('Error fetching locations:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to fetch locations' },
            { status: 500 }
        )
    }
}
