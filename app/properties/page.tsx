'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/Badge'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Search, MapPin, Bed, Bath, Square, Heart, IndianRupee, Filter, X } from 'lucide-react'
import { getSupabaseClient } from '@/lib/supabase/client'
import { formatDistanceToNow } from 'date-fns'

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

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCity, setSelectedCity] = useState('all')
  const [selectedBHK, setSelectedBHK] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('available')
  const [priceRange, setPriceRange] = useState('all')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    fetchProperties()
  }, [selectedCity, selectedBHK, selectedStatus, priceRange])

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

  const filteredProperties = properties.filter(property =>
    property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    property.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    property.city.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const cities = ['Bangalore', 'Mumbai', 'Delhi', 'Hyderabad', 'Chennai', 'Pune']
  const bhkTypes = ['1BHK', '2BHK', '3BHK', '4BHK', '5+BHK']

  return (
    <>
      <Header />
      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-coral to-coral-dark text-white py-20">
          <div className="container mx-auto px-6 md:px-10 lg:px-20 max-w-[1440px]">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Find Your Dream Property</h1>
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
                          <SelectItem value="0-5000000">Under ₹50L</SelectItem>
                          <SelectItem value="5000000-10000000">₹50L - ₹1Cr</SelectItem>
                          <SelectItem value="10000000-20000000">₹1Cr - ₹2Cr</SelectItem>
                          <SelectItem value="20000000-0">Above ₹2Cr</SelectItem>
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
            {/* Results Count */}
            <div className="flex justify-between items-center mb-8">
              <p className="text-gray-600">
                Showing <span className="font-semibold text-charcoal">{filteredProperties.length}</span> properties
              </p>
              <Select defaultValue="newest">
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

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coral"></div>
              </div>
            ) : filteredProperties.length === 0 ? (
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
                {filteredProperties.map((property, index) => (
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
                              property.featured_image ||
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
                          <button className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors">
                            <Heart className="w-5 h-5 text-gray-600 hover:text-coral" />
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
                                <IndianRupee className="w-5 h-5 text-coral" />
                                <span className="text-2xl font-bold text-charcoal">
                                  {(property.price / 100000).toFixed(1)}L
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
            {filteredProperties.length > 0 && filteredProperties.length % 9 === 0 && (
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
