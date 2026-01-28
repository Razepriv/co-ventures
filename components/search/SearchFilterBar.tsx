'use client'

import { useState, useEffect, useRef } from 'react'
import { MapPin, ChevronDown, Search, SlidersHorizontal, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import Slider from 'rc-slider'
import 'rc-slider/assets/index.css'
import { useRouter } from 'next/navigation'

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

import { AnimatePresence, motion } from 'framer-motion'

export function SearchFilterBar() {
    const router = useRouter()
    const [cities, setCities] = useState<City[]>([])
    const [locations, setLocations] = useState<Location[]>([])
    const [configurations, setConfigurations] = useState<Configuration[]>([])

    const [selectedCity, setSelectedCity] = useState<City | null>(null)
    const [selectedLocations, setSelectedLocations] = useState<string[]>([])
    const [selectedConfigurations, setSelectedConfigurations] = useState<string[]>([])
    const [selectedAssetType, setSelectedAssetType] = useState<string>('Residential')
    const [searchQuery, setSearchQuery] = useState('')
    const [budgetRange, setBudgetRange] = useState<[number, number]>([0.1, 15.0])
    const [showFilters, setShowFilters] = useState(false)
    const [showCityDropdown, setShowCityDropdown] = useState(false)

    const assetTypes = ['Residential', 'Commercial', 'Plots']

    const filterRef = useRef<HTMLDivElement>(null)
    const cityDropdownRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        fetchCities()
        fetchConfigurations()
    }, [])

    useEffect(() => {
        if (selectedCity) {
            fetchLocations(selectedCity.id)
            setSelectedLocations([]) // Reset locations when city changes
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
        setSelectedAssetType('Residential')
        setBudgetRange([0.1, 15.0])
        setSearchQuery('')
    }

    const handleSearch = () => {
        // Build query params
        const params = new URLSearchParams()
        if (selectedCity) params.set('city', selectedCity.id)
        if (selectedLocations.length) params.set('locations', selectedLocations.join(','))
        if (selectedConfigurations.length) params.set('configurations', selectedConfigurations.join(','))
        if (selectedAssetType) params.set('type', selectedAssetType)
        params.set('minBudget', budgetRange[0].toString())
        params.set('maxBudget', budgetRange[1].toString())
        if (searchQuery) params.set('q', searchQuery)

        // Navigate to search results
        router.push(`/properties?${params.toString()}`)
    }

    return (
        <div className="relative w-full max-w-7xl mx-auto px-4" ref={filterRef}>
            {/* Desktop View */}
            <div className="hidden lg:flex bg-white rounded-full shadow-[0_10px_40px_rgba(0,0,0,0.08)] items-center border border-gray-100 p-1">
                {/* City Selector */}
                <div className="relative" ref={cityDropdownRef}>
                    <button
                        type="button"
                        onClick={() => {
                            setShowFilters(false)
                            setShowCityDropdown(!showCityDropdown)
                        }}
                        className="flex items-center gap-3 px-6 py-3 hover:bg-gray-50 transition-colors rounded-l-full border-r border-gray-100"
                    >
                        <div className="w-10 h-10 bg-coral/10 rounded-full flex items-center justify-center">
                            <MapPin className="w-5 h-5 text-coral" />
                        </div>
                        <div className="text-left">
                            <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Location</p>
                            <p className="font-semibold text-charcoal truncate max-w-[120px]">{selectedCity?.name || 'Select City'}</p>
                        </div>
                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showCityDropdown ? 'rotate-180' : ''}`} />
                    </button>

                    {/* City Dropdown */}
                    <AnimatePresence>
                        {showCityDropdown && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="absolute top-full left-0 mt-3 bg-white rounded-2xl shadow-2xl border border-gray-100 py-3 z-50 min-w-[240px] overflow-hidden"
                            >
                                <div className="px-4 py-2 border-b border-gray-50 mb-2">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Select City</p>
                                </div>
                                <div className="max-h-[300px] overflow-y-auto custom-scrollbar px-2">
                                    {cities.map((city) => (
                                        <button
                                            key={city.id}
                                            onClick={() => {
                                                setSelectedCity(city)
                                                setShowCityDropdown(false)
                                            }}
                                            className={`w-full px-4 py-3 text-left hover:bg-coral/5 rounded-xl transition-all flex items-center justify-between group ${selectedCity?.id === city.id ? 'bg-coral/10 text-coral font-bold' : 'text-gray-700'
                                                }`}
                                        >
                                            <span>{city.name}</span>
                                            {selectedCity?.id === city.id && <div className="w-2 h-2 bg-coral rounded-full" />}
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Search Input */}
                <div className="flex-1 px-8 relative flex items-center">
                    <div className="flex-1">
                        <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-1 ml-1">Properties</p>
                        <input
                            type="text"
                            placeholder="Developer, Project or Locality"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full text-charcoal font-medium placeholder-gray-300 focus:outline-none bg-transparent text-lg"
                        />
                    </div>
                    {searchQuery && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setSearchQuery('');
                            }}
                            className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-coral mr-2"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* Filter Trigger */}
                <button
                    onClick={() => {
                        setShowCityDropdown(false)
                        setShowFilters(!showFilters)
                    }}
                    className={`flex items-center gap-3 px-6 py-3 hover:bg-gray-50 transition-all border-l border-gray-100 ${showFilters ? 'bg-gray-50' : ''}`}
                >
                    <div className="text-right hidden xl:block">
                        <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Filters</p>
                        <p className="font-semibold text-charcoal">Budget & Type</p>
                    </div>
                    <div className={`p-2 rounded-lg transition-colors ${showFilters ? 'bg-coral text-white shadow-md' : 'bg-gray-100 text-gray-500'}`}>
                        <SlidersHorizontal className="w-5 h-5" />
                    </div>
                </button>

                {/* Search Action */}
                <div className="px-2">
                    <button
                        onClick={handleSearch}
                        className="bg-coral text-white px-8 py-4 hover:bg-coral-dark transition-all flex items-center gap-3 rounded-full shadow-[0_4px_20px_rgba(255,107,107,0.4)] hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <Search className="w-5 h-5" />
                        <span className="font-bold text-lg">Search</span>
                    </button>
                </div>
            </div>

            {/* Mobile / Tablet View */}
            <div className="lg:hidden">
                <div
                    onClick={() => setShowFilters(true)}
                    className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 flex items-center gap-4 cursor-pointer active:scale-[0.98] transition-all"
                >
                    <div className="w-12 h-12 bg-coral rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md">
                        <Search className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <p className="font-bold text-gray-900 truncate">
                            {searchQuery || 'Where to next?'}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                            {selectedCity?.name || 'Anywhere'} · {selectedAssetType} · Budget
                        </p>
                    </div>
                    <div className="w-10 h-10 border border-gray-100 rounded-xl flex items-center justify-center text-gray-400">
                        <SlidersHorizontal className="w-5 h-5" />
                    </div>
                </div>
            </div>

            {/* Mobile Search & Filter Overlay */}
            <AnimatePresence>
                {showFilters && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] lg:absolute lg:inset-auto lg:top-full lg:left-0 lg:right-0 mt-4 lg:mt-6 h-full lg:h-auto pointer-events-none"
                    >
                        {/* Backdrop for mobile - Only takes space on mobile */}
                        <div
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm lg:hidden pointer-events-auto"
                            onClick={() => setShowFilters(false)}
                        />

                        {/* Content Container */}
                        <motion.div
                            initial={{ y: '100%', opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: '100%', opacity: 0 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="absolute bottom-0 left-0 right-0 lg:relative lg:bottom-auto bg-white rounded-t-[32px] lg:rounded-3xl shadow-2xl p-6 lg:p-10 flex flex-col max-h-[92vh] lg:max-h-[800px] overflow-hidden border border-gray-100 pointer-events-auto"
                        >
                            {/* Mobile Handle */}
                            <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-8 lg:hidden" />

                            {/* Header for mobile */}
                            <div className="flex items-center justify-between mb-8 lg:hidden">
                                <h2 className="text-2xl font-bold text-gray-900">Search Filters</h2>
                                <button
                                    onClick={() => setShowFilters(false)}
                                    className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 active:scale-90 transition-transform"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto lg:overflow-visible custom-scrollbar -mx-2 px-2 pb-24 lg:pb-0">
                                {/* Search Input - Mobile Only */}
                                <div className="mb-8 lg:hidden">
                                    <label className="block text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">Search</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="Developer, Project or locality"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 text-charcoal font-medium focus:ring-2 focus:ring-coral/20 focus:border-coral outline-none transition-all"
                                        />
                                        <Search className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    </div>
                                </div>

                                {/* City Selection - Mobile Only */}
                                <div className="mb-8 lg:hidden">
                                    <label className="block text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">City</label>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                        {cities.map((city) => (
                                            <button
                                                key={city.id}
                                                onClick={() => setSelectedCity(city)}
                                                className={`px-4 py-3 rounded-xl text-sm font-bold transition-all border ${selectedCity?.id === city.id
                                                    ? 'bg-coral border-coral text-white shadow-md shadow-coral/20'
                                                    : 'bg-white border-gray-200 text-gray-600 hover:border-coral/40'
                                                    }`}
                                            >
                                                {city.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    {/* Left Column - Locations */}
                                    <div>
                                        <div className="flex items-center gap-3 mb-5">
                                            <div className="w-8 h-8 bg-coral/10 rounded-lg flex items-center justify-center">
                                                <MapPin className="w-5 h-5 text-coral" />
                                            </div>
                                            <h3 className="font-bold text-lg text-gray-900">
                                                Micro-markets in {selectedCity?.name}
                                            </h3>
                                        </div>
                                        <div className="flex flex-wrap gap-2 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar lg:min-h-[100px]">
                                            {locations.length > 0 ? (
                                                locations.map((location) => (
                                                    <button
                                                        key={location.id}
                                                        onClick={() => toggleLocation(location.id)}
                                                        className={`px-5 py-3 rounded-xl text-sm font-bold transition-all ${selectedLocations.includes(location.id)
                                                            ? 'bg-coral text-white shadow-lg shadow-coral/20'
                                                            : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-100'
                                                            }`}
                                                    >
                                                        {location.name}
                                                    </button>
                                                ))
                                            ) : (
                                                <p className="text-gray-400 italic text-sm">Select a city to see micro-markets</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Right Column */}
                                    <div className="space-y-10">
                                        {/* Asset Types */}
                                        <div>
                                            <h3 className="font-bold text-lg text-gray-900 mb-5 flex items-center gap-2">
                                                <div className="w-1.5 h-6 bg-coral rounded-full" />
                                                Property Types
                                            </h3>
                                            <div className="flex flex-wrap gap-3">
                                                {assetTypes.map((type) => (
                                                    <button
                                                        key={type}
                                                        onClick={() => setSelectedAssetType(type)}
                                                        className={`px-6 py-3 rounded-xl text-sm font-bold transition-all ${selectedAssetType === type
                                                            ? 'bg-charcoal text-white shadow-xl'
                                                            : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-100'
                                                            }`}
                                                    >
                                                        {type}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Configuration */}
                                        <div>
                                            <h3 className="font-bold text-lg text-gray-900 mb-5 flex items-center gap-2">
                                                <div className="w-1.5 h-6 bg-coral rounded-full" />
                                                Configuration
                                            </h3>
                                            <div className="flex flex-wrap gap-3">
                                                {configurations.map((config) => (
                                                    <button
                                                        key={config.id}
                                                        onClick={() => toggleConfiguration(config.id)}
                                                        className={`px-6 py-3 rounded-xl text-sm font-bold transition-all ${selectedConfigurations.includes(config.id)
                                                            ? 'bg-coral text-white shadow-lg shadow-coral/20'
                                                            : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-100'
                                                            }`}
                                                    >
                                                        {config.name}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Budget Section */}
                                <div className="mt-12 pt-10 border-t border-gray-100">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                                        <h3 className="font-bold text-xl text-gray-900">Your Budget Range</h3>
                                        <div className="bg-coral/5 px-6 py-3 rounded-2xl border border-coral/10">
                                            <span className="text-coral font-black text-xl">
                                                {budgetRange[0].toFixed(1)} Cr - {budgetRange[1].toFixed(1)} Cr
                                            </span>
                                        </div>
                                    </div>
                                    <div className="px-5">
                                        <Slider
                                            range
                                            min={0.1}
                                            max={15}
                                            step={0.1}
                                            value={budgetRange}
                                            onChange={(value) => setBudgetRange(value as [number, number])}
                                            styles={{
                                                track: { backgroundColor: '#FF6B6B', height: 10, borderRadius: 5 },
                                                rail: { backgroundColor: '#F3F4F6', height: 10, borderRadius: 5 },
                                                handle: {
                                                    borderColor: '#FF6B6B',
                                                    backgroundColor: '#FFFFFF',
                                                    opacity: 1,
                                                    width: 32,
                                                    height: 32,
                                                    marginTop: -11,
                                                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                                    borderWidth: 4
                                                },
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Actions - Sticky at bottom for mobile */}
                            <div className="absolute lg:relative bottom-0 left-0 right-0 p-6 lg:p-0 bg-white lg:bg-transparent border-t lg:border-t-0 border-gray-100 lg:mt-12 flex items-center justify-between gap-6 pointer-events-auto">
                                <button
                                    onClick={clearAllFilters}
                                    className="text-gray-400 hover:text-coral font-bold transition-colors text-sm uppercase tracking-widest"
                                >
                                    clear all
                                </button>
                                <button
                                    onClick={handleSearch}
                                    className="flex-1 lg:flex-none px-12 py-5 bg-gradient-to-r from-coral to-orange-500 text-white rounded-2xl lg:rounded-full font-black text-lg hover:shadow-2xl hover:shadow-coral/40 transition-all flex items-center justify-center gap-3 active:scale-95 transition-transform"
                                >
                                    <Search className="w-6 h-6" />
                                    Show Properties
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
