"use client"

import { useState, useEffect } from 'react'
import { getSupabaseClient } from '@/lib/supabase/client'
import { DataTable } from '@/components/admin/data-table'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Mail, Phone, Eye, CheckCircle2, Clock, XCircle, Trash2 } from 'lucide-react'
import { ColumnDef } from '@tanstack/react-table'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'
import { DateRangeFilter } from '@/components/ui/DateRangeFilter'
import { exportToCSV } from '@/lib/utils/export'

interface ContactMessage {
    id: string
    full_name: string
    email: string
    phone: string | null
    subject: string
    message: string
    status: 'new' | 'in_progress' | 'resolved'
    created_at: string
}

const statusConfig = {
    new: { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: Clock, label: 'New' },
    in_progress: { color: 'bg-amber-100 text-amber-800 border-amber-200', icon: Eye, label: 'In Progress' },
    resolved: { color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle2, label: 'Resolved' },
}

export default function ContactsPage() {
    const [messages, setMessages] = useState<ContactMessage[]>([])
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState({ total: 0, new: 0, inProgress: 0, resolved: 0 })
    const [dateRange, setDateRange] = useState<{ start: string | null; end: string | null }>({ start: null, end: null })

    useEffect(() => {
        fetchMessages()

        // Real-time subscription
        const supabase = getSupabaseClient()
        const channel = supabase
            .channel('contact_messages_changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'contact_messages' }, () => {
                fetchMessages()
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [dateRange])

    async function fetchMessages() {
        try {
            const supabase = getSupabaseClient()
            let query = supabase
                .from('contact_messages')
                .select('*')
                .order('created_at', { ascending: false })

            // Apply date range filter
            if (dateRange.start && dateRange.end) {
                query = query
                    .gte('created_at', new Date(dateRange.start).toISOString())
                    .lte('created_at', new Date(dateRange.end + 'T23:59:59').toISOString())
            }

            const { data, error } = await query

            if (error) throw error

            setMessages(data || [])

            // Calculate stats
            const total = data?.length || 0
            const newCount = data?.filter(m => m.status === 'new').length || 0
            const inProgress = data?.filter(m => m.status === 'in_progress').length || 0
            const resolved = data?.filter(m => m.status === 'resolved').length || 0
            setStats({ total, new: newCount, inProgress, resolved })
        } catch (error) {
            console.error('Error fetching messages:', error)
            toast.error('Failed to load messages')
        } finally {
            setLoading(false)
        }
    }

    async function updateStatus(id: string, status: string) {
        try {
            const supabase = getSupabaseClient()
            const { error } = await supabase
                .from('contact_messages')
                // @ts-ignore
                .update({ status })
                .eq('id', id)

            if (error) throw error

            toast.success('Status updated successfully')
            fetchMessages()
        } catch (error) {
            console.error('Error updating status:', error)
            toast.error('Failed to update status')
        }
    }

    async function deleteMessage(id: string) {
        if (!confirm('Are you sure you want to delete this message?')) return

        try {
            const supabase = getSupabaseClient()
            const { error } = await supabase.from('contact_messages').delete().eq('id', id)

            if (error) throw error

            toast.success('Message deleted successfully')
            fetchMessages()
        } catch (error) {
            console.error('Error deleting message:', error)
            toast.error('Failed to delete message')
        }
    }

    function handleDateRangeChange(start: string | null, end: string | null) {
        setDateRange({ start, end })
    }

    function handleExport(data: ContactMessage[]) {
        const formatted = data.map(m => ({
            Name: m.full_name,
            Email: m.email,
            Phone: m.phone || 'N/A',
            Subject: m.subject,
            Message: m.message,
            Status: m.status,
            'Received At': new Date(m.created_at).toLocaleString()
        }))
        exportToCSV(formatted, 'contact-messages')
        toast.success('Messages exported successfully')
    }

    const columns: ColumnDef<ContactMessage>[] = [
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
                        {row.original.phone && (
                            <div className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {row.original.phone}
                            </div>
                        )}
                    </div>
                </div>
            ),
        },
        {
            accessorKey: 'subject',
            header: 'Subject',
            cell: ({ row }) => (
                <p className="font-medium text-gray-900">{row.original.subject}</p>
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
                        <DropdownMenuItem onClick={() => updateStatus(row.original.id, 'resolved')}>
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Mark as Resolved
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => deleteMessage(row.original.id)}
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
                <h1 className="text-3xl font-bold text-gray-900">Contact Messages</h1>
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
                <h1 className="text-3xl font-bold text-gray-900">Contact Messages</h1>
                <p className="mt-1 text-sm text-gray-500">
                    Manage customer inquiries and messages
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
                            <p className="text-sm font-medium text-gray-600">Resolved</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.resolved}</p>
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
                    data={messages}
                    searchKey="full_name"
                    searchPlaceholder="Search by name..."
                    onExport={handleExport}
                    exportFileName="contact-messages"
                />
            </div>
        </div>
    )
}
