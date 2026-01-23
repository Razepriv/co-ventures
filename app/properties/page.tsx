'use client'

import { useState, useEffect, useMemo, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/Badge'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Search, MapPin, Bed, Bath, Square, Heart, IndianRupee, Filter, X } from 'lucide-react'
import { getSupabaseClient } from '@/lib/supabase/client'
import { useDebounce } from '@/lib/hooks/useDebounce'
import { useRealtimeSubscription } from '@/lib/hooks/useRealtimeSubscription'
import { useLocalStorage } from '@/lib/hooks/useLocalStorage'
import { toast } from 'sonner'

interface Property {
  id: string
  title: string
  description: string
  price: number
  location: string
  city: string
  bhk_type: string
  bedrooms: number
  bathrooms: number
  size_sqft: number
  status: string
  is_featured: boolean
  featured_image: string
  created_at: string
  property_images: { image_url: string; is_primary: boolean }[]
  categories: { name: string }
}

function PropertiesContent() {
  const searchParams = useSearchParams()
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCity, setSelectedCity] = useState('all')
  const [selectedBHK, setSelectedBHK] = useState('all')
  const [selectedType, setSelectedType] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('available')
  const [priceRange, setPriceRange] = useState('all')
  
  // Set initial filters from URL
  useEffect(() => {
    const city = searchParams.get('city')
    const bhk = searchParams.get('bhk')?.replace(' ', '') // Normalize '1 BHK' to '1BHK'
    const price = searchParams.get('price')
    const type = searchParams.get('type')
    const query = searchParams.get('q')

    if (city) setSelectedCity(city)
    if (bhk) setSelectedBHK(bhk)
    if (price) setPriceRange(price)
    if (type) setSelectedType(type)
    if (query) setSearchQuery(query)
  }, [searchParams])
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState('newest')
  const [currency, setCurrency] = useState('INR')
  const [favorites, setFavorites] = useLocalStorage<string[]>('property-favorites', [])
  
  // Debounce search query for better performance
  const debouncedSearchQuery = useDebounce(searchQuery, 300)

  // Currency conversion rates (you can fetch from API in production)
  const currencyRates = useMemo(() => ({
    INR: 1,
    USD: 0.012,
    EUR: 0.011
  }), [])

  // Toggle favorite
  const toggleFavorite = useCallback((propertyId: string) => {
    setFavorites(prev => {
      if (prev.includes(propertyId)) {
        toast.info('Removed from favorites')
        return prev.filter(id => id !== propertyId)
      } else {
        toast.success('Added to favorites')
        return [...prev, propertyId]
      }
    })
  }, [setFavorites])

  // Real-time subscription for property updates
  useRealtimeSubscription<Property>({
    table: 'properties',
    event: '*',
    onInsert: (newProperty) => {
      setProperties(prev => [newProperty, ...prev])
      toast.success('New property added!', {
        description: newProperty.title
      })
    },
    onUpdate: ({ old: oldProperty, new: newProperty }) => {
      setProperties(prev => prev.map(p => p.id === newProperty.id ? newProperty : p))
      toast.info('Property updated', {
        description: newProperty.title
      })
    },
    onDelete: (deletedProperty) => {
      setProperties(prev => prev.filter(p => p.id !== deletedProperty.id))
      toast.error('Property removed', {
        description: deletedProperty.title
      })
    }
  })

  useEffect(() => {
    fetchProperties()
  }, [selectedCity, selectedBHK, selectedType, selectedStatus, priceRange])

  async function fetchProperties() {
    try {
      setLoading(true)
      const supabase = getSupabaseClient()
      
      let query = supabase
        .from('properties')
        .select(`
          *,
          property_images(image_url, is_primary),
          categories(name)
        `)
        .order('created_at', { ascending: false })

      // Apply filters
      if (selectedStatus !== 'all') {
        query = query.eq('status', selectedStatus)
      }

      if (selectedCity !== 'all') {
        query = query.eq('city', selectedCity)
      }

      if (selectedBHK !== 'all') {
        query = query.eq('bhk_type', selectedBHK)
      }

      if (selectedType !== 'all') {
        query = query.eq('property_type', selectedType)
      }

      const { data, error } = await query

      if (error) throw error

      // Apply price range filter
      let filteredData = data || []
      if (priceRange !== 'all') {
        const [min, max] = priceRange.split('-').map(Number)
        filteredData = filteredData.filter(p => {
          if (max) {
            // @ts-ignore
            return p.price >= min && p.price <= max
          }
          // @ts-ignore
          return p.price >= min
        })
      }

      setProperties(filteredData)
    } catch (error) {
      console.error('Error fetching properties:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filter and sort properties with memoization
  const filteredAndSortedProperties = useMemo(() => {
    // First filter by search query
    let filtered = properties.filter(property =>
      property.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
      property.location.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
      property.city.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
    )

    // Then sort
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price
        case 'price-high':
          return b.price - a.price
        case 'popular':
          return (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0)
        case 'newest':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      }
    })

    return sorted
  }, [properties, debouncedSearchQuery, sortBy])

  // Convert price based on selected currency
  const convertPrice = useCallback((price: number) => {
    const converted = price * currencyRates[currency as keyof typeof currencyRates]
    return converted
  }, [currency, currencyRates])

  // Format price display
  const formatPrice = useCallback((price: number) => {
    const converted = convertPrice(price)
    
    switch (currency) {
      case 'USD':
        return `$${(converted / 1000).toFixed(1)}K`
      case 'EUR':
        return `€${(converted / 1000).toFixed(1)}K`
      case 'INR':
      default:
        return `₹${(converted / 100000).toFixed(1)}L`
    }
  }, [currency, convertPrice])

  const cities = ['Bangalore', 'Mumbai', 'Delhi NCR', 'Pune', 'Hyderabad', 'Chennai', 'Kolkata', 'Ahmedabad']
  const bhkTypes = ['1BHK', '2BHK', '3BHK', '4BHK', '5+BHK']
  const propertyTypes = ['Apartments', 'Villas', 'Penthouses', 'Plots']

  return (
    <>
      <Header />
      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative py-20 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <Image
              src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&q=80"
              alt="Find Your Dream Property"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-br from-black/70 to-black/50" />
          </div>

          <div className="container mx-auto px-6 md:px-10 lg:px-20 max-w-[1440px] relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white drop-shadow-2xl">Find Your Dream Property</h1>
              <p className="text-xl text-white/90 max-w-2xl mx-auto">
                Browse our curated collection of premium properties available for co-housing
              </p>
            </motion.div>

            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="max-w-4xl mx-auto"
            >
              <div className="bg-white rounded-xl shadow-2xl p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      placeholder="Search by location, city, or property name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 h-12 text-base"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-coral"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <Button
                    onClick={() => setShowFilters(!showFilters)}
                    variant="outline"
                    className="md:w-auto h-12"
                  >
                    <Filter className="w-5 h-5 mr-2" />
                    Filters
                    {showFilters && <X className="w-4 h-4 ml-2" />}
                  </Button>
                </div>

                {/* Filters */}
                {showFilters && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6 pt-6 border-t"
                  >
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">City</label>
                      <Select value={selectedCity} onValueChange={setSelectedCity}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Cities</SelectItem>
                          {cities.map(city => (
                            <SelectItem key={city} value={city}>{city}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Asset Type</label>
                      <Select value={selectedType} onValueChange={setSelectedType}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          {propertyTypes.map(type => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">BHK</label>
                      <Select value={selectedBHK} onValueChange={setSelectedBHK}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          {bhkTypes.map(bhk => (
                            <SelectItem key={bhk} value={bhk}>{bhk}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Status</label>
                      <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="available">Available</SelectItem>
                          <SelectItem value="sold">Sold</SelectItem>
                          <SelectItem value="rented">Rented</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Price Range</label>
                      <Select value={priceRange} onValueChange={setPriceRange}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Prices</SelectItem>
                          <SelectItem value="0-2500000">Under ₹25L</SelectItem>
                          <SelectItem value="2500000-5000000">₹25L - ₹50L</SelectItem>
                          <SelectItem value="5000000-10000000">₹50L - ₹1Cr</SelectItem>
                          <SelectItem value="10000000-20000000">₹1Cr - ₹2Cr</SelectItem>
                          <SelectItem value="20000000-50000000">₹2Cr - ₹5Cr</SelectItem>
                          <SelectItem value="50000000-100000000">₹5Cr - ₹10Cr</SelectItem>
                          <SelectItem value="100000000-0">Above ₹10Cr</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Properties Grid */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-6 md:px-10 lg:px-20 max-w-[1440px]">
            {/* Results Count and Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <div>
                <p className="text-gray-600">
                  Showing <span className="font-semibold text-charcoal">{filteredAndSortedProperties.length}</span> properties
                </p>
                {/* Active Filters */}
                {(selectedCity !== 'all' || selectedBHK !== 'all' || selectedStatus !== 'available' || priceRange !== 'all' || debouncedSearchQuery) && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {debouncedSearchQuery && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        Search: {debouncedSearchQuery}
                        <X className="w-3 h-3 cursor-pointer" onClick={() => setSearchQuery('')} />
                      </Badge>
                    )}
                    {selectedCity !== 'all' && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        City: {selectedCity}
                        <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedCity('all')} />
                      </Badge>
                    )}
                    {selectedBHK !== 'all' && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        BHK: {selectedBHK}
                        <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedBHK('all')} />
                      </Badge>
                    )}
                    {selectedType !== 'all' && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        Type: {selectedType}
                        <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedType('all')} />
                      </Badge>
                    )}
                    {selectedStatus !== 'available' && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        Status: {selectedStatus}
                        <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedStatus('available')} />
                      </Badge>
                    )}
                    {priceRange !== 'all' && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        Price Range
                        <X className="w-3 h-3 cursor-pointer" onClick={() => setPriceRange('all')} />
                      </Badge>
                    )}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3">
                {/* Currency Selector */}
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger className="w-[100px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INR">₹ INR</SelectItem>
                    <SelectItem value="USD">$ USD</SelectItem>
                    <SelectItem value="EUR">€ EUR</SelectItem>
                  </SelectContent>
                </Select>
                {/* Sort Selector */}
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="popular">Most Popular</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coral"></div>
              </div>
            ) : filteredAndSortedProperties.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-xl text-gray-600 mb-4">No properties found matching your criteria</p>
                <Button onClick={() => {
                  setSearchQuery('')
                  setSelectedCity('all')
                  setSelectedBHK('all')
                  setSelectedStatus('available')
                  setPriceRange('all')
                }}>
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredAndSortedProperties.map((property: Property, index: number) => (
                  <motion.div
                    key={property.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link href={`/properties/${property.id}`}>
                      <div className="group bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300">
                        {/* Image */}
                        <div className="relative h-64 overflow-hidden">
                          <Image
                            src={
                              property.property_images?.find(img => img.is_primary)?.image_url ||
                              property.property_images?.[0]?.image_url ||
                              (property.featured_image && property.featured_image.startsWith('http') ? property.featured_image : null) ||
                              'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80'
                            }
                            alt={property.title}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          {property.is_featured && (
                            <div className="absolute top-4 left-4">
                              <Badge className="bg-amber-500 text-white">Featured</Badge>
                            </div>
                          )}
                          <button 
                            onClick={(e) => {
                              e.preventDefault()
                              toggleFavorite(property.id)
                            }}
                            className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors"
                          >
                            <Heart 
                              className={`w-5 h-5 transition-colors ${
                                favorites.includes(property.id)
                                  ? 'fill-coral text-coral'
                                  : 'text-gray-600 hover:text-coral'
                              }`} 
                            />
                          </button>
                          <div className="absolute bottom-4 left-4">
                            <Badge className={
                              property.status === 'available' ? 'bg-green-500' :
                              property.status === 'sold' ? 'bg-red-500' : 'bg-blue-500'
                            }>
                              {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
                            </Badge>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="text-xl font-bold text-charcoal group-hover:text-coral transition-colors line-clamp-1">
                              {property.title}
                            </h3>
                          </div>

                          <div className="flex items-center text-gray-600 mb-3">
                            <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                            <span className="text-sm line-clamp-1">{property.location}, {property.city}</span>
                          </div>

                          <div className="flex items-center gap-4 mb-4 text-gray-600">
                            <div className="flex items-center gap-1">
                              <Bed className="w-4 h-4" />
                              <span className="text-sm">{property.bedrooms}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Bath className="w-4 h-4" />
                              <span className="text-sm">{property.bathrooms}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Square className="w-4 h-4" />
                              <span className="text-sm">{property.size_sqft} sqft</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-4 border-t">
                            <div>
                              <p className="text-sm text-gray-500">Starting from</p>
                              <div className="flex items-center">
                                {currency === 'INR' && <IndianRupee className="w-5 h-5 text-coral" />}
                                <span className="text-2xl font-bold text-charcoal">
                                  {formatPrice(property.price)}
                                </span>
                              </div>
                            </div>
                            <Button size="sm" className="group-hover:bg-coral-dark transition-colors">
                              View Details
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Load More */}
            {filteredAndSortedProperties.length > 0 && filteredAndSortedProperties.length % 9 === 0 && (
              <div className="text-center mt-12">
                <Button size="lg" variant="outline">
                  Load More Properties
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-6 md:px-10 lg:px-20 max-w-[1440px]">
            <div className="bg-gradient-to-br from-coral to-coral-dark rounded-2xl p-12 text-center text-white">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Can&apos;t Find What You&apos;re Looking For?
              </h2>
              <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
                Let us know your requirements and we&apos;ll help you find the perfect property
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/contact">
                  <Button
                    size="lg"
                    variant="secondary"
                    className="bg-white text-coral hover:bg-gray-100"
                  >
                    Contact Us
                  </Button>
                </Link>
                <Link href="/services">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-2 border-white text-white hover:bg-white hover:text-coral"
                  >
                    Our Services
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

export default function PropertiesPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-coral"></div>
      </div>
    }>
      <PropertiesContent />
    </Suspense>
  )
}
