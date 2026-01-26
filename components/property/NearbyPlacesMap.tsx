'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { MapPin, Navigation } from 'lucide-react'
import * as Icons from 'lucide-react'

interface NearbyPlace {
    id: string
    place_type: string
    name: string
    distance_km: number
}

interface NearbyPlacesMapProps {
    nearbyPlaces: NearbyPlace[]
    propertyLocation: string
    propertyCity: string
    latitude?: number
    longitude?: number
}

export function NearbyPlacesMap({
    nearbyPlaces,
    propertyLocation,
    propertyCity,
    latitude,
    longitude
}: NearbyPlacesMapProps) {
    const placeTypeIcons: Record<string, keyof typeof Icons> = {
        school: 'GraduationCap',
        restaurant: 'UtensilsCrossed',
        hospital: 'Cross',
        hotel: 'Building',
        cafe: 'Coffee',
        mall: 'ShoppingBag',
        bank: 'Building2',
        atm: 'CreditCard',
        pharmacy: 'Pill',
        gym: 'Dumbbell',
        park: 'Trees',
        other: 'MapPin'
    }

    const getPlaceIcon = (placeType: string) => {
        const iconName = placeTypeIcons[placeType] || 'MapPin'
        return (Icons as any)[iconName] || Icons.MapPin
    }

    // Group nearby places by type
    const groupedPlaces = nearbyPlaces.reduce((acc, place) => {
        if (!acc[place.place_type]) {
            acc[place.place_type] = []
        }
        acc[place.place_type].push(place)
        return acc
    }, {} as Record<string, NearbyPlace[]>)

    return (
        <Card>
            <CardHeader>
                <CardTitle>Location & Nearby Places</CardTitle>
            </CardHeader>
            <CardContent>
                {/* Map */}
                <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden mb-6">
                    <iframe
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        loading="lazy"
                        allowFullScreen
                        referrerPolicy="no-referrer-when-downgrade"
                        src={
                            latitude && longitude
                                ? `https://maps.google.com/maps?q=${latitude},${longitude}&t=&z=15&ie=UTF8&iwloc=&output=embed`
                                : `https://maps.google.com/maps?q=${encodeURIComponent(
                                    `${propertyLocation}, ${propertyCity}, India`
                                )}&t=&z=15&ie=UTF8&iwloc=&output=embed`
                        }
                    />
                </div>

                {/* Address */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-coral mt-0.5" />
                        <div>
                            <p className="font-semibold text-gray-900 mb-1">Address</p>
                            <p className="text-gray-700">
                                {propertyLocation}, {propertyCity}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Nearby Places */}
                {nearbyPlaces.length > 0 && (
                    <div>
                        <h4 className="font-semibold text-gray-900 mb-4">Nearby Places</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {Object.entries(groupedPlaces).map(([type, places]) => {
                                const Icon = getPlaceIcon(type)
                                return places.map((place) => (
                                    <div
                                        key={place.id}
                                        className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-coral transition-colors"
                                    >
                                        <div className="w-10 h-10 bg-coral/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <Icon className="w-5 h-5 text-coral" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-gray-900 truncate">{place.name}</p>
                                            <p className="text-xs text-gray-600 capitalize">{place.place_type.replace('_', ' ')}</p>
                                        </div>
                                        <div className="flex items-center gap-1 text-sm font-semibold text-coral">
                                            <Navigation className="w-3 h-3" />
                                            {place.distance_km.toFixed(1)} km
                                        </div>
                                    </div>
                                ))
                            })}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
