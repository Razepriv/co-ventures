// @ts-nocheck
"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/auth/AuthProvider'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { ArrowLeft, Upload, X, Save, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

interface Category {
  id: string
  name: string
}

export default function NewPropertyPage() {
  const router = useRouter()
  const { profile } = useAuth()
  const [categories, setCategories] = useState<Category[]>([])
  const [developers, setDevelopers] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [uploadingImages, setUploadingImages] = useState(false)
  const [images, setImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [featuredImageFile, setFeaturedImageFile] = useState<File | null>(null)
  const [featuredImagePreview, setFeaturedImagePreview] = useState<string | null>(null)
  const [availableCities, setAvailableCities] = useState<any[]>([])
  const [states, setStates] = useState<string[]>([])
  const [filteredCities, setFilteredCities] = useState<string[]>([])
  const [isLookingUpPincode, setIsLookingUpPincode] = useState(false)

  // Document upload states
  const [uploadingDocs, setUploadingDocs] = useState({
    brochure: false,
    floorPlan: false,
    layoutPlan: false,
    developerLogo: false
  })

  // Tab navigation
  const tabs = ['basic', 'investment', 'location', 'details', 'legal', 'images']
  const [activeTab, setActiveTab] = useState('basic')

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category_id: '',
    property_type: 'apartment',
    bhk_type: '2BHK',
    bedrooms: 2,
    bathrooms: 2,
    size_sqft: '',
    price: '',
    location: '',
    city: 'Bangalore',
    state: 'Karnataka',
    pincode: '',
    address: '',
    latitude: '',
    longitude: '',
    status: 'available',
    is_featured: false,
    amenities: '',
    parking: 0,
    floor_number: '',
    total_floors: '',
    age_years: '',
    furnishing_status: 'unfurnished',
    meta_title: '',
    meta_description: '',
    slug: '',
    // Investment fields
    investment_type: 'fractional',
    total_investment_amount: '',
    minimum_investment: '',
    maximum_investment: '',
    investment_slots: '',
    expected_roi_percentage: '',
    investment_duration_months: '',
    rental_yield_percentage: '',
    appreciation_rate: '',
    // Developer info
    developer_name: '',
    developer_logo: '',
    years_of_experience: '',
    total_projects: '',
    // Legal
    rera_number: '',
    possession_date: '',
    legal_status: 'verified',
    // Documents
    brochure_url: '',
    floor_plan_url: '',
    layout_plan_url: '',
    video_tour_url: '',
    // Additional details
    super_area_sqft: '',
    carpet_area_sqft: '',
    estimated_monthly_rental: '',
    maintenance_charges: '',
    property_tax: '',
    investment_highlights: ''
  })

  useEffect(() => {
    fetchCategories()
    fetchDevelopers()
    fetchCities()
  }, [])

  // Update filtered cities when state changes
  useEffect(() => {
    if (formData.state) {
      let filtered = availableCities
        .filter(c => c.state === formData.state)
        .map(c => c.name)

      // Ensure the currently selected city (e.g. from Pincode lookup) is in the list
      // even if it's not in our database yet
      if (formData.city && !filtered.includes(formData.city)) {
        filtered.push(formData.city)
        filtered.sort()
      }

      setFilteredCities(filtered)
    } else {
      setFilteredCities([])
    }
  }, [formData.state, availableCities, formData.city])

  // Auto-generate slug from title with uniqueness
  useEffect(() => {
    if (formData.title) {
      const baseSlug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')

      // Add timestamp to ensure uniqueness
      const uniqueSlug = `${baseSlug}-${Date.now()}`
      setFormData(prev => ({ ...prev, slug: uniqueSlug }))
    }
  }, [formData.title])

  async function fetchCategories() {
    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('categories')
        .select('id, name')
        .order('name')

      if (error) throw error
      setCategories(data || [])
    } catch (error) {
      console.error('Error fetching categories:', error)
      toast.error('Failed to load categories')
    }
  }

  async function fetchDevelopers() {
    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('developers')
        .select('*')
        .eq('is_active', true)
        .order('name')

      if (error) throw error
      setDevelopers(data || [])
    } catch (error) {
      console.error('Error fetching developers:', error)
      toast.error('Failed to load developers')
    }
  }

  async function fetchCities() {
    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('cities')
        .select('name, state')
        .eq('is_active', true)
        .order('name')

      if (error) throw error
      if (data) {
        setAvailableCities(data)
        const uniqueStates = [...new Set(data.map((item: any) => item.state))].sort()
        setStates(uniqueStates as string[])
      }
    } catch (error) {
      console.error('Error fetching cities:', error)
    }
  }

  async function lookupPincode(pincode: string) {
    if (pincode.length !== 6) return

    setIsLookingUpPincode(true)
    try {
      const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`)
      const data = await response.json()

      if (data[0].Status === 'Success') {
        const postOffice = data[0].PostOffice[0]
        const city = postOffice.District
        const state = postOffice.State

        handleInputChange('state', state)
        // Set city after a small delay to ensure state update has triggered filteredCities update
        setTimeout(() => {
          handleInputChange('city', city)
        }, 100)

        toast.success(`Found location: ${city}, ${state}`)
      }
    } catch (error) {
      console.error('Pincode lookup error:', error)
    } finally {
      setIsLookingUpPincode(false)
    }
  }

  function handleDeveloperSelect(developerId: string) {
    const developer = developers.find(d => d.id === developerId)
    if (developer) {
      setFormData(prev => ({
        ...prev,
        developer_name: developer.name,
        developer_logo: developer.logo_url || '',
        years_of_experience: developer.years_of_experience?.toString() || '',
        total_projects: developer.total_projects?.toString() || ''
      }))
    }
  }

  function handleInputChange(field: string, value: any) {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    if (files.length + images.length > 10) {
      toast.error('Maximum 10 images allowed')
      return
    }

    setImages(prev => [...prev, ...files])

    // Create previews
    files.forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  function removeImage(index: number) {
    setImages(prev => prev.filter((_, i) => i !== index))
    setImagePreviews(prev => prev.filter((_, i) => i !== index))
  }

  async function uploadDocument(file: File, type: 'brochure' | 'floorPlan' | 'layoutPlan' | 'developerLogo') {
    try {
      setUploadingDocs(prev => ({ ...prev, [type]: true }))
      const supabase = getSupabaseClient()

      const fileExt = file.name.split('.').pop()
      const fileName = `${type}-${Date.now()}.${fileExt}`
      const filePath = `documents/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('coventures')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('coventures')
        .getPublicUrl(filePath)

      // Update form data based on type
      if (type === 'brochure') {
        handleInputChange('brochure_url', publicUrl)
      } else if (type === 'floorPlan') {
        handleInputChange('floor_plan_url', publicUrl)
      } else if (type === 'layoutPlan') {
        handleInputChange('layout_plan_url', publicUrl)
      } else if (type === 'developerLogo') {
        handleInputChange('developer_logo', publicUrl)
      }

      toast.success(`${type} uploaded successfully!`)
    } catch (error) {
      console.error(`Error uploading ${type}:`, error)
      toast.error(`Failed to upload ${type}`)
    } finally {
      setUploadingDocs(prev => ({ ...prev, [type]: false }))
    }
  }

  function handleDocumentSelect(e: React.ChangeEvent<HTMLInputElement>, type: 'brochure' | 'floorPlan' | 'layoutPlan' | 'developerLogo') {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const validTypes = type === 'developerLogo'
      ? ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
      : ['application/pdf', 'image/jpeg', 'image/png']

    if (!validTypes.includes(file.type)) {
      toast.error(`Invalid file type. Please upload ${type === 'developerLogo' ? 'an image' : 'a PDF or image'}.`)
      return
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB')
      return
    }

    uploadDocument(file, type)
  }

  async function uploadImages(propertyId: string) {
    if (images.length === 0) return

    setUploadingImages(true)
    try {
      const supabase = getSupabaseClient()

      for (let i = 0; i < images.length; i++) {
        const file = images[i]
        const fileExt = file.name.split('.').pop()
        const fileName = `${propertyId}-${Date.now()}-${i}.${fileExt}`
        const filePath = `properties/${fileName}`

        // Upload to storage
        const { error: uploadError } = await supabase.storage
          .from('coventures')
          .upload(filePath, file)

        if (uploadError) {
          console.error('Upload error:', uploadError)
          throw uploadError
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('coventures')
          .getPublicUrl(filePath)

        // Insert into property_images table
        const { error: insertError } = await supabase
          .from('property_images')
          // @ts-ignore
          .insert({
            property_id: propertyId,
            image_url: publicUrl,
            display_order: i,
            is_primary: i === 0
          })

        if (insertError) throw insertError
      }
    } catch (error) {
      console.error('Error uploading images:', error)
      throw error
    } finally {
      setUploadingImages(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!formData.title || !formData.category_id || !formData.price || !formData.description) {
      toast.error('Please fill in all required fields (title, category, price, description)')
      return
    }

    if (!formData.size_sqft) {
      toast.error('Property size is required')
      return
    }

    if (!profile?.id) {
      toast.error('User not authenticated')
      return
    }

    setLoading(true)
    try {
      const supabase = getSupabaseClient()

      // Check if slug already exists (additional safety check)
      const { data: existingProperty } = await supabase
        .from('properties')
        .select('id')
        .eq('slug', formData.slug)
        .single()

      if (existingProperty) {
        // If slug exists, append a random string
        const randomSuffix = Math.random().toString(36).substring(2, 8)
        formData.slug = `${formData.slug}-${randomSuffix}`
      }

      // Prepare property data with correct field names matching database schema
      const propertyData = {
        user_id: profile.id, // Database uses user_id, not added_by
        category_id: formData.category_id,
        title: formData.title,
        slug: formData.slug,
        description: formData.description,
        location: formData.location || formData.city, // Ensure location is not empty
        city: formData.city,
        state: formData.state,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        price: parseFloat(formData.price),
        bedrooms: formData.bedrooms,
        bathrooms: formData.bathrooms,
        area_sqft: parseInt(formData.size_sqft), // Database uses area_sqft, not size_sqft
        bhk_type: formData.bhk_type,
        property_type: formData.property_type,
        featured_image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80', // Default placeholder
        status: formData.status,
        amenities: formData.amenities ? formData.amenities.split(',').map(a => a.trim()) : [],
        is_featured: formData.is_featured,
        // Investment fields
        investment_type: formData.investment_type || 'fractional',
        total_investment_amount: formData.total_investment_amount ? parseFloat(formData.total_investment_amount) : null,
        minimum_investment: formData.minimum_investment ? parseFloat(formData.minimum_investment) : null,
        maximum_investment: formData.maximum_investment ? parseFloat(formData.maximum_investment) : null,
        investment_slots: formData.investment_slots ? parseInt(formData.investment_slots) : null,
        expected_roi_percentage: formData.expected_roi_percentage ? parseFloat(formData.expected_roi_percentage) : null,
        investment_duration_months: formData.investment_duration_months ? parseInt(formData.investment_duration_months) : null,
        rental_yield_percentage: formData.rental_yield_percentage ? parseFloat(formData.rental_yield_percentage) : null,
        appreciation_rate: formData.appreciation_rate ? parseFloat(formData.appreciation_rate) : null,
        // Developer info
        developer_name: formData.developer_name || null,
        developer_logo: formData.developer_logo || null,
        years_of_experience: formData.years_of_experience ? parseInt(formData.years_of_experience) : null,
        total_projects: formData.total_projects ? parseInt(formData.total_projects) : null,
        // Legal
        rera_number: formData.rera_number || null,
        possession_date: formData.possession_date || null,
        legal_status: formData.legal_status || 'verified',
        // Documents
        brochure_url: formData.brochure_url || null,
        floor_plan_url: formData.floor_plan_url || null,
        layout_plan_url: formData.layout_plan_url || null,
        video_tour_url: formData.video_tour_url || null,
        // Additional
        super_area_sqft: formData.super_area_sqft ? parseInt(formData.super_area_sqft) : null,
        carpet_area_sqft: formData.carpet_area_sqft ? parseInt(formData.carpet_area_sqft) : null,
        parking_spaces: formData.parking ? formData.parking : '0',
        floor_number: formData.floor_number ? parseInt(formData.floor_number) : null,
        total_floors: formData.total_floors ? parseInt(formData.total_floors) : null,
        furnishing_status: formData.furnishing_status || 'unfurnished',
        age_years: formData.age_years ? parseInt(formData.age_years) : null,
        estimated_monthly_rental: formData.estimated_monthly_rental ? parseFloat(formData.estimated_monthly_rental) : null,
        maintenance_charges: formData.maintenance_charges ? parseFloat(formData.maintenance_charges) : null,
        property_tax: formData.property_tax ? parseFloat(formData.property_tax) : null,
        investment_highlights: formData.investment_highlights ? formData.investment_highlights.split('\n').map(h => h.trim()).filter(h => h) : []
      }

      // Insert property
      const { data: property, error: propertyError } = (await supabase
        .from('properties')
        .insert(propertyData as any)
        .select()
        .single()) as { data: { id: string } | null; error: any }

      if (propertyError) {
        console.error('Property creation error:', propertyError)
        throw new Error(propertyError.message || 'Failed to create property')
      }

      if (!property) {
        throw new Error('Property created but no data returned')
      }

      // Upload featured image FIRST
      let uploadedFeaturedImageUrl = null
      if (featuredImageFile) {
        const fileExt = featuredImageFile.name.split('.').pop()
        const fileName = `featured-${property.id}-${Date.now()}.${fileExt}`
        const filePath = `properties/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('coventures')
          .upload(filePath, featuredImageFile)

        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage
            .from('coventures')
            .getPublicUrl(filePath)
          uploadedFeaturedImageUrl = publicUrl
        }
      }

      // CREATE PROPERTY GROUP AUTOMATICALLY
      if (formData.investment_slots) {
        const { error: groupError } = await supabase
          .from('property_groups')
          // @ts-ignore
          .insert({
            property_id: property.id,
            total_slots: parseInt(formData.investment_slots),
            filled_slots: 0,
            status: 'open',
            target_amount: formData.total_investment_amount ? parseFloat(formData.total_investment_amount) : 0,
            minimum_investment: formData.minimum_investment ? parseFloat(formData.minimum_investment) : 0
          })

        if (groupError) {
          console.error('Error creating property group:', groupError)
          toast.error('Property created but failed to initialize investment group')
        }
      }

      // Upload gallery images
      if (images.length > 0) {
        await uploadImages(property.id)
      }

      // Update property with featured image
      // Prioritize explicitly uploaded featured image, then first gallery image, then placeholder
      let finalFeaturedImage = uploadedFeaturedImageUrl

      if (!finalFeaturedImage && images.length > 0) {
        // Get the first uploaded gallery image URL
        const { data: firstImage } = (await supabase
          .from('property_images')
          .select('image_url')
          .eq('property_id', property.id)
          .eq('is_primary', true)
          .single()) as { data: { image_url: string } | null; error: any }

        if (firstImage) {
          finalFeaturedImage = firstImage.image_url
        }
      }

      if (finalFeaturedImage) {
        // @ts-ignore
        await supabase
          .from('properties')
          .update({ featured_image: finalFeaturedImage })
          .eq('id', property.id)
      }

      toast.success('Property created successfully')
      router.push('/admin/properties')
    } catch (error: any) {
      console.error('Error creating property:', error)

      // Handle specific error types
      if (error.message?.includes('duplicate key value') && error.message?.includes('slug')) {
        toast.error('A property with this URL already exists. Please try again.')
      } else if (error.code === '23505') {
        toast.error('Duplicate entry detected. Please modify the property details.')
      } else {
        toast.error(error.message || 'Failed to create property')
      }
    } finally {
      setLoading(false)
    }
  }

  function handleNext() {
    const currentIndex = tabs.indexOf(activeTab)
    if (currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1])
      window.scrollTo(0, 0)
    }
  }

  function handlePrev() {
    const currentIndex = tabs.indexOf(activeTab)
    if (currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1])
      window.scrollTo(0, 0)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/properties">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Add New Property</h1>
          <p className="mt-1 text-sm text-gray-500">Create a new property listing</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 lg:w-full">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="investment">Investment</TabsTrigger>
            <TabsTrigger value="location">Location</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="legal">Legal & Docs</TabsTrigger>
            <TabsTrigger value="images">Images</TabsTrigger>
          </TabsList>

          {/* Basic Info */}
          <TabsContent value="basic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Property Information</CardTitle>
                <CardDescription>Basic details about the property</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Property Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="e.g., Spacious 3BHK Apartment in Koramangala"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Detailed description of the property..."
                    rows={4}
                    required
                  />
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="category_id">Category *</Label>
                    <Select value={formData.category_id} onValueChange={(value) => handleInputChange('category_id', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(cat => (
                          <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="property_type">Property Type</Label>
                    <Select value={formData.property_type} onValueChange={(value) => handleInputChange('property_type', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="apartment">Apartment</SelectItem>
                        <SelectItem value="villa">Villa</SelectItem>
                        <SelectItem value="house">House</SelectItem>
                        <SelectItem value="plot">Plot</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bhk_type">BHK Type</Label>
                    <Select value={formData.bhk_type} onValueChange={(value) => handleInputChange('bhk_type', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1BHK">1 BHK</SelectItem>
                        <SelectItem value="2BHK">2 BHK</SelectItem>
                        <SelectItem value="3BHK">3 BHK</SelectItem>
                        <SelectItem value="4BHK">4 BHK</SelectItem>
                        <SelectItem value="5+BHK">5+ BHK</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="available">Available</SelectItem>
                        <SelectItem value="sold">Sold</SelectItem>
                        <SelectItem value="rented">Rented</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (₹) *</Label>
                    <Input
                      id="price"
                      type="number"
                      value={formData.price}
                      onChange={(e) => handleInputChange('price', e.target.value)}
                      placeholder="e.g., 8500000"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="size_sqft">Size (sq ft) *</Label>
                    <Input
                      id="size_sqft"
                      type="number"
                      value={formData.size_sqft}
                      onChange={(e) => handleInputChange('size_sqft', e.target.value)}
                      placeholder="e.g., 1200"
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Investment Tab */}
          <TabsContent value="investment" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Investment Details</CardTitle>
                <CardDescription>Configure co-investment parameters</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="investment_type">Investment Type</Label>
                    <Select value={formData.investment_type} onValueChange={(value) => handleInputChange('investment_type', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fractional">Fractional Ownership</SelectItem>
                        <SelectItem value="full">Full Ownership</SelectItem>
                        <SelectItem value="equity">Equity Investment</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="total_investment_amount">Total Investment Amount (₹)</Label>
                    <Input
                      id="total_investment_amount"
                      type="number"
                      value={formData.total_investment_amount}
                      onChange={(e) => handleInputChange('total_investment_amount', e.target.value)}
                      placeholder="e.g., 50000000"
                    />
                  </div>

                  <div>
                    <Label htmlFor="minimum_investment">Minimum Investment (₹)</Label>
                    <Input
                      id="minimum_investment"
                      type="number"
                      value={formData.minimum_investment}
                      onChange={(e) => handleInputChange('minimum_investment', e.target.value)}
                      placeholder="e.g., 500000"
                    />
                  </div>

                  <div>
                    <Label htmlFor="maximum_investment">Maximum Investment (₹)</Label>
                    <Input
                      id="maximum_investment"
                      type="number"
                      value={formData.maximum_investment}
                      onChange={(e) => handleInputChange('maximum_investment', e.target.value)}
                      placeholder="e.g., 5000000"
                    />
                  </div>

                  <div>
                    <Label htmlFor="investment_slots">Total Investment Slots</Label>
                    <Input
                      id="investment_slots"
                      type="number"
                      value={formData.investment_slots}
                      onChange={(e) => handleInputChange('investment_slots', e.target.value)}
                      placeholder="e.g., 100"
                    />
                  </div>

                  <div>
                    <Label htmlFor="investment_duration_months">Investment Duration (Months)</Label>
                    <Input
                      id="investment_duration_months"
                      type="number"
                      value={formData.investment_duration_months}
                      onChange={(e) => handleInputChange('investment_duration_months', e.target.value)}
                      placeholder="e.g., 36"
                    />
                  </div>

                  <div>
                    <Label htmlFor="expected_roi_percentage">Expected ROI (%)</Label>
                    <Input
                      id="expected_roi_percentage"
                      type="number"
                      step="0.1"
                      value={formData.expected_roi_percentage}
                      onChange={(e) => handleInputChange('expected_roi_percentage', e.target.value)}
                      placeholder="e.g., 12.5"
                    />
                  </div>

                  <div>
                    <Label htmlFor="rental_yield_percentage">Rental Yield (%)</Label>
                    <Input
                      id="rental_yield_percentage"
                      type="number"
                      step="0.1"
                      value={formData.rental_yield_percentage}
                      onChange={(e) => handleInputChange('rental_yield_percentage', e.target.value)}
                      placeholder="e.g., 4.5"
                    />
                  </div>

                  <div>
                    <Label htmlFor="appreciation_rate">Appreciation Rate (%)</Label>
                    <Input
                      id="appreciation_rate"
                      type="number"
                      step="0.1"
                      value={formData.appreciation_rate}
                      onChange={(e) => handleInputChange('appreciation_rate', e.target.value)}
                      placeholder="e.g., 8.0"
                    />
                  </div>

                  <div>
                    <Label htmlFor="estimated_monthly_rental">Est. Monthly Rental (₹)</Label>
                    <Input
                      id="estimated_monthly_rental"
                      type="number"
                      value={formData.estimated_monthly_rental}
                      onChange={(e) => handleInputChange('estimated_monthly_rental', e.target.value)}
                      placeholder="e.g., 50000"
                    />
                  </div>

                  <div>
                    <Label htmlFor="maintenance_charges">Maintenance Charges (₹/month)</Label>
                    <Input
                      id="maintenance_charges"
                      type="number"
                      value={formData.maintenance_charges}
                      onChange={(e) => handleInputChange('maintenance_charges', e.target.value)}
                      placeholder="e.g., 5000"
                    />
                  </div>

                  <div>
                    <Label htmlFor="property_tax">Property Tax (₹/year)</Label>
                    <Input
                      id="property_tax"
                      type="number"
                      value={formData.property_tax}
                      onChange={(e) => handleInputChange('property_tax', e.target.value)}
                      placeholder="e.g., 25000"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="investment_highlights">Investment Highlights (one per line)</Label>
                  <Textarea
                    id="investment_highlights"
                    value={formData.investment_highlights}
                    onChange={(e) => handleInputChange('investment_highlights', e.target.value)}
                    placeholder="Prime Location - Heart of City&#10;High Rental Demand&#10;Excellent Appreciation Potential&#10;Fully Legal & RERA Approved"
                    rows={6}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <Label htmlFor="developer_select">Select Developer *</Label>
                    <Select onValueChange={handleDeveloperSelect}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a developer..." />
                      </SelectTrigger>
                      <SelectContent>
                        {developers.map((dev) => (
                          <SelectItem key={dev.id} value={dev.id}>
                            {dev.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-gray-500 mt-1">
                      Select a developer to auto-fill details below
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="developer_name">Developer Name</Label>
                    <Input
                      id="developer_name"
                      value={formData.developer_name}
                      readOnly
                      className="bg-gray-50"
                      placeholder="Auto-filled from selection"
                    />
                  </div>

                  <div>
                    <Label htmlFor="years_of_experience">Years of Experience</Label>
                    <Input
                      id="years_of_experience"
                      type="number"
                      value={formData.years_of_experience}
                      readOnly
                      className="bg-gray-50"
                      placeholder="Auto-filled"
                    />
                  </div>

                  <div>
                    <Label htmlFor="total_projects">Total Projects</Label>
                    <Input
                      id="total_projects"
                      type="number"
                      value={formData.total_projects}
                      readOnly
                      className="bg-gray-50"
                      placeholder="Auto-filled"
                    />
                  </div>

                  <div>
                    <Label htmlFor="developer_logo">Developer Logo</Label>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Input
                          id="developer_logo"
                          value={formData.developer_logo}
                          readOnly
                          className="bg-gray-50"
                          placeholder="Upload logo or auto-filled"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => document.getElementById('logo-upload')?.click()}
                          disabled={uploadingDocs.developerLogo}
                        >
                          {uploadingDocs.developerLogo ? (
                            <>
                              <Upload className="mr-2 h-4 w-4 animate-spin" />
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Upload className="mr-2 h-4 w-4" />
                              Upload
                            </>
                          )}
                        </Button>
                        <input
                          id="logo-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleDocumentSelect(e, 'developerLogo')}
                        />
                      </div>
                      {formData.developer_logo && (
                        <div className="relative w-32 h-32 border rounded">
                          <img
                            src={formData.developer_logo}
                            alt="Developer logo preview"
                            className="w-full h-full object-contain p-2"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Location */}
          <TabsContent value="location" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Location Details</CardTitle>
                <CardDescription>Where is the property located?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="address">Full Address</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Complete address with street, area, etc."
                    rows={3}
                  />
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="location">Location/Area *</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      placeholder="e.g., Koramangala"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pincode">Pincode</Label>
                    <div className="relative">
                      <Input
                        id="pincode"
                        value={formData.pincode}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '').slice(0, 6)
                          handleInputChange('pincode', val)
                          if (val.length === 6) lookupPincode(val)
                        }}
                        placeholder="e.g., 560001"
                      />
                      {isLookingUpPincode && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Select value={formData.state} onValueChange={(value) => handleInputChange('state', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        {states.map(state => (
                          <SelectItem key={state} value={state}>{state}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Select value={formData.city} onValueChange={(value) => handleInputChange('city', value)} disabled={!formData.state}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select city" />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredCities.map(city => (
                          <SelectItem key={city} value={city}>{city}</SelectItem>
                        ))}
                        {/* Allow manual entry if city not in list? Or just stick to list. 
                            The user said "dropdown for the state and city", implying selection. */}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="latitude">Latitude</Label>
                    <Input
                      id="latitude"
                      type="number"
                      step="any"
                      value={formData.latitude}
                      onChange={(e) => handleInputChange('latitude', e.target.value)}
                      placeholder="e.g., 12.9352"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="longitude">Longitude</Label>
                    <Input
                      id="longitude"
                      type="number"
                      step="any"
                      value={formData.longitude}
                      onChange={(e) => handleInputChange('longitude', e.target.value)}
                      placeholder="e.g., 77.6245"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Details */}
          <TabsContent value="details" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Property Details</CardTitle>
                <CardDescription>Additional specifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="bedrooms">Bedrooms</Label>
                    <Input
                      id="bedrooms"
                      type="number"
                      value={formData.bedrooms}
                      onChange={(e) => handleInputChange('bedrooms', parseInt(e.target.value))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bathrooms">Bathrooms</Label>
                    <Input
                      id="bathrooms"
                      type="number"
                      value={formData.bathrooms}
                      onChange={(e) => handleInputChange('bathrooms', parseInt(e.target.value))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="parking">Parking Spaces</Label>
                    <Input
                      id="parking"
                      type="number"
                      value={formData.parking}
                      onChange={(e) => handleInputChange('parking', parseInt(e.target.value))}
                    />
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="floor_number">Floor Number</Label>
                    <Input
                      id="floor_number"
                      type="number"
                      value={formData.floor_number}
                      onChange={(e) => handleInputChange('floor_number', e.target.value)}
                      placeholder="e.g., 5"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="total_floors">Total Floors</Label>
                    <Input
                      id="total_floors"
                      type="number"
                      value={formData.total_floors}
                      onChange={(e) => handleInputChange('total_floors', e.target.value)}
                      placeholder="e.g., 10"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="age_years">Property Age (years)</Label>
                    <Input
                      id="age_years"
                      type="number"
                      value={formData.age_years}
                      onChange={(e) => handleInputChange('age_years', e.target.value)}
                      placeholder="e.g., 5"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="furnishing_status">Furnishing Status</Label>
                  <Select value={formData.furnishing_status} onValueChange={(value) => handleInputChange('furnishing_status', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unfurnished">Unfurnished</SelectItem>
                      <SelectItem value="semi-furnished">Semi-Furnished</SelectItem>
                      <SelectItem value="fully-furnished">Fully Furnished</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amenities">Amenities (comma separated)</Label>
                  <Textarea
                    id="amenities"
                    value={formData.amenities}
                    onChange={(e) => handleInputChange('amenities', e.target.value)}
                    placeholder="e.g., Swimming Pool, Gym, Club House, Garden"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Legal & Documents Tab */}
          <TabsContent value="legal" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Legal & Compliance</CardTitle>
                <CardDescription>RERA and legal documentation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="rera_number">RERA Number</Label>
                    <Input
                      id="rera_number"
                      value={formData.rera_number}
                      onChange={(e) => handleInputChange('rera_number', e.target.value)}
                      placeholder="e.g., RERA/2024/123456"
                    />
                  </div>

                  <div>
                    <Label htmlFor="possession_date">Possession Date</Label>
                    <Input
                      id="possession_date"
                      type="date"
                      value={formData.possession_date}
                      onChange={(e) => handleInputChange('possession_date', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="legal_status">Legal Status</Label>
                    <Select value={formData.legal_status} onValueChange={(value) => handleInputChange('legal_status', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="verified">Verified</SelectItem>
                        <SelectItem value="pending">Pending Verification</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Documents & Media</CardTitle>
                <CardDescription>Upload brochures, plans, and add video links</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <Label htmlFor="brochure_url">Brochure</Label>
                    <div className="flex gap-2">
                      <Input
                        id="brochure_url"
                        value={formData.brochure_url}
                        readOnly
                        className="bg-gray-50"
                        placeholder="Upload brochure PDF"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('brochure-upload')?.click()}
                        disabled={uploadingDocs.brochure}
                      >
                        {uploadingDocs.brochure ? (
                          <>
                            <Upload className="mr-2 h-4 w-4 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="mr-2 h-4 w-4" />
                            Upload
                          </>
                        )}
                      </Button>
                      <input
                        id="brochure-upload"
                        type="file"
                        accept=".pdf,image/*"
                        className="hidden"
                        onChange={(e) => handleDocumentSelect(e, 'brochure')}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="floor_plan_url">Floor Plan</Label>
                    <div className="flex gap-2">
                      <Input
                        id="floor_plan_url"
                        value={formData.floor_plan_url}
                        readOnly
                        className="bg-gray-50"
                        placeholder="Upload floor plan"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('floorplan-upload')?.click()}
                        disabled={uploadingDocs.floorPlan}
                      >
                        {uploadingDocs.floorPlan ? (
                          <>
                            <Upload className="mr-2 h-4 w-4 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="mr-2 h-4 w-4" />
                            Upload
                          </>
                        )}
                      </Button>
                      <input
                        id="floorplan-upload"
                        type="file"
                        accept=".pdf,image/*"
                        className="hidden"
                        onChange={(e) => handleDocumentSelect(e, 'floorPlan')}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="layout_plan_url">Layout Plan</Label>
                    <div className="flex gap-2">
                      <Input
                        id="layout_plan_url"
                        value={formData.layout_plan_url}
                        readOnly
                        className="bg-gray-50"
                        placeholder="Upload layout plan"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('layoutplan-upload')?.click()}
                        disabled={uploadingDocs.layoutPlan}
                      >
                        {uploadingDocs.layoutPlan ? (
                          <>
                            <Upload className="mr-2 h-4 w-4 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="mr-2 h-4 w-4" />
                            Upload
                          </>
                        )}
                      </Button>
                      <input
                        id="layoutplan-upload"
                        type="file"
                        accept=".pdf,image/*"
                        className="hidden"
                        onChange={(e) => handleDocumentSelect(e, 'layoutPlan')}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="video_tour_url">Video Tour URL (YouTube/Vimeo)</Label>
                    <Input
                      id="video_tour_url"
                      value={formData.video_tour_url}
                      onChange={(e) => handleInputChange('video_tour_url', e.target.value)}
                      placeholder="https://youtube.com/watch?v=..."
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Additional Areas</CardTitle>
                <CardDescription>Super area, carpet area, and other measurements</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="super_area_sqft">Super Area (sq ft)</Label>
                    <Input
                      id="super_area_sqft"
                      type="number"
                      value={formData.super_area_sqft}
                      onChange={(e) => handleInputChange('super_area_sqft', e.target.value)}
                      placeholder="e.g., 1350"
                    />
                  </div>

                  <div>
                    <Label htmlFor="carpet_area_sqft">Carpet Area (sq ft)</Label>
                    <Input
                      id="carpet_area_sqft"
                      type="number"
                      value={formData.carpet_area_sqft}
                      onChange={(e) => handleInputChange('carpet_area_sqft', e.target.value)}
                      placeholder="e.g., 1050"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Images */}
          <TabsContent value="images" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Property Images</CardTitle>
                <CardDescription>Set a cover image and gallery images</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">

                {/* Featured Image Section */}
                <div className="space-y-4 border-b pb-6">
                  <Label className="text-lg font-semibold">Featured Image (Thumbnail)</Label>
                  <p className="text-sm text-gray-500">This image will be shown on the home page and listings.</p>

                  <div className="flex items-start gap-6">
                    <div className="w-full max-w-xs">
                      <Label htmlFor="featured-image" className="cursor-pointer block">
                        <div className={`flex items-center justify-center w-full h-48 border-2 border-dashed rounded-lg transition-colors ${featuredImagePreview ? 'border-coral-400 bg-gray-50' : 'border-gray-300 hover:border-coral-400'}`}>
                          {featuredImagePreview ? (
                            <div className="relative w-full h-full p-2">
                              <img src={featuredImagePreview} alt="Featured" className="w-full h-full object-cover rounded" />
                              <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity rounded">
                                <p className="text-white text-sm font-medium">Click to Change</p>
                              </div>
                            </div>
                          ) : (
                            <div className="text-center p-4">
                              <Upload className="mx-auto h-8 w-8 text-gray-400" />
                              <p className="mt-2 text-sm text-gray-600">Upload Cover Image</p>
                            </div>
                          )}
                        </div>
                        <Input
                          id="featured-image"
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) {
                              setFeaturedImageFile(file)
                              const reader = new FileReader()
                              reader.onloadend = () => setFeaturedImagePreview(reader.result as string)
                              reader.readAsDataURL(file)
                            }
                          }}
                          className="hidden"
                        />
                      </Label>
                      {featuredImagePreview && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="mt-2 text-red-500 w-full"
                          onClick={() => {
                            setFeaturedImageFile(null)
                            setFeaturedImagePreview(null)
                          }}
                        >
                          Remove Cover Image
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-lg font-semibold">Gallery Images</Label>
                  <p className="text-sm text-gray-500">Add detailed images for the property gallery.</p>
                  <Label htmlFor="images" className="cursor-pointer">
                    <div className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg hover:border-coral-400 transition-colors">
                      <div className="text-center">
                        <Upload className="mx-auto h-8 w-8 text-gray-400" />
                        <p className="mt-2 text-sm text-gray-600">Click to upload images</p>
                        <p className="text-xs text-gray-500">PNG, JPG up to 5MB each</p>
                      </div>
                    </div>
                    <Input
                      id="images"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                  </Label>

                  {imagePreviews.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          {index === 0 && (
                            <div className="absolute top-2 left-2 bg-coral-600 text-white text-xs px-2 py-1 rounded">
                              Primary
                            </div>
                          )}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-red-600 hover:bg-red-50"
                            onClick={() => removeImage(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Submit Button */}
        {/* Navigation Buttons */}
        <div className="flex justify-between gap-4 pt-6 border-t mt-6">
          <div className="flex gap-2">
            <Link href="/admin/properties">
              <Button type="button" variant="outline">Cancel</Button>
            </Link>
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrev}
              disabled={activeTab === 'basic'}
              className={activeTab === 'basic' ? 'invisible' : ''}
            >
              Previous
            </Button>

            {activeTab === 'images' ? (
              <Button type="submit" disabled={loading || uploadingImages} className="gap-2 bg-coral hover:bg-coral-dark">
                <Save className="h-4 w-4" />
                {loading ? 'Creating...' : uploadingImages ? 'Uploading Images...' : 'Create Property'}
              </Button>
            ) : (
              <Button type="button" onClick={handleNext}>
                Next
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  )
}
