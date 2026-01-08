'use client'

import { SWRConfig } from 'swr'

/**
 * Global SWR configuration provider
 * Wrap your app with this component to set global SWR options
 */
export function SWRProvider({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig
      value={{
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        shouldRetryOnError: false,
        dedupingInterval: 2000,
        errorRetryCount: 3,
        errorRetryInterval: 5000,
        onError: (error, key) => {
          console.error(`SWR Error [${key}]:`, error)
          // TODO: Send to error tracking service (Sentry)
        },
      }}
    >
      {children}
    </SWRConfig>
  )
}
