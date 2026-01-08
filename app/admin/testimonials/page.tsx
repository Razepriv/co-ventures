"use client"

import { useState, useEffect } from 'react'
import { getSupabaseClient } from '@/lib/supabase/client'
import { DataTable } from '@/components/admin/data-table'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Plus, MoreHorizontal, Trash2, Star, CheckCircle, XCircle, Eye } from 'lucide-react'
import { ColumnDef } from '@tanstack/react-table'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'

interface Testimonial {
  id: string
  client_name: string
  client_designation: string
  client_avatar: string | null
  rating: number
  testimonial_text: string
  property_id: string | null
  properties: { title: string } | null
  is_featured: boolean
  is_approved: boolean
  created_at: string
}

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ total: 0, approved: 0, featured: 0, avgRating: 0 })

  useEffect(() => {
    fetchTestimonials()
  }, [])

  async function fetchTestimonials() {
    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('testimonials')
        .select(`
          *,
          properties (title)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      setTestimonials(data || [])
      
      const total = data?.length || 0
      // @ts-ignore
      const approved = data?.filter(t => t.is_approved).length || 0
      // @ts-ignore
      const featured = data?.filter(t => t.is_featured).length || 0
      const avgRating = data?.length 
        // @ts-ignore
        ? data.reduce((sum, t) => sum + t.rating, 0) / data.length 
        : 0
      setStats({ total, approved, featured, avgRating })
    } catch (error) {
      console.error('Error fetching testimonials:', error)
      toast.error('Failed to load testimonials')
    } finally {
      setLoading(false)
    }
  }

  async function toggleApproval(id: string, currentValue: boolean) {
    try {
      const supabase = getSupabaseClient()
      const { error } = await supabase
        .from('testimonials')
        // @ts-ignore
        .update({ is_approved: !currentValue })
        .eq('id', id)

      if (error) throw error

      toast.success(currentValue ? 'Testimonial disapproved' : 'Testimonial approved')
      fetchTestimonials()
    } catch (error) {
      console.error('Error updating testimonial:', error)
      toast.error('Failed to update testimonial')
    }
  }

  async function toggleFeatured(id: string, currentValue: boolean) {
    try {
      const supabase = getSupabaseClient()
      const { error } = await supabase
        .from('testimonials')
        // @ts-ignore
        .update({ is_featured: !currentValue })
        .eq('id', id)

      if (error) throw error

      toast.success(currentValue ? 'Removed from featured' : 'Added to featured')
      fetchTestimonials()
    } catch (error) {
      console.error('Error updating testimonial:', error)
      toast.error('Failed to update testimonial')
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this testimonial?')) return

    try {
      const supabase = getSupabaseClient()
      const { error } = await supabase.from('testimonials').delete().eq('id', id)

      if (error) throw error

      toast.success('Testimonial deleted successfully')
      fetchTestimonials()
    } catch (error) {
      console.error('Error deleting testimonial:', error)
      toast.error('Failed to delete testimonial')
    }
  }

  const columns: ColumnDef<Testimonial>[] = [
    {
      accessorKey: 'client_name',
      header: 'Client',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center text-white font-semibold">
            {row.original.client_name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-gray-900">{row.original.client_name}</p>
            <p className="text-sm text-gray-500">{row.original.client_designation}</p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'rating',
      header: 'Rating',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`h-4 w-4 ${
                i < row.original.rating
                  ? 'fill-amber-400 text-amber-400'
                  : 'text-gray-300'
              }`}
            />
          ))}
          <span className="ml-1 text-sm font-medium text-gray-600">
            {row.original.rating}.0
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'testimonial_text',
      header: 'Testimonial',
      cell: ({ row }) => (
        <p className="max-w-md truncate text-sm text-gray-600">
          {row.original.testimonial_text}
        </p>
      ),
    },
    {
      accessorKey: 'property',
      header: 'Property',
      cell: ({ row }) => (
        <p className="text-sm text-gray-600">
          {row.original.properties?.title || '—'}
        </p>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <div className="flex gap-2">
          {row.original.is_approved ? (
            <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
              <CheckCircle className="mr-1 h-3 w-3" />
              Approved
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">
              <XCircle className="mr-1 h-3 w-3" />
              Pending
            </Badge>
          )}
          {row.original.is_featured && (
            <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">
              <Star className="mr-1 h-3 w-3" />
              Featured
            </Badge>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'created_at',
      header: 'Submitted',
      cell: ({ row }) => (
        <p className="text-sm text-gray-600">
          {formatDistanceToNow(new Date(row.original.created_at), { addSuffix: true })}
        </p>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => toggleApproval(row.original.id, row.original.is_approved)}>
              {row.original.is_approved ? (
                <>
                  <XCircle className="mr-2 h-4 w-4" />
                  Disapprove
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Approve
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => toggleFeatured(row.original.id, row.original.is_featured)}>
              <Star className="mr-2 h-4 w-4" />
              {row.original.is_featured ? 'Remove from Featured' : 'Mark as Featured'}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-red-600"
              onClick={() => handleDelete(row.original.id)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Testimonials</h1>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-coral-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 px-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Testimonials</h1>
        <p className="mt-1 text-sm text-gray-500">Manage customer testimonials and reviews</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-blue-100 p-3">
              <Star className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-green-100 p-3">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-amber-100 p-3">
              <Star className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Featured</p>
              <p className="text-2xl font-bold text-gray-900">{stats.featured}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-purple-100 p-3">
              <Star className="h-6 w-6 text-purple-600 fill-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Rating</p>
              <p className="text-2xl font-bold text-gray-900">{stats.avgRating.toFixed(1)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="rounded-xl border bg-white shadow-sm">
        <DataTable
          columns={columns}
          data={testimonials}
          searchKey="client_name"
          searchPlaceholder="Search testimonials..."
        />
      </div>
    </div>
  )
}
