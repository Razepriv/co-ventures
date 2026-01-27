"use client"

import { useEffect, useRef } from 'react'
import { getSupabaseClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export function useRealtimeSubscription<T = any>({
  table,
  event = '*',
  filter,
  onInsert,
  onUpdate,
  onDelete,
  onError,
  enabled = true,
}: {
  table: string
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*'
  filter?: string
  onInsert?: (payload: T) => void
  onUpdate?: (payload: { old: T; new: T }) => void
  onDelete?: (payload: T) => void
  onError?: (error: Error) => void
  enabled?: boolean
}) {
  const channelRef = useRef<any>(null)
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

  useEffect(() => {
    if (!enabled) return

    const supabase = getSupabaseClient()
    const safeFilter = filter ? filter.replace(/[^a-zA-Z0-9]/g, '-') : 'all'
    const channelName = `${table}-${safeFilter}-changes`

    const channel = supabase.channel(channelName)

    channel
      .on(
        'postgres_changes' as any,
        {
          event,
          schema: 'public',
          table,
          ...(filter && { filter }),
        },
        (payload: any) => {
          try {
            if (payload.eventType === 'INSERT' && onInsertRef.current) {
              onInsertRef.current(payload.new as T)
            } else if (payload.eventType === 'UPDATE' && onUpdateRef.current) {
              onUpdateRef.current({ old: payload.old as T, new: payload.new as T })
            } else if (payload.eventType === 'DELETE' && onDeleteRef.current) {
              onDeleteRef.current(payload.old as T)
            }
          } catch (error) {
            console.error('[Realtime] Error handling event:', error)
            onErrorRef.current?.(error as Error)
          }
        }
      )
      .subscribe((status: string, err: any) => {
        if (status === 'SUBSCRIBED') {
          console.log(`[Realtime] Subscribed to ${table}`)
        } else if (status === 'CHANNEL_ERROR') {
          console.error(`[Realtime] Channel error for ${table}:`, err)
          onErrorRef.current?.(new Error(`Channel error: ${err}`))
        }
      })

    channelRef.current = channel

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [table, event, filter, enabled])
}

// Specialized hook for enquiry notifications
export function useEnquiryNotifications(enabled: boolean = true) {
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (!enabled) return
    const beepSound = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBCl+z/PQeC0GK3nI8dygRw'
    audioRef.current = new Audio(beepSound)
  }, [enabled])

  useRealtimeSubscription({
    table: 'enquiries',
    event: 'INSERT',
    enabled,
    onInsert: (enquiry: any) => {
      toast.success('New Enquiry Received!', {
        description: `${enquiry.full_name} - ${enquiry.property_id ? 'Property Enquiry' : 'General Enquiry'}`,
        action: {
          label: 'View',
          onClick: () => {
            window.location.href = `/admin/enquiries/${enquiry.id}`
          },
        },
      })

      audioRef.current?.play().catch((e) => {
        console.warn('[Notifications] Sound play failed:', e)
      })

      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('New Enquiry', {
          body: `${enquiry.full_name} sent an enquiry`,
          icon: '/logo.svg',
          tag: `enquiry-${enquiry.id}`,
        })
      }
    },
  })

  // Request notification permission
  useEffect(() => {
    if (!enabled) return
    if ('Notification' in window && typeof Notification !== 'undefined' && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [enabled])
}
