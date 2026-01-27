'use client'

import { useAuth } from '@/lib/auth/AuthProvider'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useEnquiryNotifications } from '@/lib/hooks/useRealtimeSubscription'
import { getSupabaseClient } from '@/lib/supabase/client'
import {
  LayoutDashboard,
  Building2,
  MessageSquare,
  Users,
  FileText,
  Star,
  BarChart3,
  Image,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Bell,
  Search,
  X,
  Check,
  TrendingUp,
  Mail,
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { formatDistanceToNow } from 'date-fns'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  link?: string
  is_read: boolean
  created_at: string
}

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Properties', href: '/admin/properties', icon: Building2 },
  { name: 'Leads & Enquiries', href: '/admin/leads', icon: TrendingUp },
  { name: 'Groups', href: '/admin/groups', icon: Users },
  { name: 'Contacts', href: '/admin/contacts', icon: MessageSquare },
  { name: 'Developers', href: '/admin/developers', icon: Building2 },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Blog', href: '/admin/blog', icon: FileText },
  { name: 'Testimonials', href: '/admin/testimonials', icon: Star },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { name: 'Media', href: '/admin/media', icon: Image },
  { name: 'AI Configuration', href: '/admin/ai-configuration', icon: Settings },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, profile, loading, signOut } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [loadingNotifications, setLoadingNotifications] = useState(false)

  // Enable realtime enquiry notifications - only when loaded and user is present
  useEnquiryNotifications(!loading && !!user)

  // Fetch notifications
  async function fetchNotifications() {
    try {
      setLoadingNotifications(true)
      const supabase = getSupabaseClient()

      // Fetch recent enquiries as notifications
      const { data: enquiries } = await supabase
        .from('enquiries')
        .select('id, full_name, email, message, property_id, created_at, status')
        .order('created_at', { ascending: false })
        .limit(10)

      if (enquiries) {
        const notifs: Notification[] = enquiries.map((e: any) => ({
          id: e.id,
          type: 'enquiry',
          title: 'New Enquiry',
          message: `${e.full_name} sent an enquiry`,
          link: '/admin/enquiries',
          is_read: e.status === 'resolved',
          created_at: e.created_at,
        }))
        setNotifications(notifs)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoadingNotifications(false)
    }
  }

  useEffect(() => {
    if (user && profile) {
      fetchNotifications()
    }
  }, [user, profile])

  useEffect(() => {
    if (!loading && (!user || !profile || (profile.role !== 'admin' && profile.role !== 'super_admin'))) {
      router.push('/auth/login')
    }
  }, [user, profile, loading, router])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-coral"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user || !profile || (profile.role !== 'admin' && profile.role !== 'super_admin')) {
    return null
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Dark Sidebar */}
      <aside
        className={`flex flex-col bg-charcoal text-white transition-all duration-300 shadow-xl ${sidebarCollapsed ? 'w-20' : 'w-64'
          }`}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-gray-700">
          {!sidebarCollapsed && (
            <Link href="/admin" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-coral flex items-center justify-center">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold">Co Housing</span>
            </Link>
          )}
          {sidebarCollapsed && (
            <div className="h-8 w-8 rounded-lg bg-coral flex items-center justify-center mx-auto">
              <Building2 className="h-5 w-5 text-white" />
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${isActive
                  ? 'bg-coral text-white shadow-lg shadow-coral/30'
                  : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                  }`}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {!sidebarCollapsed && <span>{item.name}</span>}
              </Link>
            )
          })}
        </nav>

        {/* Collapse Toggle */}
        <div className="border-t border-gray-700 p-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="w-full text-gray-300 hover:text-white hover:bg-gray-700/50"
          >
            {sidebarCollapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <>
                <ChevronLeft className="h-5 w-5 mr-2" />
                Collapse
              </>
            )}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-16 items-center justify-between bg-white border-b border-gray-200 px-6 shadow-sm">
          {/* Search */}
          <div className="flex flex-1 items-center">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search properties, users, enquiries..."
                className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-10 pr-4 text-sm focus:border-coral focus:bg-white focus:outline-none focus:ring-2 focus:ring-coral/20"
              />
            </div>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {/* Notifications */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                className="relative hover:bg-gray-100"
                onClick={() => {
                  setShowNotifications(!showNotifications)
                  if (!showNotifications) fetchNotifications()
                }}
              >
                <Bell className="h-5 w-5 text-gray-600" />
                {notifications.filter(n => !n.is_read).length > 0 && (
                  <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
                )}
              </Button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
                    <h3 className="font-semibold text-gray-900">Notifications</h3>
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="max-h-96 overflow-y-auto">
                    {loadingNotifications ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-coral"></div>
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No notifications</p>
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <Link
                          key={notif.id}
                          href={notif.link || '#'}
                          onClick={() => setShowNotifications(false)}
                          className={`block px-4 py-3 hover:bg-gray-50 border-b last:border-b-0 transition-colors ${!notif.is_read ? 'bg-coral/5' : ''
                            }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${notif.is_read ? 'bg-gray-300' : 'bg-coral'
                              }`} />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm text-gray-900 truncate">
                                {notif.title}
                              </p>
                              <p className="text-sm text-gray-600 truncate">
                                {notif.message}
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
                              </p>
                            </div>
                          </div>
                        </Link>
                      ))
                    )}
                  </div>

                  <Link
                    href="/admin/enquiries"
                    onClick={() => setShowNotifications(false)}
                    className="block text-center py-3 text-sm text-coral font-medium hover:bg-gray-50 border-t"
                  >
                    View All Enquiries
                  </Link>
                </div>
              )}
            </div>

            {/* Profile Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 hover:bg-gray-100">
                  <div className="h-9 w-9 rounded-full bg-coral text-white flex items-center justify-center font-semibold text-sm">
                    {profile.full_name?.[0]?.toUpperCase() || 'A'}
                  </div>
                  {!sidebarCollapsed && (
                    <div className="text-left">
                      <p className="text-sm font-medium text-gray-900">{profile.full_name}</p>
                      <p className="text-xs text-gray-500 capitalize">{profile.role}</p>
                    </div>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <p className="text-sm font-medium">{profile.full_name}</p>
                    <p className="text-xs text-gray-500">{profile.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/admin/profile">My Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/admin/settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => signOut()}
                  className="text-red-600 focus:text-red-600"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Log Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50">{children}</main>
      </div>
    </div>
  )
}
