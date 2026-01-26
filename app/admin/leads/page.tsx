"use client"

import { useState, useEffect, useCallback } from 'react'
import { getSupabaseClient } from '@/lib/supabase/client'
import { DataTable } from '@/components/admin/data-table'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Mail, Phone, UserCheck, Clock, CheckCircle2, XCircle, TrendingUp, Users } from 'lucide-react'
import { ColumnDef } from '@tanstack/react-table'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'
import { DateRangeFilter } from '@/components/ui/DateRangeFilter'
import { exportToCSV } from '@/lib/utils/export'

interface PropertyLead {
    id: string
    property_id: string
    properties: {
        title: string
        location: string
    }
    full_name: string
    email: string
    phone: string
    source: string
    status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost'
    assigned_to: string | null
    users?: {
        full_name: string
    }
    created_at: string
}

const statusConfig = {
    new: { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: Clock, label: 'New' },
    contacted: { color: 'bg-purple-100 text-purple-800 border-purple-200', icon: Phone, label: 'Contacted' },
    qualified: { color: 'bg-amber-100 text-amber-800 border-amber-200', icon: UserCheck, label: 'Qualified' },
    converted: { color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle2, label: 'Converted' },
    lost: { color: 'bg-red-100 text-red-800 border-red-200', icon: XCircle, label: 'Lost' },
}

