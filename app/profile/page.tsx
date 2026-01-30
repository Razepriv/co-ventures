'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { useAuth } from '@/lib/auth/AuthProvider'
import { getSupabaseClient } from '@/lib/supabase/client'
import { motion } from 'framer-motion'
import Image from 'next/image'
import {
  User,
  Mail,
  Phone,
  Camera,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle,
  Lock,
  Calendar,
  Shield,
  Users,
  MapPin,
  ExternalLink
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

export default function ProfilePage() {
  const router = useRouter()
  const { user, profile, loading: authLoading, refreshProfile } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [joinedGroups, setJoinedGroups] = useState<any[]>([])
  const [loadingGroups, setLoadingGroups] = useState(true)

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    avatar_url: ''
  })

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/phone-login')
    }
  }, [user, authLoading, router])

  // Load profile data into form
  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        email: profile.email || '',
        avatar_url: profile.avatar_url || ''
      })
    }
  }, [profile])

  // Fetch joined groups
  useEffect(() => {
    async function fetchGroups() {
      if (!user) return

      try {
        setLoadingGroups(true)
        const supabase = getSupabaseClient()
        const { data, error } = await supabase
          .from('group_members')
          .select(`
            id,
            joined_at,
            property_groups (
              id,
              total_slots,
              filled_slots,
              is_locked,
              properties (
                id,
                title,
                location,
                slug,
                main_image
              )
            )
          `)
          .eq('user_id', user.id)

        if (error) throw error
        setJoinedGroups(data || [])
      } catch (error) {
        console.error('Error fetching joined groups:', error)
      } finally {
        setLoadingGroups(false)
      }
    }

    if (user) {
      fetchGroups()
    }
  }, [user])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleAvatarClick = () => {
    if (isEditing) {
      fileInputRef.current?.click()
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be less than 2MB')
      return
    }

    try {
      setUploadingAvatar(true)
      const supabase = getSupabaseClient()

      // Create unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${user?.id}-${Date.now()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      // Upload to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('coventures')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('coventures')
        .getPublicUrl(filePath)

      setFormData(prev => ({ ...prev, avatar_url: publicUrl }))
      toast.success('Avatar uploaded! Click Save to apply changes.')
    } catch (error) {
      console.error('Avatar upload error:', error)
      toast.error('Failed to upload avatar')
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleSave = async () => {
    if (!user) return

    // Validation
    if (!formData.full_name.trim()) {
      toast.error('Please enter your name')
      return
    }

    if (!formData.email.trim()) {
      toast.error('Please enter your email')
      return
    }

    try {
      setSaving(true)
      const supabase = getSupabaseClient()

      const { error } = await supabase
        .from('users')
        // @ts-expect-error - Supabase type inference issue
        .update({
          full_name: formData.full_name.trim(),
          email: formData.email.trim(),
          avatar_url: formData.avatar_url || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (error) throw error

      // Refresh profile in context
      await refreshProfile()

      setIsEditing(false)
      toast.success('Profile updated successfully!')
    } catch (error: any) {
      console.error('Profile update error:', error)
      toast.error(error.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    // Reset form to current profile data
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        email: profile.email || '',
        avatar_url: profile.avatar_url || ''
      })
    }
    setIsEditing(false)
  }

  // Show loading state
  if (authLoading) {
    return (
      <>
        <Header />
        <main className="pt-20 min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coral"></div>
        </main>
        <Footer />
      </>
    )
  }

  // Don't render if not logged in
  if (!user || !profile) {
    return null
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <>
      <Header />
      <main className="pt-20 min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="relative h-[30vh] min-h-[200px] flex items-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <Image
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1920&q=80"
              alt="Profile"
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
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 drop-shadow-2xl">
                My Profile
              </h1>
              <p className="text-lg text-white/80">
                Manage your account details and preferences
              </p>
            </motion.div>
          </div>
        </section>

        {/* Profile Content */}
        <section className="py-12">
          <div className="container mx-auto px-6 md:px-10 lg:px-20 max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="shadow-xl">
                <CardHeader className="border-b bg-gray-50/50">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <CardTitle className="text-2xl">Profile Information</CardTitle>
                      <CardDescription>
                        View and update your personal details
                      </CardDescription>
                    </div>
                    {!isEditing ? (
                      <Button onClick={() => setIsEditing(true)}>
                        Edit Profile
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={handleCancel} disabled={saving}>
                          Cancel
                        </Button>
                        <Button onClick={handleSave} disabled={saving}>
                          {saving ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="w-4 h-4 mr-2" />
                              Save Changes
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="pt-8">
                  <div className="space-y-8">
                    {/* Avatar Section */}
                    <div className="flex flex-col items-center">
                      <div
                        className={`relative w-32 h-32 rounded-full overflow-hidden bg-gray-200 border-4 border-white shadow-lg ${isEditing ? 'cursor-pointer hover:opacity-80' : ''}`}
                        onClick={handleAvatarClick}
                      >
                        {formData.avatar_url ? (
                          <Image
                            src={formData.avatar_url}
                            alt="Profile Avatar"
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-coral-light">
                            <User className="w-16 h-16 text-coral" />
                          </div>
                        )}

                        {uploadingAvatar && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <Loader2 className="w-8 h-8 text-white animate-spin" />
                          </div>
                        )}

                        {isEditing && !uploadingAvatar && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                            <Camera className="w-8 h-8 text-white" />
                          </div>
                        )}
                      </div>

                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarUpload}
                      />

                      {isEditing && (
                        <p className="text-sm text-gray-500 mt-2">
                          Click on avatar to upload a new photo
                        </p>
                      )}

                      <h2 className="text-xl font-semibold mt-4">
                        {profile.full_name || 'User'}
                      </h2>
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-coral-light text-coral rounded-full text-sm font-medium mt-2">
                        <Shield className="w-3 h-3" />
                        {profile.role === 'super_admin' ? 'Super Admin' : profile.role === 'admin' ? 'Admin' : 'Member'}
                      </span>
                    </div>

                    {/* Form Fields */}
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Full Name */}
                      <div className="space-y-2">
                        <Label htmlFor="full_name" className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          Full Name
                        </Label>
                        {isEditing ? (
                          <Input
                            id="full_name"
                            value={formData.full_name}
                            onChange={(e) => handleInputChange('full_name', e.target.value)}
                            placeholder="Enter your full name"
                          />
                        ) : (
                          <p className="py-2 px-3 bg-gray-50 rounded-md text-charcoal">
                            {profile.full_name || '-'}
                          </p>
                        )}
                      </div>

                      {/* Email */}
                      <div className="space-y-2">
                        <Label htmlFor="email" className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          Email Address
                        </Label>
                        {isEditing ? (
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            placeholder="Enter your email"
                          />
                        ) : (
                          <p className="py-2 px-3 bg-gray-50 rounded-md text-charcoal">
                            {profile.email || '-'}
                          </p>
                        )}
                      </div>

                      {/* Phone (Read-only) */}
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-400" />
                          Mobile Number
                          <span className="ml-1 inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-xs">
                            <Lock className="w-3 h-3" />
                            Cannot be changed
                          </span>
                        </Label>
                        <div className="relative">
                          <p className="py-2 px-3 bg-gray-100 rounded-md text-gray-600 cursor-not-allowed">
                            {profile.phone || 'Not provided'}
                          </p>
                          {isEditing && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                              <Lock className="w-4 h-4 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">
                          Phone number is linked to your account and cannot be modified for security reasons.
                        </p>
                      </div>

                      {/* Member Since */}
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          Member Since
                        </Label>
                        <p className="py-2 px-3 bg-gray-50 rounded-md text-charcoal">
                          {formatDate(profile.created_at)}
                        </p>
                      </div>
                    </div>

                    {/* Info Banner */}
                    {isEditing && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg"
                      >
                        <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-blue-800">Profile Update</p>
                          <p className="text-sm text-blue-600">
                            You can update your name, email, and profile photo. Your mobile number cannot be changed as it's your primary login credential.
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Account Stats Card */}
              <Card className="mt-6 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">Account Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-coral">0</p>
                      <p className="text-sm text-gray-600">Properties Saved</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-coral">0</p>
                      <p className="text-sm text-gray-600">Enquiries Made</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-coral">0</p>
                      <p className="text-sm text-gray-600">Properties Viewed</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-coral">
                        {Math.floor((new Date().getTime() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24))}
                      </p>
                      <p className="text-sm text-gray-600">Days Active</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Joined Groups Card */}
              <Card className="mt-6 shadow-lg overflow-hidden">
                <CardHeader className="bg-gray-50/50 border-b">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-coral" />
                    <CardTitle className="text-xl">My Property Groups</CardTitle>
                  </div>
                  <CardDescription>
                    Property co-ventures you've joined or been added to
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  {loadingGroups ? (
                    <div className="p-12 flex justify-center">
                      <Loader2 className="w-8 h-8 text-coral animate-spin" />
                    </div>
                  ) : joinedGroups.length > 0 ? (
                    <div className="divide-y">
                      {joinedGroups.map((membership) => {
                        const group = membership.property_groups
                        const property = group?.properties

                        return (
                          <div key={membership.id} className="p-6 hover:bg-gray-50 transition-colors">
                            <div className="flex flex-col md:flex-row gap-6">
                              {/* Property Thumbnail */}
                              <div className="relative w-full md:w-32 h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                {property?.main_image ? (
                                  <Image
                                    src={property.main_image}
                                    alt={property.title}
                                    fill
                                    className="object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                    <MapPin className="w-6 h-6 text-gray-400" />
                                  </div>
                                )}
                              </div>

                              {/* Group Details */}
                              <div className="flex-grow space-y-2">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                  <h3 className="text-lg font-bold text-gray-900">
                                    {property?.title || 'Unknown Property'}
                                  </h3>
                                  <Link
                                    href={`/properties/${property?.slug || property?.id}`}
                                    className="inline-flex items-center gap-1 text-sm text-coral hover:underline font-medium"
                                  >
                                    View Property
                                    <ExternalLink className="w-3 h-3" />
                                  </Link>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                  <div className="flex items-center gap-1">
                                    <MapPin className="w-4 h-4" />
                                    {property?.location || 'Unknown Location'}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    Joined {formatDate(membership.joined_at)}
                                  </div>
                                </div>

                                {/* Slot Info */}
                                <div className="mt-4 space-y-1">
                                  <div className="flex justify-between items-center text-xs font-medium uppercase tracking-wider text-gray-400">
                                    <span>Group Capacity</span>
                                    <span>{group?.filled_slots} of {group?.total_slots} Slots Filled</span>
                                  </div>
                                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-coral transition-all duration-500"
                                      style={{ width: `${(group?.filled_slots / group?.total_slots) * 100}%` }}
                                    />
                                  </div>
                                </div>
                              </div>

                              {/* Status Badge */}
                              <div className="flex-shrink-0">
                                {group?.is_locked ? (
                                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold border border-amber-200">
                                    <Lock className="w-3 h-3" />
                                    GROUP LOCKED
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold border border-green-200">
                                    <CheckCircle className="w-3 h-3" />
                                    ACTIVE GROUP
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="p-12 text-center">
                      <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mb-4">
                        <Users className="w-6 h-6 text-gray-400" />
                      </div>
                      <p className="text-gray-500 font-medium italic">You haven't joined any property groups yet.</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-4"
                        onClick={() => router.push('/properties')}
                      >
                        Explore Properties
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
