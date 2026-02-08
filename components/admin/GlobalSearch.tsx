'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase/client'
import { Search, Building2, Users, MessageSquare, UserPlus, Loader2, X } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface SearchResult {
  id: string
  type: 'property' | 'user' | 'enquiry' | 'lead' | 'contact' | 'group'
  title: string
  subtitle?: string
  link: string
}

export function GlobalSearch() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<SearchResult[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Debounced search
  const search = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setResults([])
      return
    }

    setLoading(true)
    try {
      const supabase = getSupabaseClient()
      const searchResults: SearchResult[] = []

      // Search properties
      const { data: properties } = await supabase
        .from('properties')
        .select('id, title, location, slug')
        .or(`title.ilike.%${searchQuery}%,location.ilike.%${searchQuery}%`)
        .limit(5)

      if (properties) {
        properties.forEach((p: any) => {
          searchResults.push({
            id: p.id,
            type: 'property',
            title: p.title,
            subtitle: p.location,
            link: `/admin/properties/${p.id}`
          })
        })
      }

      // Search users
      const { data: users } = await supabase
        .from('users')
        .select('id, full_name, email')
        .or(`full_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`)
        .limit(5)

      if (users) {
        users.forEach((u: any) => {
          searchResults.push({
            id: u.id,
            type: 'user',
            title: u.full_name || 'Unknown',
            subtitle: u.email,
            link: `/admin/users/${u.id}`
          })
        })
      }

      // Search enquiries
      const { data: enquiries } = await supabase
        .from('enquiries')
        .select('id, full_name, email, message')
        .or(`full_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%,message.ilike.%${searchQuery}%`)
        .limit(5)

      if (enquiries) {
        enquiries.forEach((e: any) => {
          searchResults.push({
            id: e.id,
            type: 'enquiry',
            title: e.full_name || 'Enquiry',
            subtitle: e.message?.substring(0, 50) + (e.message?.length > 50 ? '...' : ''),
            link: `/admin/enquiries/${e.id}`
          })
        })
      }

      // Search leads
      const { data: leads } = await supabase
        .from('property_leads')
        .select('id, full_name, email, lead_type')
        .or(`full_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`)
        .limit(5)

      if (leads) {
        leads.forEach((l: any) => {
          searchResults.push({
            id: l.id,
            type: 'lead',
            title: l.full_name || 'Lead',
            subtitle: l.lead_type || l.email,
            link: `/admin/leads/${l.id}`
          })
        })
      }

      // Search contacts
      const { data: contacts } = await supabase
        .from('contacts')
        .select('id, full_name, email, subject')
        .or(`full_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%,subject.ilike.%${searchQuery}%`)
        .limit(5)

      if (contacts) {
        contacts.forEach((c: any) => {
          searchResults.push({
            id: c.id,
            type: 'contact',
            title: c.full_name || 'Contact',
            subtitle: c.subject || c.email,
            link: `/admin/contacts/${c.id}`
          })
        })
      }

      // Search groups (via property title)
      const { data: groups } = await supabase
        .from('property_groups')
        .select('id, properties:property_id(title, location)')
        .limit(5)

      if (groups) {
        groups
          .filter((g: any) => 
            g.properties?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            g.properties?.location?.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .forEach((g: any) => {
            searchResults.push({
              id: g.id,
              type: 'group',
              title: g.properties?.title || 'Group',
              subtitle: 'Investment Group',
              link: `/admin/groups/${g.id}`
            })
          })
      }

      setResults(searchResults)
    } catch (error) {
      console.error('Search error:', error)
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  // Debounce effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query) {
        search(query)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [query, search])

  const handleSelect = (result: SearchResult) => {
    router.push(result.link)
    setIsOpen(false)
    setQuery('')
    setResults([])
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'property':
        return <Building2 className="h-4 w-4 text-blue-500" />
      case 'user':
        return <Users className="h-4 w-4 text-green-500" />
      case 'enquiry':
        return <MessageSquare className="h-4 w-4 text-coral" />
      case 'lead':
        return <UserPlus className="h-4 w-4 text-purple-500" />
      case 'contact':
        return <MessageSquare className="h-4 w-4 text-amber-500" />
      case 'group':
        return <Users className="h-4 w-4 text-indigo-500" />
      default:
        return <Search className="h-4 w-4 text-gray-400" />
    }
  }

  const getTypeLabel = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1)
  }

  // Group results by type
  const groupedResults = results.reduce((acc, result) => {
    if (!acc[result.type]) {
      acc[result.type] = []
    }
    acc[result.type].push(result)
    return acc
  }, {} as Record<string, SearchResult[]>)

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search properties, users, enquiries..."
          className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-10 pr-10 text-sm focus:border-coral focus:bg-white focus:outline-none focus:ring-2 focus:ring-coral/20"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('')
              setResults([])
              inputRef.current?.focus()
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Results Dropdown */}
      {isOpen && (query.length >= 2 || loading) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden max-h-[400px] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-coral" />
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No results found for "{query}"</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {Object.entries(groupedResults).map(([type, items]) => (
                <div key={type}>
                  <div className="px-3 py-2 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {getTypeLabel(type)}s ({items.length})
                  </div>
                  {items.map((result) => (
                    <button
                      key={`${result.type}-${result.id}`}
                      onClick={() => handleSelect(result)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left transition-colors"
                    >
                      <div className="flex-shrink-0">
                        {getIcon(result.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {result.title}
                        </p>
                        {result.subtitle && (
                          <p className="text-xs text-gray-500 truncate">
                            {result.subtitle}
                          </p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
