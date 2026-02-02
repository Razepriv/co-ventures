"use client"

import { useEffect, useRef } from 'react'
import { RealtimeChannel } from '@supabase/supabase-js'
import { getSupabaseClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

type RealtimeEvent = 'INSERT' | 'UPDATE' | 'DELETE' | '*'

interface UseRealtimeSubscriptionOptions<T> {
  table: string
  event?: RealtimeEvent
  filter?: string
  onInsert?: (payload: T) => void
  onUpdate?: (payload: { old: T; new: T }) => void
  onDelete?: (payload: T) => void
  onError?: (error: Error) => void
  enabled?: boolean
}

export function useRealtimeSubscription<T = any>({
  table,
  event = '*',
  filter,
  onInsert,
  onUpdate,
  onDelete,
  onError,
  enabled = true,
}: UseRealtimeSubscriptionOptions<T>) {
  const channelRef = useRef<RealtimeChannel | null>(null)

  useEffect(() => {
    if (!enabled) return

    const supabase = getSupabaseClient()
    // Create channel
    const channel = supabase.channel(`${table}-changes`)

    // Build subscription filter
    let subscription = channel.on(
      'postgres_changes' as any,
      {
        event,
        schema: 'public',
        table,
        ...(filter && { filter }),
      },
      (payload: any) => {
        try {
          if (payload.eventType === 'INSERT' && onInsert) {
            onInsert(payload.new as T)
          } else if (payload.eventType === 'UPDATE' && onUpdate) {
            onUpdate({ old: payload.old as T, new: payload.new as T })
          } else if (payload.eventType === 'DELETE' && onDelete) {
            onDelete(payload.old as T)
          }
        } catch (error) {
          console.error('[Realtime] Error handling event:', error)
          onError?.(error as Error)
        }
      }
    )

    // Subscribe
    subscription.subscribe((status, err) => {
      if (status === 'SUBSCRIBED') {
        console.log(`[Realtime] Subscribed to ${table}`)
      } else if (status === 'CHANNEL_ERROR') {
        console.error(`[Realtime] Channel error for ${table}:`, err)
        toast.error('Real-time connection error. Using polling instead.')
        onError?.(new Error(`Channel error: ${err}`))
      } else if (status === 'TIMED_OUT') {
        console.error(`[Realtime] Subscription timed out for ${table}`)
        toast.warning('Real-time connection slow. Retrying...')
      } else if (status === 'CLOSED') {
        console.log(`[Realtime] Channel closed for ${table}`)
      }
    })

    channelRef.current = channel

    // Cleanup
    return () => {
      if (channelRef.current) {
        console.log(`[Realtime] Unsubscribing from ${table}`)
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [table, event, filter, onInsert, onUpdate, onDelete, onError, enabled])

  return {
    channel: channelRef.current,
    unsubscribe: () => {
      if (channelRef.current) {
        const supabase = getSupabaseClient()
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    },
  }
}

// Specialized hook for enquiry notifications
export function useEnquiryNotifications() {
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    // Create notification sound using data URI (base64 encoded beep sound)
    // This is a simple notification beep
    const beepSound = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBCl+z/PQeC0GK3nI8dygRw'
    audioRef.current = new Audio(beepSound)
  }, [])

  useRealtimeSubscription({
    table: 'enquiries',
    event: 'INSERT',
    onInsert: (enquiry: any) => {
      // Show toast notification
      toast.success('New Enquiry Received!', {
        description: `${enquiry.full_name} - ${enquiry.property_id ? 'Property Enquiry' : 'General Enquiry'}`,
        action: {
          label: 'View',
          onClick: () => {
            window.location.href = `/admin/enquiries/${enquiry.id}`
          },
        },
      })

      // Play notification sound
      audioRef.current?.play().catch((e) => {
        console.error('[Notifications] Failed to play sound:', e)
      })

      // Show browser notification if permitted
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('New Enquiry', {
          body: `${enquiry.full_name} sent an enquiry`,
          icon: '/logo.svg',
          badge: '/logo.svg',
          tag: `enquiry-${enquiry.id}`,
          requireInteraction: true,
        })
      }
    },
    onError: (error) => {
      console.error('[Enquiry Notifications] Error:', error)
    },
  })

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          toast.success('Notifications enabled')
        }
      })
    }
  }, [])
}
