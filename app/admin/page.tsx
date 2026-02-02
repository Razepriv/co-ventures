"use client"

import { useState, useEffect } from 'react'
import {
  Building2,
  MessageSquare,
  Users,
  TrendingUp,
  Activity,
  Plus,
  Eye,
  FileText,
  UserPlus,
  Home,
  Key,
  FileCheck,
  ArrowUpRight,
  ArrowDownRight,
  MapPin,
  Bed,
  Bath,
  Maximize,
  CalendarClock,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'
import { getSupabaseClient } from '@/lib/supabase/client'
import { formatDistanceToNow } from 'date-fns'
import Image from 'next/image'

interface Stats {
  totalProperties: number
  newEnquiries: number
  totalUsers: number
  revenue: number
  onSell: number
  totalLeases: number
  propertySold: number
}

interface ActivityLog {
  id: string
  action: string
  entity_type: string
  entity_id: string
  details: any
  created_at: string
  user?: {
    full_name: string
  }
}

interface Property {
  id: string
  title: string
  price: number
  featured_image: string | null
  bedrooms: number | null
  bathrooms: number | null
  area_sqft: number | null
  location: string | null
  status: string
  property_type: string | null
}

interface NewUser {
  id: string
  full_name: string
  email: string
  avatar_url: string | null
  created_at: string
}

interface SalesAnalytics {
  propertySold: number
  totalProperties: number
  soldPercentage: number
  availablePercentage: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalProperties: 0,
    newEnquiries: 0,
    totalUsers: 0,
    revenue: 0,
    onSell: 0,
    totalLeases: 0,
    propertySold: 0,
  })
  const [recentActivity, setRecentActivity] = useState<ActivityLog[]>([])
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([])
  const [newUsers, setNewUsers] = useState<NewUser[]>([])
  const [salesAnalytics, setSalesAnalytics] = useState<SalesAnalytics>({
    propertySold: 0,
    totalProperties: 0,
    soldPercentage: 0,
    availablePercentage: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  async function fetchDashboardData() {
    try {
      const supabase = getSupabaseClient()

      // Fetch all stats in parallel
      const [
        { count: totalProperties },
        { count: newEnquiriesCount },
        { count: totalUsers },
        { data: soldProperties },
        { count: onSellCount },
        { count: leasesCount },
        { count: propertySoldCount },
        { data: activityData },
        { data: propertiesData },
        { data: usersData },
      ] = await Promise.all([
        supabase.from('properties').select('*', { count: 'exact', head: true }),
        supabase
          .from('enquiries')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('properties').select('price').eq('status', 'sold'),
        supabase.from('properties').select('*', { count: 'exact', head: true }).eq('status', 'available'),
        supabase.from('properties').select('*', { count: 'exact', head: true }).eq('status', 'leased'),
        supabase.from('properties').select('*', { count: 'exact', head: true }).eq('status', 'sold'),
        supabase
          .from('activity_logs')
          .select(`
            id,
            action,
            entity_type,
            entity_id,
            details,
            created_at,
            user:users(full_name)
          `)
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('properties')
          .select('id, title, price, featured_image, bedrooms, bathrooms, area_sqft, location, status, property_type')
          .eq('is_featured', true)
          .order('created_at', { ascending: false })
          .limit(3),
        supabase
          .from('users')
          .select('id, full_name, email, avatar_url, created_at')
          .order('created_at', { ascending: false })
          .limit(4),
      ])

      // @ts-ignore
      const totalRevenue = soldProperties?.reduce((sum, prop) => sum + (prop.price || 0), 0) || 0

      // Calculate sales analytics
      const soldCount = propertySoldCount || 0
      const total = totalProperties || 1
      const soldPct = Math.round((soldCount / total) * 100)
      const availablePct = 100 - soldPct

      setStats({
        totalProperties: totalProperties || 0,
        newEnquiries: newEnquiriesCount || 0,
        totalUsers: totalUsers || 0,
        revenue: totalRevenue,
        onSell: onSellCount || 0,
        totalLeases: leasesCount || 0,
        propertySold: propertySoldCount || 0,
      })

      setSalesAnalytics({
        propertySold: soldCount,
        totalProperties: total,
        soldPercentage: soldPct,
        availablePercentage: availablePct,
      })

      setRecentActivity(activityData || [])
      setFeaturedProperties(propertiesData || [])
      setNewUsers(usersData || [])
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
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

  const statsData = [
    {
      name: 'Total Properties',
      value: stats.totalProperties,
      icon: Building2,
      change: '+2.5%',
      trend: 'up' as const,
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      name: 'On Sell',
      value: stats.onSell,
      icon: Home,
      change: '+1.5%',
      trend: 'up' as const,
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
    },
    {
      name: 'Total Leases',
      value: stats.totalLeases,
      icon: Key,
      change: '+1.2%',
      trend: 'up' as const,
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
    },
    {
      name: 'Property Sold',
      value: stats.propertySold,
      icon: FileCheck,
      change: '+3.1%',
      trend: 'up' as const,
      bgColor: 'bg-coral-light',
      iconColor: 'text-coral',
    },
  ]

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-coral border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Overview Stats */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Overview</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statsData.map((stat) => {
            const Icon = stat.icon
            const trendIcon = stat.trend === 'up' ? ArrowUpRight : ArrowDownRight
            const TrendIcon = trendIcon
            
            return (
              <div
                key={stat.name}
                className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`h-12 w-12 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                    <Icon className={`h-6 w-6 ${stat.iconColor}`} />
                  </div>
                  <div className={`flex items-center gap-1 text-sm font-medium ${
                    stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    <TrendIcon className="h-4 w-4" />
                    {stat.change}
                  </div>
                </div>
                <h3 className="text-gray-600 text-sm font-medium mb-1">{stat.name}</h3>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Properties On Sell & Sales Analytics */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* On Sell Properties */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">On Sell</h3>
            <Link href="/admin/properties">
              <Button variant="ghost" size="sm" className="text-coral hover:text-coral-dark hover:bg-coral-light">
                View All
              </Button>
            </Link>
          </div>
          <div className="space-y-4">
            {featuredProperties.length > 0 ? (
              featuredProperties.slice(0, 2).map((property) => (
                <Link key={property.id} href={`/admin/properties/${property.id}`}>
                  <div className="group rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-all cursor-pointer">
                    <div className="relative h-48 bg-gray-100">
                      {property.featured_image ? (
                        <Image
                          src={property.featured_image}
                          alt={property.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <Building2 className="h-12 w-12 text-gray-300" />
                        </div>
                      )}
                      <div className="absolute top-3 left-3 bg-coral text-white px-3 py-1 rounded-full text-xs font-semibold">
                        {property.property_type || 'Property'}
                      </div>
                    </div>
                    <div className="p-4">
                      <h4 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-coral transition-colors">
                        {property.title}
                      </h4>
                      <p className="text-2xl font-bold text-coral mb-3">{formatPrice(property.price)}</p>
                      {property.location && (
                        <div className="flex items-center text-sm text-gray-600 mb-3">
                          <MapPin className="h-4 w-4 mr-1" />
                          {property.location}
                        </div>
                      )}
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        {property.bedrooms && (
                          <div className="flex items-center gap-1">
                            <Bed className="h-4 w-4" />
                            {property.bedrooms} Bed
                          </div>
                        )}
                        {property.bathrooms && (
                          <div className="flex items-center gap-1">
                            <Bath className="h-4 w-4" />
                            {property.bathrooms} Bath
                          </div>
                        )}
                        {property.area_sqft && (
                          <div className="flex items-center gap-1">
                            <Maximize className="h-4 w-4" />
                            {property.area_sqft} Sqft
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">No featured properties available</p>
            )}
          </div>
        </div>

        {/* Sales Analytics */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Sales Analytics</h3>
          <div className="flex items-center justify-center mb-6">
            <div className="relative h-48 w-48">
              {/* Donut Chart */}
              <svg className="transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="15"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#f97316"
                  strokeWidth="15"
                  strokeDasharray={`${salesAnalytics.soldPercentage * 2.51} ${(100 - salesAnalytics.soldPercentage) * 2.51}`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-3xl font-bold text-gray-900">{salesAnalytics.soldPercentage}%</p>
                <p className="text-sm text-gray-600">Sold</p>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-coral-light rounded-lg">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full bg-coral"></div>
                <span className="text-sm font-medium text-gray-900">Property Sold</span>
              </div>
              <span className="text-sm font-bold text-coral">{salesAnalytics.soldPercentage}%</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full bg-gray-300"></div>
                <span className="text-sm font-medium text-gray-900">Available</span>
              </div>
              <span className="text-sm font-bold text-gray-600">{salesAnalytics.availablePercentage}%</span>
            </div>
          </div>
          <div className="mt-6 p-4 bg-gradient-to-r from-coral-light to-orange-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">{formatPrice(stats.revenue)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-coral" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity & New Users */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">Recent Activity</h3>
            <Activity className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                  <div className="h-10 w-10 rounded-full bg-coral-light flex items-center justify-center flex-shrink-0">
                    <Activity className="h-5 w-5 text-coral" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.user?.full_name || 'Unknown User'}
                    </p>
                    <p className="text-sm text-gray-600 truncate">
                      {activity.action} {activity.entity_type}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">No recent activity</p>
            )}
          </div>
        </div>

        {/* New Users */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">New Users</h3>
            <Link href="/admin/users">
              <Button variant="ghost" size="sm" className="text-coral hover:text-coral-dark hover:bg-coral-light">
                View All
              </Button>
            </Link>
          </div>
          <div className="space-y-4">
            {newUsers.length > 0 ? (
              newUsers.map((user) => (
                <div key={user.id} className="flex items-center gap-3 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-coral to-orange-500 flex items-center justify-center flex-shrink-0 text-white font-semibold text-sm">
                    {user.full_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{user.full_name}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Joined {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">No new users</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-coral to-orange-500 rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Link href="/admin/properties/new">
            <Button className="w-full !bg-white !text-coral hover:!bg-gray-50 !font-semibold !border-0">
              <Plus className="mr-2 h-4 w-4" />
              <span>Add Property</span>
            </Button>
          </Link>
          <Link href="/admin/enquiries">
            <Button className="w-full !bg-white !text-coral hover:!bg-gray-50 !font-semibold !border-0">
              <Eye className="mr-2 h-4 w-4" />
              <span>View Enquiries</span>
            </Button>
          </Link>
          <Link href="/admin/blog/new">
            <Button className="w-full !bg-white !text-coral hover:!bg-gray-50 !font-semibold !border-0">
              <FileText className="mr-2 h-4 w-4" />
              <span>Create Blog</span>
            </Button>
          </Link>
          <Link href="/admin/users/new">
            <Button className="w-full !bg-white !text-coral hover:!bg-gray-50 !font-semibold !border-0">
              <UserPlus className="mr-2 h-4 w-4" />
              <span>Add User</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
