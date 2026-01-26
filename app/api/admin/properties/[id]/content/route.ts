import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
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

        // Fetch all content for this property
        const [highlights, amenities, specifications, nearbyPlaces, reraInfo] = await Promise.all([
            supabase
                .from('property_highlights')
                .select('*')
                .eq('property_id', params.id)
                .order('display_order'),
            supabase
                .from('property_amenities')
                .select('*')
                .eq('property_id', params.id)
                .order('display_order'),
            supabase
                .from('property_specifications')
                .select('*')
                .eq('property_id', params.id)
                .order('category, display_order'),
            supabase
                .from('nearby_places')
                .select('*')
                .eq('property_id', params.id),
            supabase
                .from('property_rera_info')
                .select('*')
                .eq('property_id', params.id)
                .single(),
        ])

        return NextResponse.json({
            highlights: highlights.data || [],
            amenities: amenities.data || [],
            specifications: specifications.data || [],
            nearbyPlaces: nearbyPlaces.data || [],
            reraInfo: reraInfo.data || null,
        })
    } catch (error: any) {
        console.error('Error fetching content:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to fetch content' },
            { status: 500 }
        )
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
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
        const { type, data: contentData } = body

        let result
        switch (type) {
            case 'highlight':
                result = await supabase
                    .from('property_highlights')
                    .insert({ ...contentData, property_id: params.id })
                    .select()
                    .single()
                break
            case 'amenity':
                result = await supabase
                    .from('property_amenities')
                    .insert({ ...contentData, property_id: params.id })
                    .select()
                    .single()
                break
            case 'specification':
                result = await supabase
                    .from('property_specifications')
                    .insert({ ...contentData, property_id: params.id })
                    .select()
                    .single()
                break
            case 'nearby_place':
                result = await supabase
                    .from('nearby_places')
                    .insert({ ...contentData, property_id: params.id })
                    .select()
                    .single()
                break
            case 'rera_info':
                result = await supabase
                    .from('property_rera_info')
                    .upsert({ ...contentData, property_id: params.id })
                    .select()
                    .single()
                break
            default:
                return NextResponse.json(
                    { error: 'Invalid content type' },
                    { status: 400 }
                )
        }

        if (result.error) throw result.error

        return NextResponse.json({ success: true, data: result.data })
    } catch (error: any) {
        console.error('Error creating content:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to create content' },
            { status: 500 }
        )
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
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
        const { type, itemId, data: contentData } = body

        let result
        switch (type) {
            case 'highlight':
                result = await supabase
                    .from('property_highlights')
                    .update(contentData)
                    .eq('id', itemId)
                    .select()
                    .single()
                break
            case 'amenity':
                result = await supabase
                    .from('property_amenities')
                    .update(contentData)
                    .eq('id', itemId)
                    .select()
                    .single()
                break
            case 'specification':
                result = await supabase
                    .from('property_specifications')
                    .update(contentData)
                    .eq('id', itemId)
                    .select()
                    .single()
                break
            case 'nearby_place':
                result = await supabase
                    .from('nearby_places')
                    .update(contentData)
                    .eq('id', itemId)
                    .select()
                    .single()
                break
            default:
                return NextResponse.json(
                    { error: 'Invalid content type' },
                    { status: 400 }
                )
        }

        if (result.error) throw result.error

        return NextResponse.json({ success: true, data: result.data })
    } catch (error: any) {
        console.error('Error updating content:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to update content' },
            { status: 500 }
        )
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
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

        const searchParams = request.nextUrl.searchParams
        const type = searchParams.get('type')
        const itemId = searchParams.get('itemId')

        if (!type || !itemId) {
            return NextResponse.json(
                { error: 'Missing type or itemId' },
                { status: 400 }
            )
        }

        let result
        switch (type) {
            case 'highlight':
                result = await supabase
                    .from('property_highlights')
                    .delete()
                    .eq('id', itemId)
                break
            case 'amenity':
                result = await supabase
                    .from('property_amenities')
                    .delete()
                    .eq('id', itemId)
                break
            case 'specification':
                result = await supabase
                    .from('property_specifications')
                    .delete()
                    .eq('id', itemId)
                break
            case 'nearby_place':
                result = await supabase
                    .from('nearby_places')
                    .delete()
                    .eq('id', itemId)
                break
            default:
                return NextResponse.json(
                    { error: 'Invalid content type' },
                    { status: 400 }
                )
        }

        if (result.error) throw result.error

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error('Error deleting content:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to delete content' },
            { status: 500 }
        )
    }
}
