'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { 
  MapPin, Bed, Bath, Square, Calendar, ParkingCircle, Check, Mail, Phone, User,
  ChevronLeft, ChevronRight, Share2, Heart, Download, TrendingUp, DollarSign,
  Building2, Users, Shield, FileText, Video, ExternalLink, Star, Clock,
  MessageSquare, Sparkles, BarChart3, PieChart, Home, Maximize, X
} from 'lucide-react'
import { getSupabaseClient } from '@/lib/supabase/client'
import { formatDistanceToNow } from 'date-fns'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/lib/auth/AuthProvider'
import { useSubscription } from '@/lib/hooks/useSubscription'
import { SubscriptionPlansModal } from '@/components/subscription/SubscriptionPlansModal'
import { InvestNowModal } from '@/components/property/InvestNowModal'
import { LiveTourModal } from '@/components/property/LiveTourModal'
import { toast } from 'sonner'

interface Property {
  id: string
  title: string
  description: string
  price: number
  location: string
  city: string
  state: string
  bhk_type: string
  bedrooms: number
  bathrooms: number
  area_sqft: number
  super_area_sqft?: number
  carpet_area_sqft?: number
  property_type: string
  status: string
  is_featured: boolean
  amenities: string[]
  parking_spaces: number
  floor_number?: number
  total_floors?: number
  furnishing_status?: string
  age_years?: number
  featured_image: string
  property_images: { image_url: string; is_primary: boolean; display_order: number }[]
  // Investment fields
  investment_type?: string
  total_investment_amount?: number
  minimum_investment?: number
  maximum_investment?: number
  investment_slots?: number
  filled_slots?: number
  expected_roi_percentage?: number
  investment_duration_months?: number
  rental_yield_percentage?: number
  appreciation_rate?: number
  estimated_monthly_rental?: number
  maintenance_charges?: number
  property_tax?: number
  investment_highlights?: string[]
  // Developer
  developer_name?: string
  developer_logo?: string
  years_of_experience?: number
  total_projects?: number
  // Legal
  rera_number?: string
  possession_date?: string
  legal_status?: string
  // Documents
  brochure_url?: string
  floor_plan_url?: string
  layout_plan_url?: string
  video_tour_url?: string
  // Rating
  average_rating?: number
  total_reviews?: number
  created_at: string
}

