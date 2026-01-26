'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'

interface Specification {
    id: string
    category: string
    specification_key: string
    specification_value: string
}

interface SpecificationsPanelProps {
    specifications: Specification[]
}

export function SpecificationsPanel({ specifications }: SpecificationsPanelProps) {
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['flooring']))

    if (!specifications || specifications.length === 0) {
        return null
    }

    // Group specifications by category
    const categorized = specifications.reduce((acc, spec) => {
        if (!acc[spec.category]) {
            acc[spec.category] = []
        }
        acc[spec.category].push(spec)
        return acc
    }, {} as Record<string, Specification[]>)

    const toggleCategory = (category: string) => {
        const newExpanded = new Set(expandedCategories)
        if (newExpanded.has(category)) {
            newExpanded.delete(category)
        } else {
            newExpanded.add(category)
        }
        setExpandedCategories(newExpanded)
    }

    const categoryLabels: Record<string, string> = {
        flooring: 'Flooring',
        doors: 'Doors & Windows',
        electrical: 'Electrical',
        interior: 'Interior',
        balcony: 'Balcony',
        security: 'Security',
        kitchen: 'Kitchen',
        bathroom: 'Bathroom',
        other: 'Other'
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Specifications</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    {Object.entries(categorized).map(([category, specs]) => {
                        const isExpanded = expandedCategories.has(category)
                        return (
                            <div key={category} className="border border-gray-200 rounded-lg overflow-hidden">
                                <button
                                    onClick={() => toggleCategory(category)}
                                    className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                                >
                                    <span className="font-semibold text-gray-900 capitalize">
                                        {categoryLabels[category] || category}
                                    </span>
                                    {isExpanded ? (
                                        <ChevronUp className="w-5 h-5 text-gray-600" />
                                    ) : (
                                        <ChevronDown className="w-5 h-5 text-gray-600" />
                                    )}
                                </button>
                                {isExpanded && (
                                    <div className="p-4 bg-white">
                                        <div className="space-y-2">
                                            {specs.map((spec) => (
                                                <div
                                                    key={spec.id}
                                                    className="flex justify-between items-start py-2 border-b border-gray-100 last:border-0"
                                                >
                                                    <span className="text-sm text-gray-600 capitalize">
                                                        {spec.specification_key.replace(/_/g, ' ')}
                                                    </span>
                                                    <span className="text-sm font-medium text-gray-900 text-right ml-4">
                                                        {spec.specification_value}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </CardContent>
        </Card>
    )
}
