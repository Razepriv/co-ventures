'use client'

import { useState, useEffect, useRef } from 'react'
import { MapPin, ChevronDown, Search, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import Slider from 'rc-slider'
import 'rc-slider/assets/index.css'

interface City {
    id: string
    name: string
    state: string
}

interface Location {
    id: string
    name: string
}

interface Configuration {
    id: string
    name: string
}

export function SearchFilterBar() {
    const [cities, setCities] = useState<City[]>([])
    const [locations, setLocations] = useState<Location[]>([])
    const [configurations, setConfigurations] = useState<Configuration[]>([])

    const [selectedCity, setSelectedCity] = useState<City | null>(null)
    const [selectedLocations, setSelectedLocations] = useState<string[]>([])
    const [selectedConfigurations, setSelectedConfigurations] = useState<string[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [budgetRange, setBudgetRange] = useState<[number, number]>([0.1, 15.0])
    const [showFilters, setShowFilters] = useState(false)
    const [showCityDropdown, setShowCityDropdown] = useState(false)

    const filterRef = useRef<HTMLDivElement>(null)
    const cityDropdownRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        fetchCities()
        fetchConfigurations()
    }, [])

    useEffect(() => {
        if (selectedCity) {
            fetchLocations(selectedCity.id)
        }
    }, [selectedCity])

    // Close filter panel when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            // Only close city dropdown if click is outside the city dropdown container
            if (showCityDropdown && cityDropdownRef.current && !cityDropdownRef.current.contains(event.target as Node)) {
                setShowCityDropdown(false)
            }
            // Only close filters if click is outside the filter container
            if (showFilters && filterRef.current && !filterRef.current.contains(event.target as Node)) {
                setShowFilters(false)
            }
        }

        // Use click instead of mousedown to avoid race condition with button onClick
        document.addEventListener('click', handleClickOutside)
        return () => document.removeEventListener('click', handleClickOutside)
    }, [showFilters, showCityDropdown])

    async function fetchCities() {
        // Fallback cities in case API fails
        const fallbackCities: City[] = [
            { id: 'new-delhi', name: 'New Delhi', state: 'Delhi' },
            { id: 'mumbai', name: 'Mumbai', state: 'Maharashtra' },
            { id: 'bangalore', name: 'Bangalore', state: 'Karnataka' },
            { id: 'pune', name: 'Pune', state: 'Maharashtra' },
            { id: 'hyderabad', name: 'Hyderabad', state: 'Telangana' },
            { id: 'chennai', name: 'Chennai', state: 'Tamil Nadu' },
            { id: 'kolkata', name: 'Kolkata', state: 'West Bengal' },
            { id: 'ahmedabad', name: 'Ahmedabad', state: 'Gujarat' },
            { id: 'gurgaon', name: 'Gurgaon', state: 'Haryana' },
            { id: 'noida', name: 'Noida', state: 'Uttar Pradesh' },
        ]

        try {
            const response = await fetch('/api/search/cities')
            const data = await response.json()
            const citiesData = data.cities && data.cities.length > 0 ? data.cities : fallbackCities
            setCities(citiesData)
            // Set first city as default
            if (citiesData.length > 0) {
                setSelectedCity(citiesData[0])
            }
        } catch (error) {
            console.error('Error fetching cities:', error)
            // Use fallback cities on error
            setCities(fallbackCities)
            setSelectedCity(fallbackCities[0])
        }
    }

    async function fetchLocations(cityId: string) {
        try {
            const response = await fetch(`/api/search/locations/${cityId}`)
            const data = await response.json()
            setLocations(data.locations || [])
        } catch (error) {
            console.error('Error fetching locations:', error)
        }
    }

    async function fetchConfigurations() {
        try {
            const response = await fetch('/api/search/configurations')
            const data = await response.json()
            setConfigurations(data.configurations || [])
        } catch (error) {
            console.error('Error fetching configurations:', error)
        }
    }

    const toggleLocation = (locationId: string) => {
        setSelectedLocations(prev =>
            prev.includes(locationId)
                ? prev.filter(id => id !== locationId)
                : [...prev, locationId]
        )
    }

    const toggleConfiguration = (configId: string) => {
        setSelectedConfigurations(prev =>
            prev.includes(configId)
                ? prev.filter(id => id !== configId)
                : [...prev, configId]
        )
    }

    const clearAllFilters = () => {
        setSelectedLocations([])
        setSelectedConfigurations([])
        setBudgetRange([0.1, 15.0])
        setSearchQuery('')
    }

    const handleSearch = () => {
        // Build query params
        const params = new URLSearchParams()
        if (selectedCity) params.set('city', selectedCity.id)
        if (selectedLocations.length) params.set('locations', selectedLocations.join(','))
        if (selectedConfigurations.length) params.set('configurations', selectedConfigurations.join(','))
        params.set('minBudget', budgetRange[0].toString())
        params.set('maxBudget', budgetRange[1].toString())
        if (searchQuery) params.set('q', searchQuery)

        // Navigate to search results
        window.location.href = `/properties?${params.toString()}`
    }

    return (
        <div className="relative w-full max-w-7xl mx-auto px-4" ref={filterRef}>
            {/* Main Search Bar - Pill Shape */}
            <div className="bg-white rounded-full shadow-lg flex items-center">
                {/* City Selector */}
                <div className="relative" ref={cityDropdownRef}>
                    <button
                        type="button"
                        onClick={() => {
                            console.log('City button clicked, current state:', showCityDropdown)
                            setShowCityDropdown(!showCityDropdown)
                        }}
                        className="flex items-center gap-2 px-6 py-4 hover:bg-gray-50 transition-colors border-r border-gray-200 cursor-pointer"
                    >
                        <MapPin className="w-5 h-5 text-coral" />
                        <div className="text-left">
                            <p className="text-xs text-gray-500">City</p>
                            <p className="font-semibold text-coral">{selectedCity?.name || 'Select City'}</p>
                        </div>
                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showCityDropdown ? 'rotate-180' : ''}`} />
                    </button>

                    {/* City Dropdown */}
                    {showCityDropdown && (
                        <div className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50 min-w-[200px]">
                            {cities.map((city) => (
                                <button
                                    key={city.id}
                                    onClick={() => {
                                        setSelectedCity(city)
                                        setShowCityDropdown(false)
                                    }}
                                    className={`w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors ${selectedCity?.id === city.id ? 'bg-coral/10 text-coral font-semibold' : ''
                                        }`}
                                >
                                    {city.name}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Search Input */}
                <div className="flex-1 px-6">
                    <p className="text-xs text-gray-500 mb-1">Find Your Dream Home</p>
                    <input
                        type="text"
                        placeholder="Search for Developers, Location, Projects"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full text-gray-700 placeholder-gray-400 focus:outline-none"
                    />
                </div>

                {/* Filter Button */}
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="px-6 py-4 hover:bg-gray-50 transition-colors border-l border-gray-200"
                >
                    <p className="text-xs text-gray-500 mb-1">Inventory | Budget</p>
                    <div className="flex items-center gap-2">
                        <span className="text-gray-700">Select Filter</span>
                        <SlidersHorizontal className="w-4 h-4 text-gray-400" />
                    </div>
                </button>

                {/* Search Button */}
                <button
                    onClick={handleSearch}
                    className="bg-gradient-to-r from-coral to-orange-500 text-white px-8 py-4 hover:from-coral-dark hover:to-orange-600 transition-all flex items-center gap-2 rounded-r-full"
                >
                    <Search className="w-5 h-5" />
                    <span className="font-semibold">Search</span>
                </button>
            </div>

            {/* Expandable Filter Panel */}
            {showFilters && (
                <div className="absolute top-full left-0 right-0 mt-4 bg-white rounded-2xl shadow-2xl p-6 z-40">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Left Column - Locations */}
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <MapPin className="w-5 h-5 text-gray-700" />
                                <h3 className="font-semibold text-gray-900">
                                    Locations In {selectedCity?.name || ''}
                                </h3>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {locations.map((location) => (
                                    <button
                                        key={location.id}
                                        onClick={() => toggleLocation(location.id)}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedLocations.includes(location.id)
                                            ? 'bg-coral text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                    >
                                        {location.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Right Column - Property Types & Configuration */}
                        <div className="space-y-6">
                            {/* Property Types */}
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-3">Property Types</h3>
                                <button className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700">
                                    Residential
                                </button>
                            </div>

                            {/* Configuration */}
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-3">Configuration</h3>
                                <div className="flex flex-wrap gap-2">
                                    {configurations.map((config) => (
                                        <button
                                            key={config.id}
                                            onClick={() => toggleConfiguration(config.id)}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedConfigurations.includes(config.id)
                                                ? 'bg-coral text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                        >
                                            {config.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Budget Slider - Full Width */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                        <h3 className="font-semibold text-gray-900 mb-4">Budget</h3>
                        <div className="px-4">
                            <Slider
                                range
                                min={0.1}
                                max={15}
                                step={0.1}
                                value={budgetRange}
                                onChange={(value) => setBudgetRange(value as [number, number])}
                                styles={{
                                    track: { backgroundColor: '#f87171', height: 6 },
                                    rail: { backgroundColor: '#e5e7eb', height: 6 },
                                    handle: {
                                        borderColor: '#f87171',
                                        backgroundColor: '#f87171',
                                        opacity: 1,
                                        width: 20,
                                        height: 20,
                                        marginTop: -7,
                                    },
                                }}
                            />
                            <div className="mt-4 text-center">
                                <span className="inline-block px-4 py-2 bg-coral/10 text-coral font-semibold rounded-full text-sm">
                                    {budgetRange[0].toFixed(1)} CR - {budgetRange[1].toFixed(1)} CR
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-6 flex justify-end gap-3">
                        <button
                            onClick={clearAllFilters}
                            className="px-6 py-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
                        >
                            clear all
                        </button>
                        <button
                            onClick={handleSearch}
                            className="px-6 py-2 bg-gradient-to-r from-coral to-orange-500 text-white rounded-lg font-semibold hover:from-coral-dark hover:to-orange-600 transition-all flex items-center gap-2"
                        >
                            <Search className="w-4 h-4" />
                            Search
                        </button>
                    </div>

                    {/* Refine Filters Link */}
                    <button className="mt-4 flex items-center gap-2 text-coral hover:text-coral-dark transition-colors text-sm font-medium">
                        <SlidersHorizontal className="w-4 h-4" />
                        Refine Filters
                    </button>
                </div>
            )}
        </div>
    )
}
