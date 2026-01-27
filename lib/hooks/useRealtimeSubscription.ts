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
  const onInsertRef = useRef(onInsert)
  const onUpdateRef = useRef(onUpdate)
  const onDeleteRef = useRef(onDelete)
  const onErrorRef = useRef(onError)

  // Update refs when callbacks change
  useEffect(() => {
    onInsertRef.current = onInsert
    onUpdateRef.current = onUpdate
    onDeleteRef.current = onDelete
    onErrorRef.current = onError
  }, [onInsert, onUpdate, onDelete, onError])

  // Debug logging
  const renderCountRef = useRef(0)
  renderCountRef.current++

  useEffect(() => {
    if (!enabled) return

    const supabase = getSupabaseClient()
    // Create channel name
    const safeFilter = filter ? filter.replace(/[^a-zA-Z0-9]/g, '-') : 'all'
    const channelName = `${table}-${safeFilter}-changes`

    console.log(`[Realtime] 🔄 Effect Starting (#${renderCountRef.current})`, {
      table,
      event,
      filter,
      enabled,
      channelName
    })

    const channel = supabase.channel(channelName)

    // Build subscription filter
    const subscription = channel.on(
      'postgres_changes' as any,
      {
        event,
        schema: 'public',
        table,
        ...(filter && { filter }),
      },
      (payload: any) => {
        try {
          console.log(`[Realtime] 🔔 Notification received from ${table}:`, payload.eventType)
          if (payload.eventType === 'INSERT' && onInsertRef.current) {
            onInsertRef.current(payload.new as T)
          } else if (payload.eventType === 'UPDATE' && onUpdateRef.current) {
            onUpdateRef.current({ old: payload.old as T, new: payload.new as T })
          } else if (payload.eventType === 'DELETE' && onDeleteRef.current) {
            onDeleteRef.current(payload.old as T)
          }
        } catch (error) {
          console.error('[Realtime] ❌ Error handling event:', error)
          onErrorRef.current?.(error as Error)
        }
      }
    )

    // Subscribe
    subscription.subscribe((status, err) => {
      if (status === 'SUBSCRIBED') {
        console.log(`[Realtime] ✅ Subscribed to ${table}${filter ? ` with filter: ${filter}` : ''}`)
      } else if (status === 'CHANNEL_ERROR') {
        console.error(`[Realtime] ❌ Channel error for ${table}:`, err)
        // Removed toast.error to prevent potential re-render loops
        onErrorRef.current?.(new Error(`Channel error: ${err}`))
      } else if (status === 'TIMED_OUT') {
        console.warn(`[Realtime] ⏳ Subscription timed out for ${table}`)
      } else if (status === 'CLOSED') {
        console.log(`[Realtime] 🔒 Channel closed for ${table}`)
      }
    })

    channelRef.current = channel

    // Cleanup
    return () => {
      console.log(`[Realtime] 🧹 Effect Cleanup (#${renderCountRef.current}) for ${table}`)
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [table, event, filter, enabled])

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
export function useEnquiryNotifications(enabled: boolean = true) {
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (!enabled) return
    // Create notification sound using data URI (base64 encoded beep sound)
    const beepSound = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBCl+z/PQeC0GK3nI8dygRw'
    audioRef.current = new Audio(beepSound)
  }, [enabled])

  useRealtimeSubscription({
    table: 'enquiries',
    event: 'INSERT',
    enabled,
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
        console.warn('[Notifications] Sound play failed:', e)
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
      console.warn('[Realtime] Enquiry subscription error:', error)
    },
  })

  // Request notification permission
  useEffect(() => {
    if (!enabled) return
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          toast.success('Notifications enabled')
        }
      })
    }
  }, [enabled])
}
