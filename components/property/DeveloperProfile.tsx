'use client'

import { Building2, BarChart3, ExternalLink } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import Image from 'next/image'

interface Developer {
    id: string
    name: string
    logo_url?: string
    description?: string
    years_of_experience?: number
    total_projects?: number
    website_url?: string
}

interface DeveloperProfileProps {
    developer: Developer | null
    // Fallback to legacy fields
    developerName?: string
    developerLogo?: string
    yearsOfExperience?: number
    totalProjects?: number
}

export function DeveloperProfile({
    developer,
    developerName,
    developerLogo,
    yearsOfExperience,
    totalProjects
}: DeveloperProfileProps) {
    // Use developer object if available, otherwise fall back to individual fields
    const dev = developer || {
        name: developerName,
        logo_url: developerLogo,
        years_of_experience: yearsOfExperience,
        total_projects: totalProjects
    }

    if (!dev.name) {
        return null
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>About the Developer</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col md:flex-row items-start gap-6">
                    {dev.logo_url && (
                        <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                            <Image
                                src={dev.logo_url}
                                alt={dev.name}
                                width={96}
                                height={96}
                                className="object-contain"
                            />
                        </div>
                    )}

                    <div className="flex-1 space-y-4">
                        <div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">{dev.name}</h3>
                            {developer?.description && (
                                <p className="text-gray-600 leading-relaxed">{developer.description}</p>
                            )}
                        </div>

                        <div className="flex flex-wrap gap-6">
                            {dev.years_of_experience && (
                                <div className="flex items-center gap-2">
                                    <div className="w-10 h-10 bg-coral/10 rounded-lg flex items-center justify-center">
                                        <Building2 className="w-5 h-5 text-coral" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-gray-900">{dev.years_of_experience}+</p>
                                        <p className="text-sm text-gray-600">Years Experience</p>
                                    </div>
                                </div>
                            )}

                            {dev.total_projects && (
                                <div className="flex items-center gap-2">
                                    <div className="w-10 h-10 bg-coral/10 rounded-lg flex items-center justify-center">
                                        <BarChart3 className="w-5 h-5 text-coral" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-gray-900">{dev.total_projects}+</p>
                                        <p className="text-sm text-gray-600">Total Projects</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {developer?.website_url && (
                            <a
                                href={developer.website_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-coral hover:text-coral-dark transition-colors"
                            >
                                <span className="text-sm font-medium">Visit Website</span>
                                <ExternalLink className="w-4 h-4" />
                            </a>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
