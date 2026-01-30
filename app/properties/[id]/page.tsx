'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
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
  MessageSquare, Sparkles, BarChart3, PieChart, Home, Maximize, X, Plus
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
import { useCurrency } from '@/lib/contexts/CurrencyContext'
import { PropertyHighlights } from '@/components/property/PropertyHighlights'
import { AmenitiesGrid } from '@/components/property/AmenitiesGrid'
import { SpecificationsPanel } from '@/components/property/SpecificationsPanel'
import { RERASection } from '@/components/property/RERASection'
import { DeveloperProfile } from '@/components/property/DeveloperProfile'
import { NearbyPlacesMap } from '@/components/property/NearbyPlacesMap'
import { GroupBuyingSection } from '@/components/property/GroupBuyingSection'

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
  developer_id?: string
  developer_name?: string
  developer_logo?: string
  years_of_experience?: number
  total_projects?: number
  // Config
  configuration?: string
  discount_percentage?: number
  total_units?: number
  project_area?: string
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
  // Location coordinates
  latitude?: number
  longitude?: number
}

export default function PropertyDetailsPage({ params }: { params: { id: string } }) {
  const { user } = useAuth()
  const { currentPlan, usage } = useSubscription()
  const { formatPrice } = useCurrency()
  const [property, setProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [showInvestModal, setShowInvestModal] = useState(false)
  const [showAIAssistant, setShowAIAssistant] = useState(false)
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false)
  const [saved, setSaved] = useState(false)
  const [showAllImages, setShowAllImages] = useState(false)
  const [aiMessages, setAiMessages] = useState<Array<{ role: 'user' | 'assistant', content: string }>>([])
  const [aiInput, setAiInput] = useState('')
  const [aiLoading, setAiLoading] = useState(false)

  const [activeAgent, setActiveAgent] = useState('')

  // Sub-agents for simulation
  const agents = useMemo(() => [
    { name: 'Market Pulse', icon: TrendingUp, color: 'text-blue-500', bg: 'bg-blue-100' },
    { name: 'Deal Underwriter', icon: DollarSign, color: 'text-green-500', bg: 'bg-green-100' },
    { name: 'Developer Verification', icon: Building2, color: 'text-purple-500', bg: 'bg-purple-100' },
    { name: 'Legal Compliance', icon: Shield, color: 'text-red-500', bg: 'bg-red-100' },
    { name: 'Exit Optimizer', icon: PieChart, color: 'text-orange-500', bg: 'bg-orange-100' },
    { name: 'Committee Synthesizer', icon: Users, color: 'text-indigo-500', bg: 'bg-indigo-100' }
  ], [])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (aiLoading) {
      let index = 0
      setActiveAgent(agents[0].name)
      interval = setInterval(() => {
        index = (index + 1) % agents.length
        setActiveAgent(agents[index].name)
      }, 1200) // Change agent every 1.2s
    } else {
      setActiveAgent('')
    }
    return () => clearInterval(interval)
  }, [aiLoading, agents])

  // New state for TogetherBuying features
  const [highlights, setHighlights] = useState<any[]>([])
  const [amenities, setAmenities] = useState<any[]>([])
  const [specifications, setSpecifications] = useState<any[]>([])
  const [nearbyPlaces, setNearbyPlaces] = useState<any[]>([])
  const [reraInfo, setReraInfo] = useState<any>(null)
  const [developer, setDeveloper] = useState<any>(null)
  const [propertyGroup, setPropertyGroup] = useState<any>({ total_slots: 5, filled_slots: 0, is_locked: false })
  const [contentLoaded, setContentLoaded] = useState(false)

  // Combine featured image with property images, ensuring no duplicates
  const images = useMemo(() => {
    if (!property) return []
    const gallery = property.property_images || []
    const hasFeatured = gallery.some(img => img.image_url === property.featured_image)

    let combined = [...gallery]
    if (!hasFeatured && property.featured_image) {
      combined = [{
        image_url: property.featured_image,
        is_primary: true,
        display_order: -1
      }, ...combined]
    }

    return combined.sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
  }, [property])

  // Share property function
  const handleShare = async () => {
    const shareUrl = window.location.href
    const shareTitle = property?.title || 'Property'
    const shareText = `Check out this property: ${property?.title} in ${property?.location}, ${property?.city} - ${formatPrice(property?.price || 0)}`

    // Try native share API first (mobile)
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        })
        toast.success('Shared successfully!')
      } catch (error: any) {
        // User cancelled or error
        if (error.name !== 'AbortError') {
          // Fallback to clipboard
          copyToClipboard(shareUrl)
        }
      }
    } else {
      // Fallback: copy to clipboard
      copyToClipboard(shareUrl)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success('Link copied to clipboard!')
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = text
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      toast.success('Link copied to clipboard!')
    }
  }

  const fetchProperty = useCallback(async () => {
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
  }, [params.id])

  const fetchPropertyContent = useCallback(async () => {
    if (!property?.id || contentLoaded) return

    try {
      const supabase = getSupabaseClient()
      const propertyId = property.id

      // Fetch each table separately to handle missing tables gracefully
      try {
        const { data } = await supabase.from('property_highlights').select('*').eq('property_id', propertyId).order('display_order')
        setHighlights(data || [])
      } catch (e) { /* Table may not exist */ }

      try {
        const { data } = await supabase.from('property_amenities').select('*').eq('property_id', propertyId).order('display_order')
        setAmenities(data || [])
      } catch (e) { /* Table may not exist */ }

      try {
        const { data } = await supabase.from('property_specifications').select('*').eq('property_id', propertyId).order('category, display_order')
        setSpecifications(data || [])
      } catch (e) { /* Table may not exist */ }

      try {
        const { data } = await supabase.from('nearby_places').select('*').eq('property_id', propertyId)
        setNearbyPlaces(data || [])
      } catch (e) { /* Table may not exist */ }

      // Use .maybeSingle() instead of .single() to avoid 406 on no match
      try {
        const { data } = await supabase.from('property_rera_info').select('*').eq('property_id', propertyId).maybeSingle()
        setReraInfo(data)
      } catch (e) { /* Table may not exist */ }

      // Fetch developer if developer_id exists
      if (property?.developer_id) {
        try {
          const { data: devData } = await supabase
            .from('developers')
            .select('*')
            .eq('id', property.developer_id)
            .single()
          setDeveloper(devData)
        } catch (err) {
          /* Developers table may not exist */
        }
      }

      setContentLoaded(true)
    } catch (error) {
      console.error('Error fetching property content:', error)
      setContentLoaded(true)
    }
  }, [property, contentLoaded])

  const fetchGroup = useCallback(async () => {
    if (!property?.id) return
    try {
      const response = await fetch(`/api/properties/${property.id}/group`)
      if (!response.ok) {
        console.log('Group API returned error:', response.status)
        return
      }
      const data = await response.json()
      if (data.group) {
        setPropertyGroup(data.group)
      }
    } catch (error) {
      console.log('Error fetching group:', error)
    }
  }, [property?.id])

  useEffect(() => {
    fetchProperty()
  }, [fetchProperty])

  useEffect(() => {
    if (property?.id) {
      fetchPropertyContent()
      fetchGroup()
    }
  }, [property?.id, fetchPropertyContent, fetchGroup])

  const handleAIChat = () => {
    if (!user) {
      toast.error('Please login to use AI Assistant')
      return
    }

    // Subscription check disabled for now - allowing all logged in users
    // if (!['pro', 'enterprise'].includes(currentPlan)) {
    //   setShowSubscriptionModal(true)
    //   return
    // }

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

  // Combine featured image with property images, ensuring no duplicates
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
          <div className="container mx-auto px-4 md:px-10 lg:px-20 max-w-[1440px] py-4 md:py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              {/* Main Image */}
              <div className="relative h-[300px] sm:h-[400px] md:h-[500px] rounded-2xl overflow-hidden shadow-xl group">
                <Image
                  src={images[selectedImage]?.image_url || property.featured_image}
                  alt={property.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                {property.is_featured && (
                  <Badge className="absolute top-4 left-4 bg-amber-500/90 backdrop-blur-md text-white border-none px-3 py-1 font-bold">
                    <Sparkles className="w-3 h-3 mr-1" /> Featured
                  </Badge>
                )}

                {/* Mobile Image Counter indicator */}
                <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold md:hidden">
                  {selectedImage + 1} / {images.length}
                </div>
              </div>

              {/* Thumbnail Grid - Hidden on small mobile in favor of slider behavior maybe? No, let's keep it but improve it. */}
              <div className="hidden md:grid grid-cols-2 gap-4">
                {images.slice(0, 4).map((img, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`relative h-[240px] rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 ${selectedImage === idx ? 'ring-4 ring-coral ring-offset-2' : 'hover:opacity-90'
                      }`}
                  >
                    <Image
                      src={img.image_url}
                      alt={`${property.title} - ${idx + 1}`}
                      fill
                      className="object-cover transition-transform duration-500 hover:scale-110"
                    />
                    {idx === 3 && images.length > 4 && (
                      <div
                        onClick={(e) => {
                          e.stopPropagation()
                          setShowAllImages(true)
                        }}
                        className="absolute inset-0 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center text-white font-bold hover:bg-black/70 transition-all border-2 border-dashed border-white/30 rounded-2xl"
                      >
                        <span className="text-2xl">+{images.length - 4}</span>
                        <span className="text-xs uppercase tracking-widest">More Photos</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Mobile Thumbnails Scroll */}
              <div className="flex md:hidden gap-2 overflow-x-auto pb-2 custom-scrollbar no-scrollbar">
                {images.map((img, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden transition-all ${selectedImage === idx ? 'ring-2 ring-coral' : 'opacity-60'
                      }`}
                  >
                    <Image
                      src={img.image_url}
                      alt={`${property.title} thumbnail`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
                {images.length > 5 && (
                  <button
                    onClick={() => setShowAllImages(true)}
                    className="flex-shrink-0 w-20 h-20 bg-gray-100 rounded-xl flex items-center justify-center text-coral"
                  >
                    <Plus className="w-6 h-6" />
                  </button>
                )}
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
                    <Button variant="outline" size="sm" onClick={handleShare}>
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
                          {formatPrice(property.minimum_investment!)}
                        </p>
                      </div>
                      <div className="bg-white rounded-lg p-4">
                        <p className="text-xs text-gray-600 mb-1">Est. Monthly Rental</p>
                        <p className="text-xl font-bold text-gray-900">
                          {formatPrice(property.estimated_monthly_rental!)}
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
              <div className="relative">
                <Tabs defaultValue="overview" className="w-full">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-1 mb-6 sticky top-20 z-20 overflow-x-auto no-scrollbar">
                    <TabsList className="bg-transparent h-auto p-0 flex lg:grid lg:grid-cols-6 min-w-max lg:min-w-0">
                      <TabsTrigger value="overview" className="flex-1 py-3 px-6 rounded-lg data-[state=active]:bg-coral data-[state=active]:text-white transition-all whitespace-nowrap">Overview</TabsTrigger>
                      <TabsTrigger value="highlights" className="flex-1 py-3 px-6 rounded-lg data-[state=active]:bg-coral data-[state=active]:text-white transition-all whitespace-nowrap">Highlights</TabsTrigger>
                      <TabsTrigger value="amenities" className="flex-1 py-3 px-6 rounded-lg data-[state=active]:bg-coral data-[state=active]:text-white transition-all whitespace-nowrap">Amenities</TabsTrigger>
                      <TabsTrigger value="specifications" className="flex-1 py-3 px-6 rounded-lg data-[state=active]:bg-coral data-[state=active]:text-white transition-all whitespace-nowrap">Specs</TabsTrigger>
                      <TabsTrigger value="location" className="flex-1 py-3 px-6 rounded-lg data-[state=active]:bg-coral data-[state=active]:text-white transition-all whitespace-nowrap">Location</TabsTrigger>
                      <TabsTrigger value="documents" className="flex-1 py-3 px-6 rounded-lg data-[state=active]:bg-coral data-[state=active]:text-white transition-all whitespace-nowrap">Docs</TabsTrigger>
                    </TabsList>
                  </div>

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
                    {highlights.length > 0 ? (
                      <PropertyHighlights highlights={highlights} />
                    ) : (
                      <Card>
                        <CardContent className="pt-6">
                          <p className="text-center text-gray-500">No highlights available for this property.</p>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>

                  <TabsContent value="amenities">
                    {amenities.length > 0 ? (
                      <AmenitiesGrid amenities={amenities} />
                    ) : (
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
                    )}
                  </TabsContent>

                  <TabsContent value="specifications">
                    {specifications.length > 0 ? (
                      <SpecificationsPanel specifications={specifications} />
                    ) : (
                      <Card>
                        <CardContent className="pt-6">
                          <p className="text-center text-gray-500">No specifications available for this property.</p>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>

                  <TabsContent value="location">
                    {nearbyPlaces.length > 0 ? (
                      <NearbyPlacesMap
                        nearbyPlaces={nearbyPlaces}
                        propertyLocation={property.location}
                        propertyCity={property.city}
                        latitude={property.latitude}
                        longitude={property.longitude}
                      />
                    ) : (
                      <Card>
                        <CardHeader>
                          <CardTitle>Location</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden">
                            <iframe
                              width="100%"
                              height="100%"
                              style={{ border: 0 }}
                              loading="lazy"
                              allowFullScreen
                              referrerPolicy="no-referrer-when-downgrade"
                              src={
                                property.latitude && property.longitude
                                  ? `https://maps.google.com/maps?q=${property.latitude},${property.longitude}&t=&z=15&ie=UTF8&iwloc=&output=embed`
                                  : `https://maps.google.com/maps?q=${encodeURIComponent(`${property.location}, ${property.city}, ${property.state}, India`)}&t=&z=15&ie=UTF8&iwloc=&output=embed`
                              }
                            />
                          </div>
                          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                            <p className="font-semibold text-gray-900 mb-2">Address</p>
                            <p className="text-gray-700">{property.location}, {property.city}, {property.state}</p>
                          </div>
                        </CardContent>
                      </Card>
                    )}
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
              </div>

              {/* RERA Section */}
              <RERASection reraInfo={reraInfo} reraNumber={property.rera_number} />

              {/* Developer Profile */}
              <DeveloperProfile
                developer={developer}
                developerName={property.developer_name}
                developerLogo={property.developer_logo}
                yearsOfExperience={property.years_of_experience}
                totalProjects={property.total_projects}
              />
            </div>

            {/* Right Column - Investment Card */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-4">
                <Card className="border-2 border-coral/20">
                  <CardContent className="pt-6">
                    <div className="text-center mb-6">
                      <p className="text-sm text-gray-600 mb-1">Total Investment</p>
                      <p className="text-4xl font-bold text-gray-900">
                        {formatPrice(property.price)}
                      </p>
                      {property.minimum_investment && (
                        <p className="text-sm text-gray-600 mt-1">
                          Starting from {formatPrice(property.minimum_investment)}
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

                {/* Group Buying */}
                <GroupBuyingSection
                  propertyId={property.id}
                  group={propertyGroup}
                  onJoinSuccess={fetchGroup}
                />

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
                    </Button>
                  </CardContent>
                </Card>

                {/* Contact Agent */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Contact Agent</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={async (e) => {
                      e.preventDefault()
                      // @ts-ignore
                      const formData = new FormData(e.target)
                      const data = {
                        name: formData.get('name'),
                        email: formData.get('email'),
                        phone: formData.get('phone'),
                        message: "I am interested in this property",
                        propertyId: property.id
                      }

                      try {
                        const loadingToast = toast.loading('Sending your enquiry...')
                        const res = await fetch('/api/enquiries', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify(data)
                        })
                        toast.dismiss(loadingToast)

                        if (res.ok) {
                          toast.success('Callback requested successfully!')
                          // @ts-ignore
                          e.target.reset()
                        } else {
                          const err = await res.json()
                          toast.error(err.error || 'Failed to request callback')
                        }
                      } catch (error) {
                        toast.error('Something went wrong')
                      }
                    }} className="space-y-3">
                      <Input name="name" placeholder="Your Name" required />
                      <Input name="email" type="email" placeholder="Email" required />
                      <Input name="phone" type="tel" placeholder="Phone" required />
                      <Button type="submit" className="w-full">
                        <Mail className="w-4 h-4 mr-2" />
                        Request Callback
                      </Button>
                    </form>
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
                  className={`flex gap-3 ${message.role === 'assistant' ? 'justify-start' : 'justify-end'
                    }`}
                >
                  {message.role === 'assistant' && (
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${message.role === 'assistant'
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
                <div className="flex flex-col gap-2 animate-pulse">
                  <div className="flex gap-3 justify-start items-center">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    {/* Dynamic Agent Status */}
                    <div className="bg-gray-50 rounded-2xl px-4 py-3 border border-gray-100 shadow-sm">
                      {activeAgent && (
                        <div className="flex items-center gap-3">
                          {(() => {
                            const agent = agents.find(a => a.name === activeAgent)
                            if (!agent) return null
                            const Icon = agent.icon
                            return (
                              <div className={`p-1.5 rounded-full ${agent.bg}`}>
                                <Icon className={`w-4 h-4 ${agent.color}`} />
                              </div>
                            )
                          })()}
                          <span className="text-sm font-medium text-gray-700">
                            {activeAgent} is analyzing...
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Progress Line */}
                  <div className="pl-12 pr-4">
                    <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 w-1/3 animate-progress"></div>
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

      {/* Subscription Modal Removed */}

      {/* Full Gallery Modal */}
      <AnimatePresence>
        {showAllImages && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex flex-col pt-20 md:pt-4"
          >
            <div className="flex items-center justify-between p-4 md:p-6 text-white border-b border-white/10">
              <div className="flex flex-col">
                <span className="font-bold text-lg md:text-xl">{property?.title}</span>
                <span className="text-sm text-gray-400">{images.length} Photos</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAllImages(false)}
                className="text-white hover:bg-white/10 h-10 w-10 p-0 rounded-full"
              >
                <X className="w-6 h-6" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-8">
              <div className="container mx-auto max-w-7xl">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {images.map((img, idx) => (
                    <div
                      key={idx}
                      className={`relative aspect-[4/3] rounded-xl overflow-hidden cursor-pointer group hover:ring-2 hover:ring-coral transition-all duration-300 ${selectedImage === idx ? 'ring-2 ring-coral' : ''
                        }`}
                      onClick={() => {
                        setSelectedImage(idx)
                        setShowAllImages(false)
                      }}
                    >
                      <Image
                        src={img.image_url}
                        alt={`${property?.title} - ${idx + 1}`}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute bottom-2 right-2 bg-black/50 backdrop-blur-md text-white text-[10px] px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                        View Photo
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sticky Bottom Actions for Mobile */}
      <div className="fixed bottom-0 left-0 right-0 z-[40] md:hidden">
        <div className="bg-white border-t border-gray-100 p-4 flex items-center gap-3 shadow-[0_-10px_30px_rgba(0,0,0,0.08)]">
          <div className="flex-1">
            <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest leading-none mb-1">Total Price</p>
            <p className="text-xl font-black text-charcoal">{formatPrice(property.price)}</p>
          </div>
          <Button
            className="flex-1 h-12 bg-coral hover:bg-coral-dark text-white rounded-xl font-bold shadow-lg shadow-coral/20"
            onClick={() => setShowInvestModal(true)}
          >
            Invest Now
          </Button>
          <Button
            variant="outline"
            className="w-12 h-12 p-0 flex items-center justify-center rounded-xl border-gray-200"
            onClick={() => setShowScheduleModal(true)}
          >
            <Video className="w-5 h-5 text-gray-600" />
          </Button>
        </div>
      </div>
    </>
  )
}
