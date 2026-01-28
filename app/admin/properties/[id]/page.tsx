// @ts-nocheck
"use client"

import { useState, useEffect, useCallback } from 'react'
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
import Image from 'next/image'

interface Category {
    id: string
    name: string
}

export default function EditPropertyPage({ params }: { params: { id: string } }) {
    const router = useRouter()
    const { profile } = useAuth()
    const [categories, setCategories] = useState<Category[]>([])
    const [developers, setDevelopers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [uploadingImages, setUploadingImages] = useState(false)

    // Image handling
    const [images, setImages] = useState<File[]>([])
    const [imagePreviews, setImagePreviews] = useState<string[]>([])
    const [existingImages, setExistingImages] = useState<any[]>([])
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

    const fetchCategories = useCallback(async () => {
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
    }, [])

    const fetchDevelopers = useCallback(async () => {
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
    }, [])

    const fetchCities = useCallback(async () => {
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
    }, [])

    const lookupPincode = useCallback(async (pincode: string) => {
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
    }, [])

    const fetchProperty = useCallback(async () => {
        try {
            setLoading(true)
            const supabase = getSupabaseClient()

            const { data: property, error } = await supabase
                .from('properties')
                .select(`
          *,
          property_images (id, image_url, is_primary, display_order)
        `)
                .eq('id', params.id)
                .single()

            if (error) throw error
            if (!property) throw new Error('Property not found')

            // Populate form data
            setFormData({
                title: property.title || '',
                description: property.description || '',
                category_id: property.category_id || '',
                property_type: property.property_type || 'apartment',
                bhk_type: property.bhk_type || '2BHK',
                bedrooms: property.bedrooms || 0,
                bathrooms: property.bathrooms || 0,
                size_sqft: property.area_sqft?.toString() || '',
                price: property.price?.toString() || '',
                location: property.location || '',
                city: property.city || '',
                state: property.state || '',
                pincode: property.pincode || '',
                address: property.address || '',
                latitude: property.latitude?.toString() || '',
                longitude: property.longitude?.toString() || '',
                status: property.status || 'available',
                is_featured: property.is_featured || false,
                amenities: Array.isArray(property.amenities) ? property.amenities.join(', ') : (property.amenities || ''),
                parking: property.parking_spaces || 0,
                floor_number: property.floor_number?.toString() || '',
                total_floors: property.total_floors?.toString() || '',
                age_years: property.age_years?.toString() || '',
                furnishing_status: property.furnishing_status || 'unfurnished',
                meta_title: property.meta_title || '',
                meta_description: property.meta_description || '',
                slug: property.slug || '',
                // Investment
                investment_type: property.investment_type || 'fractional',
                total_investment_amount: property.total_investment_amount?.toString() || '',
                minimum_investment: property.minimum_investment?.toString() || '',
                maximum_investment: property.maximum_investment?.toString() || '',
                investment_slots: property.investment_slots?.toString() || '',
                expected_roi_percentage: property.expected_roi_percentage?.toString() || '',
                investment_duration_months: property.investment_duration_months?.toString() || '',
                rental_yield_percentage: property.rental_yield_percentage?.toString() || '',
                appreciation_rate: property.appreciation_rate?.toString() || '',
                // Developer
                developer_name: property.developer_name || '',
                developer_logo: property.developer_logo || '',
                years_of_experience: property.years_of_experience?.toString() || '',
                total_projects: property.total_projects?.toString() || '',
                // Legal
                rera_number: property.rera_number || '',
                possession_date: property.possession_date || '',
                legal_status: property.legal_status || 'verified',
                // Docs
                brochure_url: property.brochure_url || '',
                floor_plan_url: property.floor_plan_url || '',
                layout_plan_url: property.layout_plan_url || '',
                video_tour_url: property.video_tour_url || '',
                // Additional
                super_area_sqft: property.super_area_sqft?.toString() || '',
                carpet_area_sqft: property.carpet_area_sqft?.toString() || '',
                estimated_monthly_rental: property.estimated_monthly_rental?.toString() || '',
                maintenance_charges: property.maintenance_charges?.toString() || '',
                property_tax: property.property_tax?.toString() || '',
                investment_highlights: Array.isArray(property.investment_highlights) ? property.investment_highlights.join('\n') : (property.investment_highlights || '')
            })

            // Set featured image
            if (property.featured_image) {
                setFeaturedImagePreview(property.featured_image)
            }

            // Set existing gallery images
            if (property.property_images && property.property_images.length > 0) {
                setExistingImages(property.property_images)
            }

        } catch (error) {
            console.error('Error fetching property:', error)
            toast.error('Failed to load property details')
        } finally {
            setLoading(false)
        }
    }, [params.id])

    useEffect(() => {
        fetchCategories()
        fetchDevelopers()
        fetchProperty()
        fetchCities()
    }, [fetchCategories, fetchDevelopers, fetchProperty, fetchCities])

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
        if (files.length + images.length + existingImages.length > 10) {
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

    async function removeExistingImage(imageId: string) {
        try {
            const supabase = getSupabaseClient()
            const { error } = await supabase
                .from('property_images')
                .delete()
                .eq('id', imageId)

            if (error) throw error

            setExistingImages(prev => prev.filter(img => img.id !== imageId))
            toast.success('Image removed')
        } catch (error) {
            console.error('Error deleting image:', error)
            toast.error('Failed to delete image')
        }
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
                        display_order: existingImages.length + i,
                        is_primary: existingImages.length === 0 && i === 0 && !formData.featured_image
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

        setSubmitting(true)
        try {
            const supabase = getSupabaseClient()

            // Prepare property data
            const propertyData = {
                category_id: formData.category_id,
                title: formData.title,
                slug: formData.slug,
                description: formData.description,
                location: formData.location || formData.city,
                city: formData.city,
                state: formData.state,
                latitude: formData.latitude ? parseFloat(formData.latitude) : null,
                longitude: formData.longitude ? parseFloat(formData.longitude) : null,
                price: parseFloat(formData.price),
                bedrooms: formData.bedrooms,
                bathrooms: formData.bathrooms,
                area_sqft: parseInt(formData.size_sqft),
                bhk_type: formData.bhk_type,
                property_type: formData.property_type,
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

            // Update property
            const { error: updateError } = await supabase
                .from('properties')
                .update(propertyData)
                .eq('id', params.id)

            if (updateError) throw updateError

            // Upload featured image
            let uploadedFeaturedImageUrl = null
            if (featuredImageFile) {
                setUploadingImages(true)
                const fileExt = featuredImageFile.name.split('.').pop()
                const fileName = `featured-${params.id}-${Date.now()}.${fileExt}`
                const filePath = `properties/${fileName}`

                const { error: uploadError } = await supabase.storage
                    .from('coventures')
                    .upload(filePath, featuredImageFile)

                if (!uploadError) {
                    const { data: { publicUrl } } = supabase.storage
                        .from('coventures')
                        .getPublicUrl(filePath)
                    uploadedFeaturedImageUrl = publicUrl

                    // Update property with featured image
                    await supabase
                        .from('properties')
                        .update({ featured_image: uploadedFeaturedImageUrl })
                        .eq('id', params.id)
                }
                setUploadingImages(false)
            }

            // Upload new gallery images
            if (images.length > 0) {
                await uploadImages(params.id)
            }

            toast.success('Property updated successfully')
            router.push('/admin/properties')
        } catch (error: any) {
            console.error('Error updating property:', error)
            toast.error(error.message || 'Failed to update property')
        } finally {
            setSubmitting(false)
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

    const isLoading = loading // Alias for cleaner JSX

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coral"></div>
            </div>
        )
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
                    <h1 className="text-3xl font-bold text-gray-900">Edit Property</h1>
                    <p className="mt-1 text-sm text-gray-500">Update property listing details</p>
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
                                        placeholder="e.g., Spacious 3BHK Apartment"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">Description *</Label>
                                    <Textarea
                                        id="description"
                                        value={formData.description}
                                        onChange={(e) => handleInputChange('description', e.target.value)}
                                        placeholder="Detailed description..."
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
                                {/* Reusing same inputs as new page, mapped to formdata */}
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
                                        />
                                    </div>

                                    {/* ... Add other investment fields similarly ... */}
                                    {/* Simplified for brevity while ensuring all fields from new page are present in state */}
                                    <div>
                                        <Label htmlFor="minimum_investment">Minimum Investment (₹)</Label>
                                        <Input
                                            id="minimum_investment"
                                            type="number"
                                            value={formData.minimum_investment}
                                            onChange={(e) => handleInputChange('minimum_investment', e.target.value)}
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
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="investment_highlights">Investment Highlights</Label>
                                    <Textarea
                                        id="investment_highlights"
                                        value={formData.investment_highlights}
                                        onChange={(e) => handleInputChange('investment_highlights', e.target.value)}
                                        rows={6}
                                    />
                                </div>

                                {/* Developer Select */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2">
                                        <Label htmlFor="developer_select">Select Developer</Label>
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
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="address">Full Address</Label>
                                    <Textarea
                                        id="address"
                                        value={formData.address}
                                        onChange={(e) => handleInputChange('address', e.target.value)}
                                    />
                                </div>
                                <div className="grid gap-6 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="location">Location/Area *</Label>
                                        <Input
                                            id="location"
                                            value={formData.location}
                                            onChange={(e) => handleInputChange('location', e.target.value)}
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
                                            </SelectContent>
                                        </Select>
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
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="amenities">Amenities</Label>
                                    <Textarea
                                        id="amenities"
                                        value={formData.amenities}
                                        onChange={(e) => handleInputChange('amenities', e.target.value)}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Legal & Docs */}
                    <TabsContent value="legal" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Legal & Compliance</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <Label htmlFor="rera_number">RERA Number</Label>
                                        <Input
                                            id="rera_number"
                                            value={formData.rera_number}
                                            onChange={(e) => handleInputChange('rera_number', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Documents</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 gap-6">
                                    {/* Document uploads similar to new page */}
                                    <div>
                                        <Label htmlFor="brochure_url">Brochure</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                id="brochure_url"
                                                value={formData.brochure_url}
                                                readOnly
                                                className="bg-gray-50"
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => document.getElementById('brochure-upload')?.click()}
                                                disabled={uploadingDocs.brochure}
                                            >
                                                {uploadingDocs.brochure ? 'Uploading...' : 'Upload'}
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
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Images */}
                    <TabsContent value="images" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Property Images</CardTitle>
                                <CardDescription>Manage property images</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">

                                {/* Featured Image */}
                                <div className="space-y-4 border-b pb-6">
                                    <Label className="text-lg font-semibold">Featured Image (Thumbnail)</Label>
                                    <div className="flex items-start gap-6">
                                        <div className="w-full max-w-xs">
                                            <Label htmlFor="featured-image" className="cursor-pointer block">
                                                <div className={`flex items-center justify-center w-full h-48 border-2 border-dashed rounded-lg transition-colors ${featuredImagePreview ? 'border-coral-400 bg-gray-50' : 'border-gray-300 hover:border-coral-400'}`}>
                                                    {featuredImagePreview ? (
                                                        <div className="relative w-full h-full">
                                                            <Image src={featuredImagePreview} alt="Featured" fill className="object-cover rounded" />
                                                        </div>
                                                    ) : (
                                                        <div className="text-center p-4">
                                                            <Upload className="mx-auto h-8 w-8 text-gray-400" />
                                                            <p className="mt-2 text-sm text-gray-600">Upload Cover</p>
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
                                        </div>
                                    </div>
                                </div>

                                {/* Existing Gallery Images */}
                                {existingImages.length > 0 && (
                                    <div className="space-y-4">
                                        <Label className="text-lg font-semibold">Existing Gallery Images</Label>
                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                            {existingImages.map((img) => (
                                                <div key={img.id} className="relative group">
                                                    <div className="relative w-full h-32">
                                                        <Image src={img.image_url} alt="Gallery" fill className="object-cover rounded-lg" />
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        variant="destructive"
                                                        size="sm"
                                                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        onClick={() => removeExistingImage(img.id)}
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* New Image Selection */}
                                <div className="space-y-4">
                                    <Label className="text-lg font-semibold">Add New Images</Label>
                                    <Label htmlFor="images" className="cursor-pointer">
                                        <div className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg hover:border-coral-400 transition-colors">
                                            <div className="text-center">
                                                <Upload className="mx-auto h-8 w-8 text-gray-400" />
                                                <p className="mt-2 text-sm text-gray-600">Click to upload more images</p>
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
                                                    <div className="relative w-full h-32">
                                                        <Image
                                                            src={preview}
                                                            alt={`Preview ${index + 1}`}
                                                            fill
                                                            className="object-cover rounded-lg"
                                                        />
                                                    </div>
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

                {/* Buttons */}
                <div className="flex justify-between gap-4 pt-6 border-t mt-6">
                    <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                    <div className="flex gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handlePrev}
                            disabled={activeTab === 'basic'}
                        >
                            Previous
                        </Button>
                        {activeTab === 'images' ? (
                            <Button type="submit" disabled={submitting || uploadingImages} className="gap-2 bg-coral hover:bg-coral-dark">
                                <Save className="h-4 w-4" />
                                {submitting ? 'Updating...' : 'Update Property'}
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
