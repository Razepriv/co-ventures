import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

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

        const { data: configurations, error } = await supabase
            .from('property_configurations')
            .select('id, name')
            .eq('is_active', true)
            .order('display_order')

        if (error) throw error

        return NextResponse.json({ configurations: configurations || [] })
    } catch (error: any) {
        console.error('Error fetching configurations:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to fetch configurations' },
            { status: 500 }
        )
    }
}
