"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase/client'
import { DataTable } from '@/components/admin/data-table'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Plus, MoreHorizontal, Pencil, Trash2, Eye, Star, Image as ImageIcon, CheckSquare } from 'lucide-react'
import { ColumnDef } from '@tanstack/react-table'
import { toast } from 'sonner'
import Link from 'next/link'
import { Checkbox } from '@/components/ui/checkbox'
import { exportToCSV, formatPropertiesForExport } from '@/lib/utils/export'

interface Property {
  id: string
  title: string
  slug: string
  category_id: string
  categories: { name: string; icon: string }
  location: string
  city: string
  state: string
  price: number
  bhk_type: string
  area_sqft: number
  status: 'available' | 'sold' | 'rented'
  is_featured: boolean
  views_count: number
  created_at: string
  property_images: { image_url: string; is_primary: boolean }[]
}

const statusColors = {
  available: 'bg-green-100 text-green-800 border-green-200',
  sold: 'bg-red-100 text-red-800 border-red-200',
  rented: 'bg-blue-100 text-blue-800 border-blue-200',
}

export default function PropertiesPage() {
  const router = useRouter()
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ total: 0, featured: 0, available: 0 })

  useEffect(() => {
    fetchProperties()

    // Set up realtime subscription for property changes
    const supabase = getSupabaseClient()
    const channel = supabase
      .channel('admin_properties_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'properties' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          toast.success('New property added!')
        } else if (payload.eventType === 'UPDATE') {
          toast.info('Property updated')
        } else if (payload.eventType === 'DELETE') {
          toast.info('Property deleted')
        }
        fetchProperties()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  async function fetchProperties() {
    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          categories (name, icon),
          property_images (image_url, is_primary)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      setProperties(data || [])
      
      // Calculate stats
      const total = data?.length || 0
      // @ts-ignore
      const featured = data?.filter(p => p.is_featured).length || 0
      // @ts-ignore
      const available = data?.filter(p => p.status === 'available').length || 0
      setStats({ total, featured, available })
    } catch (error) {
      console.error('Error fetching properties:', error)
      toast.error('Failed to load properties')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this property?')) return

    try {
      const supabase = getSupabaseClient()
      const { error } = await supabase.from('properties').delete().eq('id', id)

      if (error) throw error

      toast.success('Property deleted successfully')
      fetchProperties()
    } catch (error) {
      console.error('Error deleting property:', error)
      toast.error('Failed to delete property')
    }
  }

  async function toggleFeatured(id: string, currentValue: boolean) {
    try {
      const supabase = getSupabaseClient()
      const { error } = await supabase
        .from('properties')
        // @ts-ignore
        .update({ is_featured: !currentValue })
        .eq('id', id)

      if (error) throw error

      toast.success(currentValue ? 'Removed from featured' : 'Added to featured')
      fetchProperties()
    } catch (error) {
      console.error('Error updating property:', error)
      toast.error('Failed to update property')
    }
  }

  async function handleBulkDelete(selectedProperties: Property[]) {
    try {
      const supabase = getSupabaseClient()
      const ids = selectedProperties.map(p => p.id)
      
      const { error } = await supabase
        .from('properties')
        .delete()
        .in('id', ids)

      if (error) throw error

      toast.success(`${selectedProperties.length} properties deleted successfully`)
      fetchProperties()
    } catch (error) {
      console.error('Error deleting properties:', error)
      toast.error('Failed to delete properties')
    }
  }

  async function handleBulkUpdate(selectedProperties: Property[], action: string) {
    try {
      const supabase = getSupabaseClient()
      const ids = selectedProperties.map(p => p.id)
      
      const isFeatured = action === 'feature'
      
      const { error } = await supabase
        .from('properties')
        // @ts-ignore
        .update({ is_featured: isFeatured })
        .in('id', ids)

      if (error) throw error

      toast.success(`${selectedProperties.length} properties ${isFeatured ? 'featured' : 'unfeatured'}`)
      fetchProperties()
    } catch (error) {
      console.error('Error updating properties:', error)
      toast.error('Failed to update properties')
    }
  }

  function handleExport(data: Property[]) {
    const formatted = formatPropertiesForExport(data)
    exportToCSV(formatted, 'properties')
    toast.success('Properties exported successfully')
  }

  const columns: ColumnDef<Property>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: 'image',
      header: 'Image',
      cell: ({ row }) => {
        const primaryImage = row.original.property_images?.find(img => img.is_primary)
        const imageUrl = primaryImage?.image_url || row.original.property_images?.[0]?.image_url

        return (
          <div className="relative h-16 w-24 rounded-lg overflow-hidden bg-gray-100">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={row.original.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center">
                <ImageIcon className="h-6 w-6 text-gray-400" />
              </div>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: 'title',
      header: 'Property',
      cell: ({ row }) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <p className="font-medium text-gray-900">{row.original.title}</p>
            {row.original.is_featured && (
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>{row.original.categories?.icon}</span>
            <span>{row.original.categories?.name}</span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'location',
      header: 'Location',
      cell: ({ row }) => (
        <div className="text-sm">
          <p className="font-medium text-gray-900">{row.original.location}</p>
          <p className="text-gray-500">{row.original.city}, {row.original.state}</p>
        </div>
      ),
    },
    {
      accessorKey: 'bhk_type',
      header: 'Type',
      cell: ({ row }) => (
        <Badge variant="outline" className="font-mono">
          {row.original.bhk_type}
        </Badge>
      ),
    },
    {
      accessorKey: 'price',
      header: 'Price',
      cell: ({ row }) => (
        <p className="font-semibold text-gray-900">
          ₹{(row.original.price / 100000).toFixed(2)}L
        </p>
      ),
    },
    {
      accessorKey: 'area_sqft',
      header: 'Size',
      cell: ({ row }) => (
        <p className="text-sm text-gray-600">
          {row.original.area_sqft} sq.ft
        </p>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant="outline" className={statusColors[row.original.status]}>
          {row.original.status}
        </Badge>
      ),
    },
    {
      accessorKey: 'views_count',
      header: 'Views',
      cell: ({ row }) => (
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <Eye className="h-4 w-4" />
          {row.original.views_count || 0}
        </div>
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
            <DropdownMenuItem onClick={() => router.push(`/admin/properties/${row.original.id}`)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
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
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Properties</h1>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-coral-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 px-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Properties</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage all property listings
          </p>
        </div>
        <Link href="/admin/properties/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Property
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-blue-100 p-3">
              <ImageIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Properties</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
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
            <div className="rounded-lg bg-green-100 p-3">
              <Eye className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Available</p>
              <p className="text-2xl font-bold text-gray-900">{stats.available}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="rounded-xl border bg-white shadow-sm">
        <DataTable
          columns={columns}
          data={properties}
          searchKey="title"
          searchPlaceholder="Search properties..."
          enableBulkActions={true}
          onBulkDelete={handleBulkDelete}
          onBulkUpdate={handleBulkUpdate}
          onExport={handleExport}
          exportFileName="properties"
        />
      </div>
    </div>
  )
}