export default function LeadsPage() {
    const [leads, setLeads] = useState<PropertyLead[]>([])
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState({ total: 0, new: 0, contacted: 0, qualified: 0, converted: 0, lost: 0 })
    const [dateRange, setDateRange] = useState<{ start: string | null; end: string | null }>({ start: null, end: null })
    const [teamMembers, setTeamMembers] = useState<any[]>([])

    const fetchLeads = useCallback(async () => {
        try {
            const supabase = getSupabaseClient()

            // Fetch property leads
            let leadsQuery = supabase
                .from('property_leads')
                .select(`
          *,
          properties (title, location),
          users:assigned_to (full_name)
        `)
                .order('created_at', { ascending: false })

            // Fetch enquiries
            let enquiriesQuery = supabase
                .from('enquiries')
                .select(`
          *,
          properties (title, location),
          users:assigned_to (full_name)
        `)
                .order('created_at', { ascending: false })

            // Apply date range filter to both
            if (dateRange.start && dateRange.end) {
                const startDate = new Date(dateRange.start).toISOString()
                const endDate = new Date(dateRange.end + 'T23:59:59').toISOString()

                leadsQuery = leadsQuery.gte('created_at', startDate).lte('created_at', endDate)
                enquiriesQuery = enquiriesQuery.gte('created_at', startDate).lte('created_at', endDate)
            }

            const [leadsResult, enquiriesResult] = await Promise.all([
                leadsQuery,
                enquiriesQuery
            ])

            if (leadsResult.error) throw leadsResult.error
            if (enquiriesResult.error) throw enquiriesResult.error

            // Combine and normalize data
            const combinedLeads = [
                ...(leadsResult.data as any[] || []).map(lead => ({
                    ...lead,
                    source: lead.source || 'Group Buying'
                })),
                ...(enquiriesResult.data as any[] || []).map(enquiry => ({
                    id: enquiry.id,
                    property_id: enquiry.property_id,
                    properties: enquiry.properties,
                    full_name: enquiry.full_name,
                    email: enquiry.email,
                    phone: enquiry.phone,
                    source: 'Invest Now',
                    status: enquiry.status === 'new' ? 'new' :
                        enquiry.status === 'in_progress' ? 'contacted' :
                            enquiry.status === 'closed' ? 'converted' : 'new',
                    assigned_to: enquiry.assigned_to,
                    users: enquiry.users,
                    created_at: enquiry.created_at
                }))
            ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

            setLeads(combinedLeads as PropertyLead[])

            // Calculate stats
            const total = combinedLeads.length
            const newCount = combinedLeads.filter(l => l.status === 'new').length
            const contacted = combinedLeads.filter(l => l.status === 'contacted').length
            const qualified = combinedLeads.filter(l => l.status === 'qualified').length
            const converted = combinedLeads.filter(l => l.status === 'converted').length
            const lost = combinedLeads.filter(l => l.status === 'lost').length
            setStats({ total, new: newCount, contacted, qualified, converted, lost })
        } catch (error) {
            console.error('Error fetching leads:', error)
            toast.error('Failed to load leads')
        } finally {
            setLoading(false)
        }
    }, [dateRange])

    const fetchTeamMembers = useCallback(async () => {
        try {
            const supabase = getSupabaseClient()
            const { data, error } = await supabase
                .from('users')
                .select('id, full_name')
                .in('role', ['admin', 'super_admin'])
                .order('full_name')

            if (error) throw error
            setTeamMembers(data || [])
        } catch (error) {
            console.error('Error fetching team members:', error)
        }
    }, [])

    useEffect(() => {
        fetchLeads()
        fetchTeamMembers()

        // Real-time subscription for both tables
        const supabase = getSupabaseClient()
        const channel = supabase
            .channel('leads_and_enquiries_changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'property_leads' }, () => {
                fetchLeads()
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'enquiries' }, () => {
                fetchLeads()
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [fetchLeads, fetchTeamMembers])

    async function updateStatus(id: string, status: string) {
        try {
            const supabase = getSupabaseClient()
            const { error } = await supabase
                .from('property_leads')
                // @ts-ignore
                .update({ status })
                .eq('id', id)

            if (error) throw error

            toast.success('Lead status updated')
            fetchLeads()
        } catch (error) {
            console.error('Error updating status:', error)
            toast.error('Failed to update status')
        }
    }

    async function assignLead(id: string, userId: string) {
        try {
            const supabase = getSupabaseClient()
            const { error } = await supabase
                .from('property_leads')
                // @ts-ignore
                .update({ assigned_to: userId })
                .eq('id', id)

            if (error) throw error

            toast.success('Lead assigned successfully')
            fetchLeads()
        } catch (error) {
            console.error('Error assigning lead:', error)
            toast.error('Failed to assign lead')
        }
    }

    async function deleteLead(id: string) {
        if (!confirm('Are you sure you want to delete this lead?')) return

        try {
            const supabase = getSupabaseClient()
            const { error } = await supabase.from('property_leads').delete().eq('id', id)

            if (error) throw error

            toast.success('Lead deleted successfully')
            fetchLeads()
        } catch (error) {
            console.error('Error deleting lead:', error)
            toast.error('Failed to delete lead')
        }
    }

    function handleDateRangeChange(start: string | null, end: string | null) {
        setDateRange({ start, end })
    }

    function handleExport(data: PropertyLead[]) {
        const formatted = data.map(l => ({
            Property: l.properties?.title || 'N/A',
            Location: l.properties?.location || 'N/A',
            Name: l.full_name,
            Email: l.email,
            Phone: l.phone,
            Source: l.source,
            Status: l.status,
            'Assigned To': l.users?.full_name || 'Unassigned',
            'Created At': new Date(l.created_at).toLocaleString()
        }))
        exportToCSV(formatted, 'property-leads')
        toast.success('Leads exported successfully')
    }

    const columns: ColumnDef<PropertyLead>[] = [
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
            accessorKey: 'contact',
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
            accessorKey: 'source',
            header: 'Source',
            cell: ({ row }) => (
                <Badge variant="outline" className="bg-gray-100">
                    {row.original.source}
                </Badge>
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
            accessorKey: 'assigned_to',
            header: 'Assigned To',
            cell: ({ row }) => (
                <div className="min-w-[150px]">
                    <Select
                        value={row.original.assigned_to || 'unassigned'}
                        onValueChange={(value) => assignLead(row.original.id, value === 'unassigned' ? '' : value)}
                    >
                        <SelectTrigger className="h-8">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="unassigned">Unassigned</SelectItem>
                            {teamMembers.map((member) => (
                                <SelectItem key={member.id} value={member.id}>
                                    {member.full_name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            ),
        },
        {
            accessorKey: 'created_at',
            header: 'Created',
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
                            New
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateStatus(row.original.id, 'contacted')}>
                            <Phone className="mr-2 h-4 w-4" />
                            Contacted
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateStatus(row.original.id, 'qualified')}>
                            <UserCheck className="mr-2 h-4 w-4" />
                            Qualified
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateStatus(row.original.id, 'converted')}>
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Converted
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateStatus(row.original.id, 'lost')}>
                            <XCircle className="mr-2 h-4 w-4" />
                            Lost
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => deleteLead(row.original.id)}
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
                <h1 className="text-3xl font-bold text-gray-900">Leads</h1>
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-coral-600"></div>
                </div>
            </div>
        )
    }

    const conversionRate = stats.total > 0 ? ((stats.converted / stats.total) * 100).toFixed(1) : '0.0'

    return (
        <div className="space-y-6 px-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Leads & Enquiries</h1>
                <p className="mt-1 text-sm text-gray-500">
                    Track and manage all property leads and investment enquiries
                </p>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-6">
                <div className="rounded-xl border bg-white p-6 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="rounded-lg bg-gray-100 p-3">
                            <Users className="h-6 w-6 text-gray-600" />
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
                        <div className="rounded-lg bg-purple-100 p-3">
                            <Phone className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-600">Contacted</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.contacted}</p>
                        </div>
                    </div>
                </div>
                <div className="rounded-xl border bg-white p-6 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="rounded-lg bg-amber-100 p-3">
                            <UserCheck className="h-6 w-6 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-600">Qualified</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.qualified}</p>
                        </div>
                    </div>
                </div>
                <div className="rounded-xl border bg-white p-6 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="rounded-lg bg-green-100 p-3">
                            <CheckCircle2 className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-600">Converted</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.converted}</p>
                        </div>
                    </div>
                </div>
                <div className="rounded-xl border bg-white p-6 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="rounded-lg bg-coral-light p-3">
                            <TrendingUp className="h-6 w-6 text-coral" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-600">Conv. Rate</p>
                            <p className="text-2xl font-bold text-gray-900">{conversionRate}%</p>
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
                    data={leads}
                    searchKey="full_name"
                    searchPlaceholder="Search by name..."
                    onExport={handleExport}
                    exportFileName="property-leads"
                />
            </div>
        </div>
    )
}
