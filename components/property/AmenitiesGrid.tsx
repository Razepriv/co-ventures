'use client'

import { Check } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import * as Icons from 'lucide-react'

interface Amenity {
    id: string
    name: string
    icon: string
    category: string
    is_available: boolean
}

interface AmenitiesGridProps {
    amenities: Amenity[]
}

export function AmenitiesGrid({ amenities }: AmenitiesGridProps) {
    if (!amenities || amenities.length === 0) {
        return null
    }

    const getIcon = (iconName: string) => {
        const Icon = (Icons as any)[iconName] || Icons.Check
        return Icon
    }

    // Group amenities by category
    const categorized = amenities.reduce((acc, amenity) => {
        const category = amenity.category || 'other'
        if (!acc[category]) {
            acc[category] = []
        }
        acc[category].push(amenity)
        return acc
    }, {} as Record<string, Amenity[]>)

    const categoryLabels: Record<string, string> = {
        parking: 'Parking',
        security: 'Security',
        facilities: 'Facilities',
        recreation: 'Recreation',
        utilities: 'Utilities',
        other: 'Other Amenities'
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Amenities & Features</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {Object.entries(categorized).map(([category, items]) => (
                        <div key={category}>
                            <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
                                {categoryLabels[category] || category}
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                {items.map((amenity) => {
                                    const Icon = getIcon(amenity.icon)
                                    return (
                                        <div
                                            key={amenity.id}
                                            className={`flex items-center gap-2 p-2 rounded-lg border ${amenity.is_available
                                                    ? 'border-green-200 bg-green-50'
                                                    : 'border-gray-200 bg-gray-50 opacity-60'
                                                }`}
                                        >
                                            <Icon className={`w-4 h-4 ${amenity.is_available ? 'text-coral' : 'text-gray-400'}`} />
                                            <span className="text-sm text-gray-700">{amenity.name}</span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