export default function PropertyDetailsPage({ params }: { params: { id: string } }) {
  const { user } = useAuth()
  const { currentPlan, usage } = useSubscription()
  const [property, setProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [showInvestModal, setShowInvestModal] = useState(false)
  const [showAIAssistant, setShowAIAssistant] = useState(false)
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false)
  const [saved, setSaved] = useState(false)
  const [aiMessages, setAiMessages] = useState<Array<{role: 'user' | 'assistant', content: string}>>([])
  const [aiInput, setAiInput] = useState('')
  const [aiLoading, setAiLoading] = useState(false)

  useEffect(() => {
    fetchProperty()
  }, [params.id])

  async function fetchProperty() {
    try {
      const supabase = getSupabaseClient()
      
      // Check if params.id is a UUID or slug
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(params.id)
      
      let query = supabase
        .from('properties')
        .select('*, property_images(image_url, is_primary, display_order)')
      
      if (isUUID) {
        query = query.eq('id', params.id)
      } else {
        query = query.eq('slug', params.id)
      }
      
      const { data, error } = await query.single()

      if (error) throw error
      
      // Sort images by display_order
      if (data) {
        const propertyData = data as any
        if (propertyData.property_images) {
          propertyData.property_images.sort((a: any, b: any) => a.display_order - b.display_order)
        }
        setProperty(propertyData as Property)
      }
    } catch (error) {
      console.error('Error fetching property:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAIChat = () => {
    if (!user) {
      toast.error('Please login to use AI Assistant')
      return
    }

    if (!currentPlan || currentPlan.slug === 'free') {
      setShowSubscriptionModal(true)
      toast.error('AI Assistant is available for premium subscribers only')
      return
    }

    setShowAIAssistant(true)
    if (aiMessages.length === 0) {
      // Add welcome message
      setAiMessages([{
        role: 'assistant',
        content: `Hello! I'm your AI property investment advisor. I can help you understand this property's investment potential, analyze returns, compare locations, and answer any questions about "${property?.title}". What would you like to know?`
      }])
    }
  }

  const handleSendMessage = async () => {
    if (!aiInput.trim() || aiLoading) return

    const userMessage = aiInput.trim()
    setAiInput('')
    setAiMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setAiLoading(true)

    try {
      // Call AI API
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...aiMessages, { role: 'user', content: userMessage }],
          propertyId: property?.id,
          propertyData: {
            title: property?.title,
            price: property?.price,
            location: property?.location,
            roi: property?.expected_roi_percentage,
            rental_yield: property?.rental_yield_percentage,
            investment_type: property?.investment_type
          }
        })
      })

      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error)
      }

      setAiMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data.message || 'I apologize, but I encountered an error. Please try again.' 
      }])
    } catch (error: any) {
      console.error('AI Chat error:', error)
      toast.error('Failed to get AI response. Please try again.')
      setAiMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'I apologize, but I encountered an error processing your request. Please try again.' 
      }])
    } finally {
      setAiLoading(false)
    }
  }

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coral"></div>
        </div>
      </>
    )
  }

  if (!property) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Property Not Found</h1>
            <Link href="/properties">
              <Button>Browse Properties</Button>
            </Link>
          </div>
        </div>
      </>
    )
  }

  const images = property.property_images?.length > 0 
    ? property.property_images 
    : [{ image_url: property.featured_image, is_primary: true, display_order: 0 }]

  const investmentPercentage = property.investment_slots 
    ? ((property.filled_slots || 0) / property.investment_slots) * 100 
    : 0

  return (
    <>
      <Header />
      <main className="pt-20 bg-gray-50">
        {/* Breadcrumb */}
        <div className="container mx-auto px-6 md:px-10 lg:px-20 max-w-[1440px] py-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-coral">Home</Link>
            <span>/</span>
            <Link href="/properties" className="hover:text-coral">Properties</Link>
            <span>/</span>
            <span className="text-gray-900">{property.title}</span>
          </div>
        </div>

        {/* Image Gallery */}
        <div className="bg-white">
          <div className="container mx-auto px-6 md:px-10 lg:px-20 max-w-[1440px] py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Main Image */}
              <div className="relative h-[400px] md:h-[500px] rounded-xl overflow-hidden">
                <Image
                  src={images[selectedImage]?.image_url || property.featured_image}
                  alt={property.title}
                  fill
                  className="object-cover"
                />
                {property.is_featured && (
                  <Badge className="absolute top-4 left-4 bg-amber-500 text-white">Featured</Badge>
                )}
                <Button
                  onClick={() => setSaved(!saved)}
                  variant="outline"
                  size="sm"
                  className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm"
                >
                  <Heart className={`w-4 h-4 ${saved ? 'fill-coral text-coral' : ''}`} />
                </Button>
              </div>

              {/* Thumbnail Grid */}
              <div className="grid grid-cols-2 gap-4">
                {images.slice(0, 4).map((img, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`relative h-[190px] md:h-[240px] rounded-xl overflow-hidden cursor-pointer ${
                      selectedImage === idx ? 'ring-2 ring-coral' : ''
                    }`}
                  >
                    <Image
                      src={img.image_url}
                      alt={`${property.title} - ${idx + 1}`}
                      fill
                      className="object-cover hover:scale-110 transition-transform duration-300"
                    />
                    {idx === 3 && images.length > 4 && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-semibold">
                        +{images.length - 4} more
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-6 md:px-10 lg:px-20 max-w-[1440px] py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Property Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Title and Rating */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h1 className="text-3xl font-bold text-gray-900 mb-2">{property.title}</h1>
                      <div className="flex items-center gap-4 text-gray-600">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span>{property.location}, {property.city}</span>
                        </div>
                        {property.average_rating && (
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                            <span className="font-semibold">{property.average_rating}/5</span>
                            <span className="text-sm">({property.total_reviews} reviews)</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Badge className="bg-green-100 text-green-700">{property.status}</Badge>
                    <Badge>{property.property_type}</Badge>
                    <Badge>{property.bhk_type}</Badge>
                    {property.furnishing_status && (
                      <Badge>{property.furnishing_status}</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Investment Summary */}
              {property.investment_type && (
                <Card className="bg-gradient-to-br from-coral/5 to-coral/10 border-coral/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-coral" />
                      Investment Opportunity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Investment Type</p>
                        <p className="text-lg font-bold text-gray-900 capitalize">
                          {property.investment_type?.replace('_', ' ')}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Expected ROI</p>
                        <p className="text-lg font-bold text-green-600">
                          {property.expected_roi_percentage}%
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Rental Yield</p>
                        <p className="text-lg font-bold text-blue-600">
                          {property.rental_yield_percentage}%
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Duration</p>
                        <p className="text-lg font-bold text-gray-900">
                          {property.investment_duration_months} months
                        </p>
                      </div>
                    </div>

                    {property.investment_slots && (
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-600">Investment Progress</span>
                          <span className="font-semibold text-gray-900">
                            {property.filled_slots || 0}/{property.investment_slots} slots filled
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-coral to-coral-dark h-full transition-all duration-500"
                            style={{ width: `${investmentPercentage}%` }}
                          />
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                      <div className="bg-white rounded-lg p-4">
                        <p className="text-xs text-gray-600 mb-1">Minimum Investment</p>
                        <p className="text-xl font-bold text-gray-900">
                          ₹{(property.minimum_investment! / 100000).toFixed(1)}L
                        </p>
                      </div>
                      <div className="bg-white rounded-lg p-4">
                        <p className="text-xs text-gray-600 mb-1">Est. Monthly Rental</p>
                        <p className="text-xl font-bold text-gray-900">
                          ₹{(property.estimated_monthly_rental! / 1000).toFixed(0)}K
                        </p>
                      </div>
                      <div className="bg-white rounded-lg p-4">
                        <p className="text-xs text-gray-600 mb-1">Appreciation Rate</p>
                        <p className="text-xl font-bold text-green-600">
                          {property.appreciation_rate}%/year
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Tabs */}
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="highlights">Highlights</TabsTrigger>
                  <TabsTrigger value="amenities">Amenities</TabsTrigger>
                  <TabsTrigger value="location">Location</TabsTrigger>
                  <TabsTrigger value="documents">Documents</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Property Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                        <div className="flex items-start gap-3">
                          <Home className="w-5 h-5 text-coral mt-1" />
                          <div>
                            <p className="text-sm text-gray-600">Property Type</p>
                            <p className="font-semibold text-gray-900">{property.property_type}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Bed className="w-5 h-5 text-coral mt-1" />
                          <div>
                            <p className="text-sm text-gray-600">Bedrooms</p>
                            <p className="font-semibold text-gray-900">{property.bedrooms}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Bath className="w-5 h-5 text-coral mt-1" />
                          <div>
                            <p className="text-sm text-gray-600">Bathrooms</p>
                            <p className="font-semibold text-gray-900">{property.bathrooms}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Square className="w-5 h-5 text-coral mt-1" />
                          <div>
                            <p className="text-sm text-gray-600">Built-up Area</p>
                            <p className="font-semibold text-gray-900">{property.area_sqft} sq ft</p>
                          </div>
                        </div>
                        {property.carpet_area_sqft && (
                          <div className="flex items-start gap-3">
                            <Maximize className="w-5 h-5 text-coral mt-1" />
                            <div>
                              <p className="text-sm text-gray-600">Carpet Area</p>
                              <p className="font-semibold text-gray-900">{property.carpet_area_sqft} sq ft</p>
                            </div>
                          </div>
                        )}
                        <div className="flex items-start gap-3">
                          <ParkingCircle className="w-5 h-5 text-coral mt-1" />
                          <div>
                            <p className="text-sm text-gray-600">Parking</p>
                            <p className="font-semibold text-gray-900">{property.parking_spaces || 0} Cars</p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 pt-6 border-t">
                        <h4 className="font-semibold text-gray-900 mb-3">Description</h4>
                        <p className="text-gray-600 leading-relaxed">{property.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="highlights">
                  <Card>
                    <CardHeader>
                      <CardTitle>Investment Highlights</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {property.investment_highlights?.map((highlight, idx) => (
                          <div key={idx} className="flex items-start gap-3">
                            <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                            <p className="text-gray-700">{highlight}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="amenities">
                  <Card>
                    <CardHeader>
                      <CardTitle>Amenities & Features</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {property.amenities?.map((amenity, idx) => (
                          <div key={idx} className="flex items-center gap-3">
                            <Check className="w-5 h-5 text-coral" />
                            <span className="text-gray-700">{amenity}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="location">
                  <Card>
                    <CardHeader>
                      <CardTitle>Location</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
                        <MapPin className="w-12 h-12 text-gray-400" />
                        <p className="ml-2 text-gray-500">Map integration here</p>
                      </div>
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <p className="font-semibold text-gray-900 mb-2">Address</p>
                        <p className="text-gray-700">{property.location}, {property.city}, {property.state}</p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="documents">
                  <Card>
                    <CardHeader>
                      <CardTitle>Documents & Resources</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {property.brochure_url && (
                          <a href={property.brochure_url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-4 border rounded-lg hover:border-coral transition-colors">
                            <div className="flex items-center gap-3">
                              <Download className="w-5 h-5 text-coral" />
                              <span className="font-medium">Download Brochure</span>
                            </div>
                            <ExternalLink className="w-4 h-4 text-gray-400" />
                          </a>
                        )}
                        {property.floor_plan_url && (
                          <a href={property.floor_plan_url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-4 border rounded-lg hover:border-coral transition-colors">
                            <div className="flex items-center gap-3">
                              <FileText className="w-5 h-5 text-coral" />
                              <span className="font-medium">Floor Plan</span>
                            </div>
                            <ExternalLink className="w-4 h-4 text-gray-400" />
                          </a>
                        )}
                        {property.layout_plan_url && (
                          <a href={property.layout_plan_url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-4 border rounded-lg hover:border-coral transition-colors">
                            <div className="flex items-center gap-3">
                              <FileText className="w-5 h-5 text-coral" />
                              <span className="font-medium">Layout Plan</span>
                            </div>
                            <ExternalLink className="w-4 h-4 text-gray-400" />
                          </a>
                        )}
                        {property.video_tour_url && (
                          <a href={property.video_tour_url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-4 border rounded-lg hover:border-coral transition-colors">
                            <div className="flex items-center gap-3">
                              <Video className="w-5 h-5 text-coral" />
                              <span className="font-medium">Video Tour</span>
                            </div>
                            <ExternalLink className="w-4 h-4 text-gray-400" />
                          </a>
                        )}
                      </div>

                      {property.rera_number && (
                        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-start gap-3">
                            <Shield className="w-5 h-5 text-green-600 mt-0.5" />
                            <div>
                              <p className="font-semibold text-gray-900 mb-1">RERA Registered</p>
                              <p className="text-sm text-gray-700">Registration No: {property.rera_number}</p>
                              <p className="text-xs text-gray-600 mt-1">Status: {property.legal_status}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              {/* Developer Info */}
              {property.developer_name && (
                <Card>
                  <CardHeader>
                    <CardTitle>About Developer</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-start gap-4">
                      {property.developer_logo && (
                        <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                          <Image src={property.developer_logo} alt={property.developer_name} width={80} height={80} className="object-contain" />
                        </div>
                      )}
                      <div className="flex-1">
                        <h4 className="text-xl font-bold text-gray-900 mb-2">{property.developer_name}</h4>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                          {property.years_of_experience && (
                            <div className="flex items-center gap-2">
                              <Building2 className="w-4 h-4 text-coral" />
                              <span>{property.years_of_experience}+ Years Experience</span>
                            </div>
                          )}
                          {property.total_projects && (
                            <div className="flex items-center gap-2">
                              <BarChart3 className="w-4 h-4 text-coral" />
                              <span>{property.total_projects}+ Total Projects</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Column - Investment Card */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-4">
                <Card className="border-2 border-coral/20">
                  <CardContent className="pt-6">
                    <div className="text-center mb-6">
                      <p className="text-sm text-gray-600 mb-1">Total Investment</p>
                      <p className="text-4xl font-bold text-gray-900">
                        ₹{(property.price / 100000).toFixed(2)}L
                      </p>
                      {property.minimum_investment && (
                        <p className="text-sm text-gray-600 mt-1">
                          Starting from ₹{(property.minimum_investment / 100000).toFixed(1)}L
                        </p>
                      )}
                    </div>

                    <div className="space-y-3">
                      <Button 
                        className="w-full" 
                        size="lg"
                        onClick={() => setShowInvestModal(true)}
                      >
                        <DollarSign className="w-5 h-5 mr-2" />
                        Invest Now
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full"
                        size="lg"
                        onClick={() => setShowScheduleModal(true)}
                      >
                        <Video className="w-5 h-5 mr-2" />
                        Schedule Live Tour
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full"
                        size="lg"
                        onClick={() => {
                          if (!user) {
                            toast.error('Please log in to download the brochure')
                            return
                          }
                          if (property?.brochure_url) {
                            window.open(property.brochure_url, '_blank')
                            toast.success('Opening brochure...')
                          } else {
                            toast.info('Brochure not available for this property')
                          }
                        }}
                      >
                        <Download className="w-5 h-5 mr-2" />
                        Download Brochure
                      </Button>
                    </div>

                    <div className="mt-6 pt-6 border-t space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Property ID</span>
                        <span className="font-semibold text-gray-900">{property.id.substring(0, 8)}</span>
                      </div>
                      {property.possession_date && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Possession</span>
                          <span className="font-semibold text-gray-900">{property.possession_date}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Posted</span>
                        <span className="font-semibold text-gray-900">
                          {formatDistanceToNow(new Date(property.created_at))} ago
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* AI Assistant */}
                <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">AI Assistant</h4>
                        <p className="text-xs text-gray-600">Ask me anything</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full relative"
                      onClick={handleAIChat}
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Chat with AI
                      {(!currentPlan || currentPlan.slug === 'free') && (
                        <span className="absolute -top-1 -right-1 flex h-5 w-5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-5 w-5 bg-purple-500 items-center justify-center text-[9px] text-white font-bold">PRO</span>
                        </span>
                      )}
                    </Button>
                  </CardContent>
                </Card>

                {/* Contact Agent */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Contact Agent</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Input placeholder="Your Name" />
                    <Input type="email" placeholder="Email" />
                    <Input type="tel" placeholder="Phone" />
                    <Button className="w-full">
                      <Mail className="w-4 h-4 mr-2" />
                      Request Callback
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />

      {/* AI Assistant Modal */}
      {showAIAssistant && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">AI Investment Advisor</h3>
                  <p className="text-sm text-gray-600">Powered by Advanced AI</p>
                </div>
              </div>
              <button
                onClick={() => setShowAIAssistant(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {aiMessages.map((message, idx) => (
                <div
                  key={idx}
                  className={`flex gap-3 ${
                    message.role === 'assistant' ? 'justify-start' : 'justify-end'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      message.role === 'assistant'
                        ? 'bg-gray-100 text-gray-900'
                        : 'bg-gradient-to-r from-coral to-coral-dark text-white'
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                  </div>
                  {message.role === 'user' && (
                    <div className="w-8 h-8 bg-gradient-to-br from-coral to-coral-dark rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              ))}
              {aiLoading && (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-gray-100 rounded-2xl px-4 py-3">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-6 border-t">
              <div className="flex gap-2">
                <Input
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                  placeholder="Ask about ROI, location, investment strategy..."
                  className="flex-1"
                  disabled={aiLoading}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!aiInput.trim() || aiLoading}
                  className="px-6"
                >
                  {aiLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    'Send'
                  )}
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                💡 Tip: Ask about returns, market analysis, or investment comparisons
              </p>
            </div>
          </motion.div>
        </div>
      )}

      {/* Invest Now Modal */}
      <InvestNowModal
        isOpen={showInvestModal}
        onClose={() => setShowInvestModal(false)}
        propertyId={property?.id || ''}
        propertyTitle={property?.title || ''}
        minInvestment={property?.minimum_investment}
      />

      {/* Live Tour Modal */}
      <LiveTourModal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        propertyTitle={property?.title || ''}
      />

      {/* Subscription Modal */}
      {showSubscriptionModal && (
        <SubscriptionPlansModal
          isOpen={showSubscriptionModal}
          onClose={() => setShowSubscriptionModal(false)}
          onSelectPlan={() => {
            setShowSubscriptionModal(false)
            toast.success('Subscription upgraded! You can now use AI Assistant.')
          }}
        />
      )}
    </>
  )
}
