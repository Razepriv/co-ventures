"use client"

import { useState, useEffect } from 'react'
import { getSupabaseClient } from '@/lib/supabase/client'
import { DataTable } from '@/components/admin/data-table'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Mail, Phone, Eye, CheckCircle2, Clock, XCircle } from 'lucide-react'
import { ColumnDef } from '@tanstack/react-table'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'
import { DateRangeFilter } from '@/components/ui/DateRangeFilter'
import { exportToCSV, formatEnquiriesForExport } from '@/lib/utils/export'

interface Enquiry {
  id: string
  full_name: string
  email: string
  phone: string
  property_id: string
  properties: {
    title: string
    location: string
  }
  message: string
  status: 'new' | 'in_progress' | 'closed'
  created_at: string
  user_id: string | null
}

const statusConfig = {
  new: { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: Clock, label: 'New' },
  in_progress: { color: 'bg-amber-100 text-amber-800 border-amber-200', icon: Eye, label: 'In Progress' },
  closed: { color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle2, label: 'Closed' },
}

export default function EnquiriesPage() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ total: 0, new: 0, inProgress: 0, closed: 0 })
  const [dateRange, setDateRange] = useState<{ start: string | null; end: string | null }>({ start: null, end: null })

  useEffect(() => {
    fetchEnquiries()
    
    // Set up realtime subscription
    const supabase = getSupabaseClient()
    const channel = supabase
      .channel('enquiries_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'enquiries' }, () => {
        fetchEnquiries()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [dateRange])

  async function fetchEnquiries() {
    try {
      const supabase = getSupabaseClient()
      let query = supabase
        .from('enquiries')
        .select(`
          *,
          properties (title, location)
        `)
        .order('created_at', { ascending: false })

      // Apply date range filter
      if (dateRange.start && dateRange.end) {
        query = query
          .gte('created_at', new Date(dateRange.start).toISOString())
          .lte('created_at', new Date(dateRange.end + 'T23:59:59').toISOString())
      }

      const { data, error } = await query

      if (error) throw error

      setEnquiries(data || [])
      
      // Calculate stats
      const total = data?.length || 0
      // @ts-ignore
      const newCount = data?.filter(e => e.status === 'new').length || 0
      // @ts-ignore
      const inProgress = data?.filter(e => e.status === 'in_progress').length || 0
      // @ts-ignore
      const closed = data?.filter(e => e.status === 'closed').length || 0
      setStats({ total, new: newCount, inProgress, closed })
    } catch (error) {
      console.error('Error fetching enquiries:', error)
      toast.error('Failed to load enquiries')
    } finally {
      setLoading(false)
    }
  }

  async function updateStatus(id: string, status: string) {
    try {
      const supabase = getSupabaseClient()
      const { error } = await supabase
        .from('enquiries')
        // @ts-ignore
        .update({ status })
        .eq('id', id)

      if (error) throw error

      toast.success('Status updated successfully')
      fetchEnquiries()
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('Failed to update status')
    }
  }

  async function deleteEnquiry(id: string) {
    if (!confirm('Are you sure you want to delete this enquiry?')) return

    try {
      const supabase = getSupabaseClient()
      const { error } = await supabase.from('enquiries').delete().eq('id', id)

      if (error) throw error

      toast.success('Enquiry deleted successfully')
      fetchEnquiries()
    } catch (error) {
      console.error('Error deleting enquiry:', error)
      toast.error('Failed to delete enquiry')
    }
  }

  function handleDateRangeChange(start: string | null, end: string | null) {
    setDateRange({ start, end })
  }

  function handleExport(data: Enquiry[]) {
    const formatted = formatEnquiriesForExport(data)
    exportToCSV(formatted, 'enquiries')
    toast.success('Enquiries exported successfully')
  }

  const columns: ColumnDef<Enquiry>[] = [
    {
      accessorKey: 'full_name',
      header: 'Contact',
      cell: ({ row }) => (
        <div className="space-y-1">
          <p className="font-medium text-gray-900">{row.original.full_name}</p>
          <div className="flex flex-col gap-1 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Mail className="h-3 w-3" />
              {row.original.email}
            </div>
            <div className="flex items-center gap-1">
              <Phone className="h-3 w-3" />
              {row.original.phone}
            </div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'property',
      header: 'Property',
      cell: ({ row }) => (
        <div className="space-y-1">
          <p className="font-medium text-gray-900">{row.original.properties?.title}</p>
          <p className="text-xs text-gray-500">{row.original.properties?.location}</p>
        </div>
      ),
    },
    {
      accessorKey: 'message',
      header: 'Message',
      cell: ({ row }) => (
        <p className="max-w-xs truncate text-sm text-gray-600">
          {row.original.message}
        </p>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const config = statusConfig[row.original.status]
        const Icon = config.icon
        return (
          <Badge variant="outline" className={config.color}>
            <Icon className="mr-1 h-3 w-3" />
            {config.label}
          </Badge>
        )
      },
    },
    {
      accessorKey: 'created_at',
      header: 'Received',
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
            <DropdownMenuLabel>Update Status</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => updateStatus(row.original.id, 'new')}>
              <Clock className="mr-2 h-4 w-4" />
              Mark as New
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => updateStatus(row.original.id, 'in_progress')}>
              <Eye className="mr-2 h-4 w-4" />
              Mark In Progress
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => updateStatus(row.original.id, 'closed')}>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Mark as Closed
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-red-600"
              onClick={() => deleteEnquiry(row.original.id)}
            >
              <XCircle className="mr-2 h-4 w-4" />
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
        <h1 className="text-3xl font-bold text-gray-900">Enquiries</h1>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-coral-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 px-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Enquiries</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage customer enquiries and follow-ups
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-gray-100 p-3">
              <Mail className="h-6 w-6 text-gray-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-blue-100 p-3">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">New</p>
              <p className="text-2xl font-bold text-gray-900">{stats.new}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-amber-100 p-3">
              <Eye className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-gray-900">{stats.inProgress}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-green-100 p-3">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Closed</p>
              <p className="text-2xl font-bold text-gray-900">{stats.closed}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Date Range Filter */}
      <DateRangeFilter
        onDateRangeChange={handleDateRangeChange}
        label="Filter by Date"
      />

      {/* Data Table */}
      <div className="rounded-xl border bg-white shadow-sm">
        <DataTable
          columns={columns}
          data={enquiries}
          searchKey="full_name"
          searchPlaceholder="Search by name..."
          onExport={handleExport}
          exportFileName="enquiries"
        />
      </div>
    </div>
  )
}
