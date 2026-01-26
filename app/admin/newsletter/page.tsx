"use client"

import { useState, useEffect, useCallback } from 'react'
import { getSupabaseClient } from '@/lib/supabase/client'
import { DataTable } from '@/components/admin/data-table'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Mail, Download, Trash2, TrendingUp, Users } from 'lucide-react'
import { ColumnDef } from '@tanstack/react-table'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'
import { exportToCSV } from '@/lib/utils/export'

interface NewsletterSubscriber {
    id: string
    email: string
    subscribed_at: string
    is_active: boolean
}

export default function NewsletterPage() {
    const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([])
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0, thisMonth: 0 })

    const fetchSubscribers = useCallback(async () => {
        try {
            const supabase = getSupabaseClient()
            const { data, error } = await supabase
                .from('newsletter_subscribers')
                .select('*')
                .order('subscribed_at', { ascending: false })

            if (error) throw error

            const typedData = data as unknown as NewsletterSubscriber[]
            setSubscribers(typedData || [])

            // Calculate stats
            const total = typedData?.length || 0
            const active = typedData?.filter(s => s.is_active).length || 0
            const inactive = total - active

            // Count subscribers from this month
            const thisMonthStart = new Date()
            thisMonthStart.setDate(1)
            thisMonthStart.setHours(0, 0, 0, 0)
            const thisMonth = typedData?.filter(s =>
                new Date(s.subscribed_at) >= thisMonthStart
            ).length || 0

            setStats({ total, active, inactive, thisMonth })
        } catch (error) {
            console.error('Error fetching subscribers:', error)
            toast.error('Failed to load subscribers')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchSubscribers()

        // Real-time subscription
        const supabase = getSupabaseClient()
        const channel = supabase
            .channel('newsletter_changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'newsletter_subscribers' }, () => {
                fetchSubscribers()
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [fetchSubscribers])

    async function toggleSubscription(id: string, currentStatus: boolean) {
        try {
            const supabase = getSupabaseClient()
            const { error } = await supabase
                .from('newsletter_subscribers')
                // @ts-ignore
                .update({ is_active: !currentStatus })
                .eq('id', id)

            if (error) throw error

            toast.success(`Subscriber ${!currentStatus ? 'activated' : 'deactivated'}`)
            fetchSubscribers()
        } catch (error) {
            console.error('Error updating subscriber:', error)
            toast.error('Failed to update subscriber')
        }
    }

    async function deleteSubscriber(id: string) {
        if (!confirm('Are you sure you want to delete this subscriber?')) return

        try {
            const supabase = getSupabaseClient()
            const { error } = await supabase
                .from('newsletter_subscribers')
                .delete()
                .eq('id', id)

            if (error) throw error

            toast.success('Subscriber deleted successfully')
            fetchSubscribers()
        } catch (error) {
            console.error('Error deleting subscriber:', error)
            toast.error('Failed to delete subscriber')
        }
    }

    function handleExportAll() {
        const formatted = subscribers.map(s => ({
            Email: s.email,
            Status: s.is_active ? 'Active' : 'Inactive',
            'Subscribed At': new Date(s.subscribed_at).toLocaleString()
        }))
        exportToCSV(formatted, 'newsletter-subscribers')
        toast.success('Subscribers exported successfully')
    }

    function handleExportEmails() {
        const activeEmails = subscribers
            .filter(s => s.is_active)
            .map(s => ({ Email: s.email }))
        exportToCSV(activeEmails, 'active-emails')
        toast.success('Email list exported successfully')
    }

    const columns: ColumnDef<NewsletterSubscriber>[] = [
        {
            accessorKey: 'email',
            header: 'Email',
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="font-medium text-gray-900">{row.original.email}</span>
                </div>
            ),
        },
        {
            accessorKey: 'is_active',
            header: 'Status',
            cell: ({ row }) => (
                <Badge variant="outline" className={
                    row.original.is_active
                        ? 'bg-green-100 text-green-800 border-green-200'
                        : 'bg-gray-100 text-gray-800 border-gray-200'
                }>
                    {row.original.is_active ? 'Active' : 'Inactive'}
                </Badge>
            ),
        },
        {
            accessorKey: 'subscribed_at',
            header: 'Subscribed',
            cell: ({ row }) => (
                <p className="text-sm text-gray-600">
                    {formatDistanceToNow(new Date(row.original.subscribed_at), { addSuffix: true })}
                </p>
            ),
        },
        {
            id: 'actions',
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleSubscription(row.original.id, row.original.is_active)}
                    >
                        {row.original.is_active ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteSubscriber(row.original.id)}
                        className="text-red-600 hover:bg-red-50"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            ),
        },
    ]

    if (loading) {
        return (
            <div className="space-y-6">
                <h1 className="text-3xl font-bold text-gray-900">Newsletter</h1>
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
                    <h1 className="text-3xl font-bold text-gray-900">Newsletter Subscribers</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Manage newsletter subscriptions
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleExportEmails}>
                        <Download className="h-4 w-4 mr-2" />
                        Export Emails
                    </Button>
                    <Button onClick={handleExportAll}>
                        <Download className="h-4 w-4 mr-2" />
                        Export All
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-4">
                <div className="rounded-xl border bg-white p-6 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="rounded-lg bg-blue-100 p-3">
                            <Users className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Subscribers</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                        </div>
                    </div>
                </div>
                <div className="rounded-xl border bg-white p-6 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="rounded-lg bg-green-100 p-3">
                            <Mail className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-600">Active</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
                        </div>
                    </div>
                </div>
                <div className="rounded-xl border bg-white p-6 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="rounded-lg bg-gray-100 p-3">
                            <Mail className="h-6 w-6 text-gray-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-600">Inactive</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.inactive}</p>
                        </div>
                    </div>
                </div>
                <div className="rounded-xl border bg-white p-6 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="rounded-lg bg-coral-light p-3">
                            <TrendingUp className="h-6 w-6 text-coral" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-600">This Month</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.thisMonth}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Data Table */}
            <div className="rounded-xl border bg-white shadow-sm">
                <DataTable
                    columns={columns}
                    data={subscribers}
                    searchKey="email"
                    searchPlaceholder="Search by email..."
                />
            </div>
        </div>
    )
}
