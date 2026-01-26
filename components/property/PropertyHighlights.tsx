'use client'

import { Check } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import * as Icons from 'lucide-react'

interface Highlight {
    id: string
    icon: string
    title: string
    description: string
}

interface PropertyHighlightsProps {
    highlights: Highlight[]
}

export function PropertyHighlights({ highlights }: PropertyHighlightsProps) {
    if (!highlights || highlights.length === 0) {
        return null
    }

    const getIcon = (iconName: string) => {
        const Icon = (Icons as any)[iconName] || Icons.Check
        return Icon
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Property Highlights</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {highlights.map((highlight) => {
                        const Icon = getIcon(highlight.icon)
                        return (
                            <div key={highlight.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                <div className="flex-shrink-0 w-10 h-10 bg-coral/10 rounded-lg flex items-center justify-center">
                                    <Icon className="w-5 h-5 text-coral" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-semibold text-gray-900 mb-1">{highlight.title}</h4>
                                    {highlight.description && (
                                        <p className="text-sm text-gray-600">{highlight.description}</p>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </CardContent>
        </Card>
    )
}
