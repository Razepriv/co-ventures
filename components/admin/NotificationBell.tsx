"use client"

import { useState, useEffect } from 'react'
import { getSupabaseClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/auth/AuthProvider'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Bell, Check, Mail, Users, UserPlus, Home, TrendingUp } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface Notification {
    id: string
    type: 'enquiry' | 'lead' | 'contact' | 'group_member' | 'user_registration' | 'property_update'
    title: string
    message: string | null
    link: string | null
    is_read: boolean
    created_at: string
}

const notificationIcons = {
    enquiry: Mail,
    lead: TrendingUp,
    contact: Mail,
    group_member: Users,
    user_registration: UserPlus,
    property_update: Home,
}

const notificationColors = {
    enquiry: 'text-blue-600',
    lead: 'text-green-600',
    contact: 'text-purple-600',
    group_member: 'text-amber-600',
    user_registration: 'text-coral',
    property_update: 'text-indigo-600',
}

export function NotificationBell() {
    const { profile } = useAuth()
    const router = useRouter()
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [open, setOpen] = useState(false)

    useEffect(() => {
        if (!profile?.id) return

        fetchNotifications()

        // Real-time subscription
        const supabase = getSupabaseClient()
        const channel = supabase
            .channel('notifications_changes')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'notifications',
                filter: `user_id=eq.${profile.id}`
            }, (payload) => {
                if (payload.eventType === 'INSERT') {
                    // Show toast for new notification
                    const newNotif = payload.new as Notification
                    toast.info(newNotif.title, {
                        description: newNotif.message || undefined,
                    })
                }
                fetchNotifications()
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [profile?.id])

    async function fetchNotifications() {
        if (!profile?.id) return

        try {
            const supabase = getSupabaseClient()
            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', profile.id)
                .order('created_at', { ascending: false })
                .limit(10)

            if (error) throw error

            setNotifications(data || [])
            setUnreadCount(data?.filter(n => !n.is_read).length || 0)
        } catch (error) {
            console.error('Error fetching notifications:', error)
        }
    }

    async function markAsRead(id: string) {
        try {
            const supabase = getSupabaseClient()
            const { error } = await supabase
                .from('notifications')
                // @ts-ignore
                .update({ is_read: true })
                .eq('id', id)

            if (error) throw error

            fetchNotifications()
        } catch (error) {
            console.error('Error marking notification as read:', error)
        }
    }

    async function markAllAsRead() {
        if (!profile?.id) return

        try {
            const supabase = getSupabaseClient()
            const { error } = await supabase
                .from('notifications')
                // @ts-ignore
                .update({ is_read: true })
                .eq('user_id', profile.id)
                .eq('is_read', false)

            if (error) throw error

            toast.success('All notifications marked as read')
            fetchNotifications()
        } catch (error) {
            console.error('Error marking all as read:', error)
            toast.error('Failed to mark notifications as read')
        }
    }

    function handleNotificationClick(notification: Notification) {
        markAsRead(notification.id)
        if (notification.link) {
            router.push(notification.link)
            setOpen(false)
        }
    }

    if (!profile) return null

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <Badge
                            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-coral text-white text-xs"
                        >
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </Badge>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel className="flex items-center justify-between">
                    <span>Notifications</span>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={markAllAsRead}
                            className="h-auto p-1 text-xs"
                        >
                            <Check className="h-3 w-3 mr-1" />
                            Mark all read
                        </Button>
                    )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                {notifications.length === 0 ? (
                    <div className="py-8 text-center text-sm text-gray-500">
                        No notifications
                    </div>
                ) : (
                    <div className="max-h-96 overflow-y-auto">
                        {notifications.map((notification) => {
                            const Icon = notificationIcons[notification.type]
                            const iconColor = notificationColors[notification.type]

                            return (
                                <DropdownMenuItem
                                    key={notification.id}
                                    className={`flex items-start gap-3 p-3 cursor-pointer ${!notification.is_read ? 'bg-blue-50' : ''
                                        }`}
                                    onClick={() => handleNotificationClick(notification)}
                                >
                                    <div className={`mt-0.5 ${iconColor}`}>
                                        <Icon className="h-4 w-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm ${!notification.is_read ? 'font-semibold' : 'font-medium'} text-gray-900`}>
                                            {notification.title}
                                        </p>
                                        {notification.message && (
                                            <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">
                                                {notification.message}
                                            </p>
                                        )}
                                        <p className="text-xs text-gray-400 mt-1">
                                            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                                        </p>
                                    </div>
                                    {!notification.is_read && (
                                        <div className="h-2 w-2 rounded-full bg-coral flex-shrink-0 mt-2"></div>
                                    )}
                                </DropdownMenuItem>
                            )
                        })}
                    </div>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
