"use client"

import { useState, useEffect, useCallback } from 'react'
import { getSupabaseClient } from '@/lib/supabase/client'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Building2,
  Eye,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Download
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { format, subDays, subMonths, startOfMonth, endOfMonth } from 'date-fns'

interface AnalyticsData {
  properties: {
    total: number
    available: number
    sold: number
    growth: number
  }
  enquiries: {
    total: number
    thisMonth: number
    conversion: number
    growth: number
  }
  users: {
    total: number
    newThisMonth: number
    growth: number
  }
  revenue: {
    total: number
    thisMonth: number
    growth: number
  }
  topProperties: Array<{
    id: string
    title: string
    views: number
    enquiries: number
  }>
  revenueByMonth: Array<{
    month: string
    revenue: number
    properties: number
  }>
}

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true)
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [dateRange, setDateRange] = useState('30')

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true)
      const supabase = getSupabaseClient()

      const days = parseInt(dateRange)
      const startDate = subDays(new Date(), days)
      const prevStartDate = subDays(startDate, days)

      // Fetch all data in parallel
      const [
        { count: totalProperties },
        { count: availableProperties },
        { count: soldProperties },
        { count: prevProperties },
        { count: totalEnquiries },
        { count: thisMonthEnquiries },
        { count: prevEnquiries },
        { count: totalUsers },
        { count: newUsers },
        { count: prevUsers },
        { data: soldProps },
        { data: prevSoldProps },
        { data: topProps },
        { data: monthlyRevenue }
      ] = await Promise.all([
        supabase.from('properties').select('*', { count: 'exact', head: true }),
        supabase.from('properties').select('*', { count: 'exact', head: true }).eq('status', 'available'),
        supabase.from('properties').select('*', { count: 'exact', head: true }).eq('status', 'sold'),
        supabase.from('properties').select('*', { count: 'exact', head: true }).lt('created_at', prevStartDate.toISOString()),
        supabase.from('enquiries').select('*', { count: 'exact', head: true }),
        supabase.from('enquiries').select('*', { count: 'exact', head: true }).gte('created_at', startOfMonth(new Date()).toISOString()),
        supabase.from('enquiries').select('*', { count: 'exact', head: true }).lt('created_at', prevStartDate.toISOString()),
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('users').select('*', { count: 'exact', head: true }).gte('created_at', startOfMonth(new Date()).toISOString()),
        supabase.from('users').select('*', { count: 'exact', head: true }).lt('created_at', prevStartDate.toISOString()),
        supabase.from('properties').select('price').eq('status', 'sold'),
        supabase.from('properties').select('price').eq('status', 'sold').lt('created_at', prevStartDate.toISOString()),
        supabase.from('properties').select('id, title, views').order('views', { ascending: false }).limit(5),
        supabase.from('properties').select('price, created_at').eq('status', 'sold').order('created_at', { ascending: true })
      ])

      // Calculate growth percentages
      const propertyGrowth = prevProperties ? ((totalProperties || 0) - (prevProperties || 0)) / (prevProperties || 1) * 100 : 0
      const enquiryGrowth = prevEnquiries ? ((totalEnquiries || 0) - (prevEnquiries || 0)) / (prevEnquiries || 1) * 100 : 0
      const userGrowth = prevUsers ? ((totalUsers || 0) - (prevUsers || 0)) / (prevUsers || 1) * 100 : 0

      // @ts-ignore
      const totalRevenue = soldProps?.reduce((sum, p) => sum + (p.price || 0), 0) || 0
      // @ts-ignore
      const prevRevenue = prevSoldProps?.reduce((sum, p) => sum + (p.price || 0), 0) || 0
      const revenueGrowth = prevRevenue ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : 0

      // Calculate conversion rate
      const conversion = totalEnquiries && soldProperties ? (soldProperties / totalEnquiries) * 100 : 0

      // Group revenue by month
      const revenueByMonth = monthlyRevenue?.reduce((acc: any[], prop: any) => {
        const month = format(new Date(prop.created_at), 'MMM yyyy')
        const existing = acc.find(item => item.month === month)
        if (existing) {
          existing.revenue += prop.price
          existing.properties += 1
        } else {
          acc.push({ month, revenue: prop.price, properties: 1 })
        }
        return acc
      }, []) || []

      setAnalytics({
        properties: {
          total: totalProperties || 0,
          available: availableProperties || 0,
          sold: soldProperties || 0,
          growth: propertyGrowth
        },
        enquiries: {
          total: totalEnquiries || 0,
          thisMonth: thisMonthEnquiries || 0,
          conversion,
          growth: enquiryGrowth
        },
        users: {
          total: totalUsers || 0,
          newThisMonth: newUsers || 0,
          growth: userGrowth
        },
        revenue: {
          total: totalRevenue,
          thisMonth: totalRevenue,
          growth: revenueGrowth
        },
        topProperties: topProps?.map((p: any) => ({
          id: p.id,
          title: p.title,
          views: p.views || 0,
          enquiries: 0
        })) || [],
        revenueByMonth: revenueByMonth.slice(-6)
      })
    } catch (error) {
      console.error('Error fetching analytics:', error)
      toast.error('Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }, [dateRange])

  useEffect(() => {
    fetchAnalytics()

    // Set up realtime subscriptions
    const supabase = getSupabaseClient()
    const channel = supabase
      .channel('analytics_updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'properties' }, () => {
        fetchAnalytics()
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'enquiries' }, () => {
        fetchAnalytics()
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, () => {
        fetchAnalytics()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchAnalytics])

  function exportData() {
    toast.info('Exporting analytics data...')
    // Will be implemented in export feature
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-coral"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="mt-1 text-sm text-gray-500">Real-time insights into your business performance</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={exportData} variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analytics?.revenue.total || 0)}</div>
            <div className="flex items-center text-xs">
              {analytics && analytics.revenue.growth >= 0 ? (
                <ArrowUpRight className="mr-1 h-3 w-3 text-green-600" />
              ) : (
                <ArrowDownRight className="mr-1 h-3 w-3 text-red-600" />
              )}
              <span className={analytics && analytics.revenue.growth >= 0 ? 'text-green-600' : 'text-red-600'}>
                {Math.abs(analytics?.revenue.growth || 0).toFixed(1)}%
              </span>
              <span className="text-muted-foreground ml-1">from last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Properties</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.properties.total}</div>
            <div className="flex items-center text-xs">
              {analytics && analytics.properties.growth >= 0 ? (
                <ArrowUpRight className="mr-1 h-3 w-3 text-green-600" />
              ) : (
                <ArrowDownRight className="mr-1 h-3 w-3 text-red-600" />
              )}
              <span className={analytics && analytics.properties.growth >= 0 ? 'text-green-600' : 'text-red-600'}>
                {Math.abs(analytics?.properties.growth || 0).toFixed(1)}%
              </span>
              <span className="text-muted-foreground ml-1">growth</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Enquiries</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.enquiries.total}</div>
            <div className="flex items-center text-xs">
              <span className="text-muted-foreground">
                {analytics?.enquiries.conversion.toFixed(1)}% conversion rate
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.users.total}</div>
            <div className="flex items-center text-xs">
              <span className="text-muted-foreground">
                +{analytics?.users.newThisMonth} this month
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Details */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="properties">Properties</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Property Status */}
            <Card>
              <CardHeader>
                <CardTitle>Property Distribution</CardTitle>
                <CardDescription>Current status of all properties</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Available</span>
                    <span className="text-2xl font-bold text-green-600">{analytics?.properties.available}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Sold</span>
                    <span className="text-2xl font-bold text-coral">{analytics?.properties.sold}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div
                      className="bg-coral h-4 rounded-full transition-all"
                      style={{
                        width: `${analytics?.properties.total ? (analytics.properties.sold / analytics.properties.total) * 100 : 0}%`
                      }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {analytics?.properties.total ? ((analytics.properties.sold / analytics.properties.total) * 100).toFixed(1) : 0}% properties sold
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Monthly Revenue Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trend</CardTitle>
                <CardDescription>Last 6 months performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics?.revenueByMonth.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{item.month}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{item.properties} props</span>
                        <span className="text-sm font-semibold">{formatCurrency(item.revenue)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="properties" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Properties</CardTitle>
              <CardDescription>Properties with highest views</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics?.topProperties.map((property, index) => (
                  <div key={property.id} className="flex items-center justify-between border-b pb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-bold text-gray-300">#{index + 1}</span>
                      <div>
                        <p className="font-medium">{property.title}</p>
                        <p className="text-sm text-muted-foreground">{property.views} views</p>
                      </div>
                    </div>
                    <Eye className="h-5 w-5 text-gray-400" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Total Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{formatCurrency(analytics?.revenue.total || 0)}</div>
                <p className="text-xs text-muted-foreground mt-2">All time</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>This Month</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{formatCurrency(analytics?.revenue.thisMonth || 0)}</div>
                <p className="text-xs text-muted-foreground mt-2">Current month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {analytics?.revenue.growth.toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground mt-2">Compared to last period</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
