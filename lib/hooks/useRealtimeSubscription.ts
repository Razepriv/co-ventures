"use client"

import { useEffect, useRef } from 'react'
import { getSupabaseClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

// Debounce helper
function debounce<T extends (...args: any[]) => any>(fn: T, delay: number): T {
  let timeoutId: NodeJS.Timeout | null = null
  return ((...args: Parameters<T>) => {
    if (timeoutId) clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }) as T
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
  debounceMs = 500, // Default 500ms debounce to prevent rapid refetches
}: {
  table: string
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*'
  filter?: string
  onInsert?: (payload: T) => void
  onUpdate?: (payload: { old: T; new: T }) => void
  onDelete?: (payload: T) => void
  onError?: (error: Error) => void
  enabled?: boolean
  debounceMs?: number
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

  // Create debounced handlers
  const debouncedInsertRef = useRef<((payload: T) => void) | null>(null)
  const debouncedUpdateRef = useRef<((payload: { old: T; new: T }) => void) | null>(null)
  const debouncedDeleteRef = useRef<((payload: T) => void) | null>(null)

  useEffect(() => {
    if (debounceMs > 0) {
      debouncedInsertRef.current = debounce((payload: T) => onInsertRef.current?.(payload), debounceMs)
      debouncedUpdateRef.current = debounce((payload: { old: T; new: T }) => onUpdateRef.current?.(payload), debounceMs)
      debouncedDeleteRef.current = debounce((payload: T) => onDeleteRef.current?.(payload), debounceMs)
    }
  }, [debounceMs])

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
            const useDebounced = debounceMs > 0

            if (payload.eventType === 'INSERT') {
              if (useDebounced && debouncedInsertRef.current) {
                debouncedInsertRef.current(payload.new as T)
              } else {
                onInsertRef.current?.(payload.new as T)
              }
            } else if (payload.eventType === 'UPDATE') {
              if (useDebounced && debouncedUpdateRef.current) {
                debouncedUpdateRef.current({ old: payload.old as T, new: payload.new as T })
              } else {
                onUpdateRef.current?.({ old: payload.old as T, new: payload.new as T })
              }
            } else if (payload.eventType === 'DELETE') {
              if (useDebounced && debouncedDeleteRef.current) {
                debouncedDeleteRef.current(payload.old as T)
              } else {
                onDeleteRef.current?.(payload.old as T)
              }
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
  }, [table, event, filter, enabled, debounceMs])
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
