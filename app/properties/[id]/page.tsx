"use client"

import { useState, useEffect } from 'react'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { 
  MapPin, 
  Bed, 
  Bath, 
  Square, 
  Home,
  Calendar,
  ParkingCircle,
  Layers,
  Maximize,
  Building2,
  Trees,
  Check,
  Mail,
  Phone,
  User,
  ChevronLeft,
  ChevronRight,
  Share2,
  Heart,
  Printer,
  Sparkles,
  Lock,
  TrendingUp,
  DollarSign,
  Building2 as BuildingIcon,
  Scale,
  LogOut,
  Users,
  Loader2,
  Plus,
} from 'lucide-react'
import { getSupabaseClient } from '@/lib/supabase/client'
import { formatDistanceToNow } from 'date-fns'
import { useSubscription } from '@/lib/hooks/useSubscription'
import { SubscriptionPlansModal } from '@/components/subscription/SubscriptionPlansModal'

interface Property {
  id: string
  title: string
  description: string
  price: number
  original_price?: number
  location: string
  city: string
  state: string
  zip_code: string
  bhk_type: string
  bedrooms: number
  bathrooms: number
  size_sqft: number
  area_sqft: number | null
  age_years: number | null
  floor_number: number | null
  total_floors: number | null
  property_type: string
  status: string
  is_featured: boolean
  parking_spaces: number | null
  lot_width: number | null
  lot_depth: number | null
  latitude: number | null
  longitude: number | null
  amenities: string[] | null
  additional_rooms: string[] | null
  facing: string | null
  furnishing_status: string | null
  created_at: string
  property_images: { image_url: string; is_primary: boolean; display_order: number }[]
}

