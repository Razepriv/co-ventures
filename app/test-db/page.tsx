"use client"

import { useEffect, useState } from 'react'
import { getSupabaseClient } from '@/lib/supabase/client'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'

export default function DatabaseTestPage() {
  const [status, setStatus] = useState<'checking' | 'success' | 'error'>('checking')
  const [message, setMessage] = useState('Checking database connection...')
  const [tables, setTables] = useState<any[]>([])

  useEffect(() => {
    checkDatabase()
  }, [])

  async function checkDatabase() {
    try {
      const supabase = getSupabaseClient()
      
      // Try to fetch from categories table
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .limit(10)

      if (error) {
        setStatus('error')
        setMessage(`Database Error: ${error.message}`)
        return
      }

      setStatus('success')
      setMessage(`✅ Successfully connected! Found ${data?.length || 0} categories`)
      setTables(data || [])
    } catch (err) {
      setStatus('error')
      setMessage(`Connection Error: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Database Connection Test</h1>
        
        <div className="rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex items-center gap-4">
            {status === 'checking' && (
              <>
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <div>
                  <h2 className="text-xl font-semibold">Checking...</h2>
                  <p className="text-gray-600">{message}</p>
                </div>
              </>
            )}
            
            {status === 'success' && (
              <>
                <CheckCircle2 className="h-8 w-8 text-green-600" />
                <div>
                  <h2 className="text-xl font-semibold text-green-900">Connected!</h2>
                  <p className="text-green-700">{message}</p>
                </div>
              </>
            )}
            
            {status === 'error' && (
              <>
                <XCircle className="h-8 w-8 text-red-600" />
                <div>
                  <h2 className="text-xl font-semibold text-red-900">Connection Failed</h2>
                  <p className="text-red-700">{message}</p>
                </div>
              </>
            )}
          </div>

          {status === 'success' && tables.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">Categories Found:</h3>
              <div className="space-y-2">
                {tables.map((cat: any) => (
                  <div
                    key={cat.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded border"
                  >
                    <div>
                      <span className="font-medium">{cat.name}</span>
                      <span className="ml-2 text-sm text-gray-500">({cat.slug})</span>
                    </div>
                    <span className="text-sm text-gray-600">{cat.icon}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {status === 'success' && (
            <div className="mt-8 p-4 bg-green-50 rounded border border-green-200">
              <h3 className="font-semibold text-green-900 mb-2">✅ All Systems Operational</h3>
              <p className="text-sm text-green-800 mb-2">
                Your database is ready! You can now:
              </p>
              <ul className="list-disc list-inside text-sm text-green-800 space-y-1">
                <li>Access the admin panel at <a href="/admin" className="underline">/admin</a></li>
                <li>Start adding properties and content</li>
                <li>Test real-time notifications</li>
              </ul>
            </div>
          )}

          {status === 'error' && (
            <div className="mt-8 p-4 bg-red-50 rounded border border-red-200">
              <h3 className="font-semibold text-red-900 mb-2">Troubleshooting Steps:</h3>
              <ul className="list-disc list-inside text-sm text-red-800 space-y-1">
                <li>Verify you ran the database migration in Supabase Dashboard</li>
                <li>Check that RLS policies are configured correctly</li>
                <li>Ensure environment variables are set in .env.local</li>
                <li>Try refreshing the page</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
