"use client"

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { ArrowLeft, Plus, Trash2, GripVertical, Save } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

interface PropertyContent {
    highlights: string[]
    amenities: { category: string; items: string[] }[]
    specifications: { [key: string]: string }
    nearby_places: { name: string; distance: string }[]
}

export default function PropertyContentPage() {
    const params = useParams()
    const propertyId = params.id as string

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [property, setProperty] = useState<any>(null)
    const [content, setContent] = useState<PropertyContent>({
        highlights: [],
        amenities: [],
        specifications: {},
        nearby_places: []
    })

    const fetchPropertyContent = useCallback(async () => {
        try {
            const supabase = getSupabaseClient()
            const { data, error } = await supabase
                .from('properties')
                .select('title, investment_highlights, amenities')
                .eq('id', propertyId)
                .single()

            if (error) throw error

            const typedData = data as any
            setProperty(typedData)
            setContent({
                highlights: (typedData?.investment_highlights as string[]) || [],
                amenities: parseAmenities((typedData?.amenities as string[]) || []),
                specifications: {},
                nearby_places: []
            })
        } catch (error) {
            console.error('Error fetching property:', error)
            toast.error('Failed to load property content')
        } finally {
            setLoading(false)
        }
    }, [propertyId])

    useEffect(() => {
        fetchPropertyContent()
    }, [fetchPropertyContent])

    function parseAmenities(amenitiesArray: string[]) {
        // Group amenities by category (basic parsing)
        const categories: { [key: string]: string[] } = {}
        amenitiesArray.forEach(item => {
            const category = 'General'
            if (!categories[category]) categories[category] = []
            categories[category].push(item)
        })
        return Object.entries(categories).map(([category, items]) => ({ category, items }))
    }

    async function handleSave() {
        setSaving(true)
        try {
            const supabase = getSupabaseClient()

            // Flatten amenities back to array
            const amenitiesArray = content.amenities.flatMap(cat => cat.items)

            const { error } = await supabase
                .from('properties')
                // @ts-ignore
                .update({
                    investment_highlights: content.highlights,
                    amenities: amenitiesArray
                })
                .eq('id', propertyId)

            if (error) throw error

            toast.success('Content saved successfully')
        } catch (error) {
            console.error('Error saving content:', error)
            toast.error('Failed to save content')
        } finally {
            setSaving(false)
        }
    }

    function addHighlight() {
        setContent({
            ...content,
            highlights: [...content.highlights, '']
        })
    }

    function updateHighlight(index: number, value: string) {
        const newHighlights = [...content.highlights]
        newHighlights[index] = value
        setContent({ ...content, highlights: newHighlights })
    }

    function removeHighlight(index: number) {
        setContent({
            ...content,
            highlights: content.highlights.filter((_, i) => i !== index)
        })
    }

    function addAmenityCategory() {
        setContent({
            ...content,
            amenities: [...content.amenities, { category: 'New Category', items: [] }]
        })
    }

    function updateAmenityCategory(index: number, category: string) {
        const newAmenities = [...content.amenities]
        newAmenities[index].category = category
        setContent({ ...content, amenities: newAmenities })
    }

    function addAmenityItem(categoryIndex: number) {
        const newAmenities = [...content.amenities]
        newAmenities[categoryIndex].items.push('')
        setContent({ ...content, amenities: newAmenities })
    }

    function updateAmenityItem(categoryIndex: number, itemIndex: number, value: string) {
        const newAmenities = [...content.amenities]
        newAmenities[categoryIndex].items[itemIndex] = value
        setContent({ ...content, amenities: newAmenities })
    }

    function removeAmenityItem(categoryIndex: number, itemIndex: number) {
        const newAmenities = [...content.amenities]
        newAmenities[categoryIndex].items = newAmenities[categoryIndex].items.filter((_, i) => i !== itemIndex)
        setContent({ ...content, amenities: newAmenities })
    }

    function removeAmenityCategory(index: number) {
        setContent({
            ...content,
            amenities: content.amenities.filter((_, i) => i !== index)
        })
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-coral-600"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6 px-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href={`/admin/properties`}>
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Property Content</h1>
                        <p className="mt-1 text-sm text-gray-500">{property?.title}</p>
                    </div>
                </div>
                <Button onClick={handleSave} disabled={saving}>
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? 'Saving...' : 'Save Changes'}
                </Button>
            </div>

            {/* Investment Highlights */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Investment Highlights</CardTitle>
                            <CardDescription>Key selling points for investors</CardDescription>
                        </div>
                        <Button onClick={addHighlight} size="sm">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Highlight
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {content.highlights.length === 0 ? (
                            <p className="text-center text-gray-500 py-8">No highlights added yet</p>
                        ) : (
                            content.highlights.map((highlight, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <GripVertical className="h-4 w-4 text-gray-400" />
                                    <Input
                                        value={highlight}
                                        onChange={(e) => updateHighlight(index, e.target.value)}
                                        placeholder="e.g., Prime Location - Heart of City"
                                        className="flex-1"
                                    />
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => removeHighlight(index)}
                                        className="text-red-600"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Amenities */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Amenities</CardTitle>
                            <CardDescription>Organize amenities by category</CardDescription>
                        </div>
                        <Button onClick={addAmenityCategory} size="sm">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Category
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        {content.amenities.length === 0 ? (
                            <p className="text-center text-gray-500 py-8">No amenities added yet</p>
                        ) : (
                            content.amenities.map((category, catIndex) => (
                                <div key={catIndex} className="border rounded-lg p-4">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Input
                                            value={category.category}
                                            onChange={(e) => updateAmenityCategory(catIndex, e.target.value)}
                                            className="font-semibold"
                                            placeholder="Category name"
                                        />
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => addAmenityItem(catIndex)}
                                        >
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => removeAmenityCategory(catIndex)}
                                            className="text-red-600"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <div className="space-y-2 ml-4">
                                        {category.items.map((item, itemIndex) => (
                                            <div key={itemIndex} className="flex items-center gap-2">
                                                <Input
                                                    value={item}
                                                    onChange={(e) => updateAmenityItem(catIndex, itemIndex, e.target.value)}
                                                    placeholder="Amenity name"
                                                    className="flex-1"
                                                />
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => removeAmenityItem(catIndex, itemIndex)}
                                                    className="text-red-600"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