export default function PropertyDetailsPage({ params }: { params: { id: string } }) {
  const [property, setProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: 'I am interested in this property. Please contact me with more details.',
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [showPlansModal, setShowPlansModal] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<any>(null)
  
  const { currentPlan, usage, addPropertyToComparison } = useSubscription()

  useEffect(() => {
    fetchProperty()
  }, [params.id])

  async function fetchProperty() {
    try {
      setLoading(true)
      const supabase = getSupabaseClient()
      
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          property_images(image_url, is_primary, display_order)
        `)
        .eq('id', params.id)
        .single()

      if (error) throw error

      // Sort images by display_order
      // @ts-ignore
      if (data.property_images) {
        // @ts-ignore
        data.property_images.sort((a: any, b: any) => a.display_order - b.display_order)
      }

      setProperty(data)
    } catch (error) {
      console.error('Error fetching property:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmitEnquiry(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)

    try {
      const supabase = getSupabaseClient()
      
      const { error } = await supabase.from('enquiries')
        // @ts-ignore
        .insert({
        property_id: params.id,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        message: formData.message,
        status: 'new',
      })

      if (error) throw error

      setSubmitSuccess(true)
      setFormData({ name: '', email: '', phone: '', message: '' })
      
      setTimeout(() => setSubmitSuccess(false), 5000)
    } catch (error) {
      console.error('Error submitting enquiry:', error)
      alert('Failed to submit enquiry. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleAnalyzeProperty() {
    if (!currentPlan || !usage) return

    // Check if user needs to upgrade
    if (!usage.can_analyze) {
      setShowPlansModal(true)
      return
    }

    try {
      setAnalyzing(true)

      // Determine which agents to use based on plan
      let agentSlugs: string[] = []
      if (currentPlan.slug === 'ai_basic') {
        agentSlugs = ['market_pulse', 'deal_underwriter']
      } else if (currentPlan.slug === 'ai_pro' || currentPlan.slug === 'ai_enterprise') {
        agentSlugs = ['market_pulse', 'deal_underwriter', 'developer_verification', 'legal_regulatory', 'exit_optimizer', 'committee_synthesizer']
      }

      const response = await fetch('/api/ai/analyze-property', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: property?.id,
          agentSlugs
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Analysis failed')
      }

      const data = await response.json()
      setAnalysis(data.analysis)
    } catch (error) {
      console.error('Analysis error:', error)
      alert(error instanceof Error ? error.message : 'Failed to analyze property')
    } finally {
      setAnalyzing(false)
    }
  }

  async function handleAddToComparison() {
    if (!property) return

    if (!usage?.can_add_property) {
      setShowPlansModal(true)
      return
    }

    const success = await addPropertyToComparison(property.id)
    if (success) {
      alert('Property added to comparison list!')
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  const features = property ? [
    { label: 'Bedrooms', value: property.bedrooms, icon: Bed },
    { label: 'Bathrooms', value: property.bathrooms, icon: Bath },
    { label: 'Size', value: `${property.size_sqft} Sqft`, icon: Square },
    { label: 'Kitchen', value: '1', icon: Home },
    { label: 'Age', value: property.age_years ? `${property.age_years} years` : 'N/A', icon: Calendar },
    { label: 'Garage', value: property.parking_spaces || '0', icon: ParkingCircle },
    { label: 'Floor', value: property.floor_number || 'N/A', icon: Layers },
    { label: 'Type', value: property.property_type, icon: Building2 },
    { label: 'Garden', value: property.amenities?.includes('Garden') ? 'Yes' : 'No', icon: Trees },
  ] : []

  const amenitiesList = [
    'Air Conditioning',
    'Swimming Pool',
    'Central Heating',
    'Laundry Room',
    'Gym',
    'Alarm',
    'Window Covering',
    'WiFi',
    'Pets Allow',
    'Home Theater',
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coral"></div>
        </div>
        <Footer />
      </div>
    )
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="container mx-auto px-6 py-20 text-center">
          <h1 className="text-3xl font-bold text-charcoal mb-4">Property Not Found</h1>
          <p className="text-gray-600 mb-8">The property you're looking for doesn't exist or has been removed.</p>
          <Link href="/properties">
            <Button>Back to Properties</Button>
          </Link>
        </div>
        <Footer />
      </div>
    )
  }

  const images = property.property_images?.length > 0 
    ? property.property_images.map(img => img.image_url)
    : ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80']

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="container mx-auto px-6 md:px-10 lg:px-20 max-w-[1440px] py-12">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-8">
          <Link href="/" className="hover:text-coral">Home</Link>
          <span>/</span>
          <Link href="/properties" className="hover:text-coral">Properties</Link>
          <span>/</span>
          <span className="text-charcoal font-medium">{property.title}</span>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Images */}
          <div className="lg:col-span-2">
            {/* Main Image */}
            <div className="relative h-[500px] rounded-2xl overflow-hidden mb-4 group">
              <Image
                src={images[selectedImage]}
                alt={property.title}
                fill
                className="object-cover"
                priority
              />
              
              {/* Image Navigation */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImage(prev => prev === 0 ? images.length - 1 : prev - 1)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-all opacity-0 group-hover:opacity-100"
                  >
                    <ChevronLeft className="w-6 h-6 text-charcoal" />
                  </button>
                  <button
                    onClick={() => setSelectedImage(prev => prev === images.length - 1 ? 0 : prev + 1)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-all opacity-0 group-hover:opacity-100"
                  >
                    <ChevronRight className="w-6 h-6 text-charcoal" />
                  </button>
                </>
              )}

              {/* Action Buttons */}
              <div className="absolute top-4 right-4 flex gap-2">
                <button className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors">
                  <Share2 className="w-5 h-5 text-charcoal" />
                </button>
                <button className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors">
                  <Heart className="w-5 h-5 text-charcoal hover:text-coral" />
                </button>
                <button className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors">
                  <Printer className="w-5 h-5 text-charcoal" />
                </button>
              </div>

              {/* Status Badge */}
              <div className="absolute bottom-4 left-4">
                <Badge className={`text-sm px-4 py-2 ${
                  property.status === 'available' ? 'bg-green-500' :
                  property.status === 'sold' ? 'bg-red-500' : 'bg-blue-500'
                }`}>
                  {property.status === 'available' ? 'For Sale' : property.status.charAt(0).toUpperCase() + property.status.slice(1)}
                </Badge>
              </div>
            </div>

            {/* Thumbnail Images */}
            {images.length > 1 && (
              <div className="grid grid-cols-5 gap-2 mb-8">
                {images.slice(0, 5).map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`relative h-24 rounded-lg overflow-hidden ${
                      selectedImage === idx ? 'ring-4 ring-coral' : 'ring-2 ring-gray-200'
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`Property ${idx + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Description */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-charcoal mb-4">Description</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {property.description}
              </p>
            </div>

            {/* Address Section */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-8">
              <h2 className="text-2xl font-bold text-charcoal mb-6">Address</h2>
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Address</p>
                  <p className="text-charcoal font-medium">{property.location}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Zip/Postal Code</p>
                  <p className="text-charcoal font-medium">{property.zip_code || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">City</p>
                  <p className="text-charcoal font-medium">{property.city}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Area</p>
                  <p className="text-charcoal font-medium">{property.state || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">State/County</p>
                  <p className="text-charcoal font-medium">{property.state || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Country</p>
                  <p className="text-charcoal font-medium">India</p>
                </div>
              </div>

              {property.latitude && property.longitude && (
                <>
                  <Button className="w-full md:w-auto mb-4">
                    <MapPin className="mr-2 h-4 w-4" />
                    VIEW LOCATION
                  </Button>
                  
                  {/* Map Placeholder */}
                  <div className="relative h-64 bg-gray-100 rounded-lg overflow-hidden">
                    <iframe
                      src={`https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=${property.latitude},${property.longitude}`}
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      className="grayscale"
                    />
                  </div>
                </>
              )}
            </div>

            {/* Details Section */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-8">
              <h2 className="text-2xl font-bold text-charcoal mb-6">Details</h2>
              <div className="grid md:grid-cols-2 gap-x-12 gap-y-6">
                <div className="flex justify-between py-3 border-b border-gray-200">
                  <span className="text-gray-600">Property ID</span>
                  <span className="text-charcoal font-semibold">{property.id.slice(0, 8).toUpperCase()}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-gray-200">
                  <span className="text-gray-600">Rooms</span>
                  <span className="text-charcoal font-semibold">{property.bedrooms + 1}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-gray-200">
                  <span className="text-gray-600">Price</span>
                  <span className="text-charcoal font-semibold">{formatPrice(property.price)}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-gray-200">
                  <span className="text-gray-600">Year Built</span>
                  <span className="text-charcoal font-semibold">
                    {property.age_years ? new Date().getFullYear() - property.age_years : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between py-3 border-b border-gray-200">
                  <span className="text-gray-600">Property Size</span>
                  <span className="text-charcoal font-semibold">{property.size_sqft} Sqft</span>
                </div>
                <div className="flex justify-between py-3 border-b border-gray-200">
                  <span className="text-gray-600">Lot Dimensions</span>
                  <span className="text-charcoal font-semibold">
                    {property.lot_width && property.lot_depth 
                      ? `${property.lot_width} × ${property.lot_depth}` 
                      : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between py-3 border-b border-gray-200">
                  <span className="text-gray-600">Bedrooms</span>
                  <span className="text-charcoal font-semibold">{property.bedrooms}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-gray-200">
                  <span className="text-gray-600">Amenities</span>
                  <span className="text-charcoal font-semibold">{property.amenities?.length || 0}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-gray-200">
                  <span className="text-gray-600">Bathrooms</span>
                  <span className="text-charcoal font-semibold">{property.bathrooms}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-gray-200">
                  <span className="text-gray-600">Additional Rooms</span>
                  <span className="text-charcoal font-semibold capitalize">{property.additional_rooms?.join(', ') || 'None'}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-gray-200">
                  <span className="text-gray-600">Garage</span>
                  <span className="text-charcoal font-semibold">{property.parking_spaces || 0}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-gray-200">
                  <span className="text-gray-600">Equipment</span>
                  <span className="text-charcoal font-semibold">{property.furnishing_status || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-gray-200">
                  <span className="text-gray-600">Floor</span>
                  <span className="text-charcoal font-semibold">
                    {property.floor_number ? `${property.floor_number}/${property.total_floors || 'N/A'}` : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between py-3 border-b border-gray-200">
                  <span className="text-gray-600">Property Type</span>
                  <span className="text-charcoal font-semibold capitalize">{property.property_type}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-gray-200">
                  <span className="text-gray-600">Property Status</span>
                  <span className="text-charcoal font-semibold capitalize">{property.status}</span>
                </div>
              </div>
            </div>

            {/* Features/Problems Section */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-8">
              <h2 className="text-2xl font-bold text-charcoal mb-6">Features</h2>
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                {amenitiesList.map((amenity, idx) => {
                  const hasAmenity = property.amenities?.some(a => 
                    a.toLowerCase().includes(amenity.toLowerCase())
                  ) || false

                  return (
                    <div key={idx} className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded flex items-center justify-center ${
                        hasAmenity ? 'bg-coral text-white' : 'bg-gray-200'
                      }`}>
                        {hasAmenity && <Check className="w-3 h-3" />}
                      </div>
                      <span className={hasAmenity ? 'text-charcoal' : 'text-gray-400'}>
                        {amenity}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* AI Analysis Section */}
            <div className="bg-gradient-to-br from-purple-50 via-blue-50 to-purple-50 border-2 border-purple-200 rounded-2xl p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-charcoal">AI Property Analysis</h2>
                    <p className="text-sm text-gray-600">Get expert insights powered by AI</p>
                  </div>
                </div>
                {usage && (
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Usage</p>
                    <p className="text-sm font-semibold text-purple-600">
                      {usage.analyses_limit === 0 
                        ? 'Unlimited' 
                        : `${usage.analyses_used}/${usage.analyses_limit}`}
                    </p>
                  </div>
                )}
              </div>

              {!currentPlan || currentPlan.slug === 'free' ? (
                /* Locked State - Free Users */
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4">
                    <Lock className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-bold text-charcoal mb-2">
                    Unlock AI-Powered Insights
                  </h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Get comprehensive property analysis from 6 specialized AI agents covering market trends, financial viability, legal compliance, and more.
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                    {[
                      { icon: TrendingUp, label: 'Market Pulse', color: 'text-blue-600' },
                      { icon: DollarSign, label: 'Deal Analysis', color: 'text-green-600' },
                      { icon: BuildingIcon, label: 'Developer Check', color: 'text-orange-600' },
                      { icon: Scale, label: 'Legal Review', color: 'text-red-600' },
                      { icon: LogOut, label: 'Exit Strategy', color: 'text-purple-600' },
                      { icon: Users, label: 'Final Verdict', color: 'text-indigo-600' },
                    ].map((agent, idx) => (
                      <div key={idx} className="bg-white rounded-lg p-3 border border-gray-200">
                        <agent.icon className={`w-5 h-5 ${agent.color} mx-auto mb-1`} />
                        <p className="text-xs text-gray-600">{agent.label}</p>
                      </div>
                    ))}
                  </div>
                  <Button
                    onClick={() => setShowPlansModal(true)}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
                  >
                    Unlock AI Features
                  </Button>
                </div>
              ) : (
                /* Unlocked State - Subscribed Users */
                <div>
                  {!analysis ? (
                    <div className="space-y-4">
                      <p className="text-gray-700">
                        Analyze this property with our AI agents to get expert insights on market trends, financial viability, developer credibility, legal compliance, and exit strategies.
                      </p>
                      <div className="flex gap-3">
                        <Button
                          onClick={handleAnalyzeProperty}
                          disabled={analyzing || !usage?.can_analyze}
                          className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
                        >
                          {analyzing ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Analyzing...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-4 h-4 mr-2" />
                              Analyze with AI
                            </>
                          )}
                        </Button>
                        <Button
                          onClick={handleAddToComparison}
                          disabled={!usage?.can_add_property}
                          className="bg-white border-2 border-purple-600 text-purple-600 hover:bg-purple-50"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add to Assistant
                        </Button>
                      </div>
                    </div>
                  ) : (
                    /* Analysis Results */
                    <div className="space-y-4">
                      <div className="flex items-center justify-between bg-white rounded-lg p-4 border border-gray-200">
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Overall Score</p>
                          <p className="text-3xl font-bold text-purple-600">
                            {analysis.overall_score}/100
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600 mb-1">Recommendation</p>
                          <Badge className={`
                            ${analysis.recommendation === 'STRONG_BUY' ? 'bg-green-500' : ''}
                            ${analysis.recommendation === 'BUY' ? 'bg-blue-500' : ''}
                            ${analysis.recommendation === 'HOLD' ? 'bg-yellow-500' : ''}
                            ${analysis.recommendation === 'AVOID' ? 'bg-red-500' : ''}
                          `}>
                            {analysis.recommendation}
                          </Badge>
                        </div>
                      </div>

                      {/* Agent Analyses */}
                      <div className="grid gap-3">
                        {Object.entries(analysis).filter(([key]) => 
                          ['market_pulse', 'deal_underwriter', 'developer_verification', 'legal_regulatory', 'exit_optimizer', 'committee_synthesizer'].includes(key)
                        ).map(([agentSlug, result]: [string, any]) => (
                          <details key={agentSlug} className="bg-white rounded-lg border border-gray-200">
                            <summary className="cursor-pointer p-4 font-semibold text-charcoal hover:bg-gray-50">
                              {result.agentName || agentSlug}
                            </summary>
                            <div className="px-4 pb-4 text-sm text-gray-700 whitespace-pre-wrap">
                              {result.analysis || 'No analysis available'}
                            </div>
                          </details>
                        ))}
                      </div>

                      <Button
                        onClick={handleAddToComparison}
                        disabled={!usage?.can_add_property}
                        className="w-full bg-white border-2 border-purple-600 text-purple-600 hover:bg-purple-50"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add to Comparison
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Concierge Service */}
            <div className="bg-gradient-to-r from-charcoal to-gray-800 rounded-2xl p-8 text-white">
              <h2 className="text-2xl font-bold mb-2">Concierge Service</h2>
              <p className="text-gray-300 mb-6">
                Discover a world where your needs are anticipated, and your desires are fulfilled with precision and care.
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                <Input
                  placeholder="Your Name Property"
                  className="bg-white text-charcoal"
                />
                <Input
                  placeholder="Your email address"
                  type="email"
                  className="bg-white text-charcoal"
                />
              </div>
              <Button className="mt-4 bg-coral hover:bg-coral-dark text-white">
                Contact Now
              </Button>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="lg:col-span-1">
            {/* Price and Overview Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-gray-200 rounded-2xl p-6 sticky top-24 mb-8"
            >
              <h1 className="text-2xl font-bold text-charcoal mb-4">
                {property.title}
              </h1>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-bold text-coral">
                    {formatPrice(property.price)}
                  </span>
                  {property.original_price && property.original_price > property.price && (
                    <span className="text-xl text-gray-400 line-through">
                      {formatPrice(property.original_price)}
                    </span>
                  )}
                </div>
              </div>

              {/* Overview */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-4">Overview</h3>
                <div className="grid grid-cols-3 gap-4">
                  {features.slice(0, 9).map((feature, idx) => (
                    <div key={idx} className="text-center">
                      <feature.icon className="w-6 h-6 text-coral mx-auto mb-2" />
                      <p className="text-xs text-gray-500 mb-1">{feature.label}</p>
                      <p className="text-sm font-semibold text-charcoal">{feature.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contact Form */}
              <form onSubmit={handleSubmitEnquiry} className="space-y-4">
                <Input
                  placeholder="Your Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  icon={<User className="w-5 h-5" />}
                />
                <Input
                  placeholder="Your Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  icon={<Mail className="w-5 h-5" />}
                />
                <Input
                  placeholder="Your Phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                  icon={<Phone className="w-5 h-5" />}
                />
                <textarea
                  placeholder="Message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coral focus:border-transparent"
                  required
                />
                <Button
                  type="submit"
                  className="w-full"
                  disabled={submitting}
                >
                  {submitting ? 'Sending...' : 'Send Message'}
                </Button>
                {submitSuccess && (
                  <p className="text-sm text-green-600 text-center">
                    ✓ Message sent successfully! We'll contact you soon.
                  </p>
                )}
              </form>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
      
      {/* Subscription Plans Modal */}
      <SubscriptionPlansModal
        isOpen={showPlansModal}
        onClose={() => setShowPlansModal(false)}
        onSelectPlan={(slug) => {
          console.log('Selected plan:', slug)
          // Payment flow will be handled by the modal
        }}
      />
    </div>
  )
}
