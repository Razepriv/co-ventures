"use client"

import { useState, useEffect, useCallback } from 'react'
import { getSupabaseClient } from '@/lib/supabase/client'
import { DataTable } from '@/components/admin/data-table'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Progress } from '@/components/ui/progress'
import { Users, TrendingUp, DollarSign, Eye, Edit, Lock, Unlock } from 'lucide-react'
import { ColumnDef } from '@tanstack/react-table'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'

interface PropertyGroup {
    id: string
    property_id: string
    properties: {
        title: string
        location: string
        price: number
    }
    total_slots: number
    filled_slots: number
    minimum_investment: number
    target_amount: number
    current_amount: number
    status: 'open' | 'closed' | 'full'
    created_at: string
    _count?: {
        group_members: number
    }
}

const statusConfig = {
    open: { color: 'bg-green-100 text-green-800 border-green-200', icon: Unlock, label: 'Open' },
    closed: { color: 'bg-gray-100 text-gray-800 border-gray-200', icon: Lock, label: 'Closed' },
    full: { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: Users, label: 'Full' },
}

export default function GroupsPage() {
    const [groups, setGroups] = useState<PropertyGroup[]>([])
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState({ total: 0, open: 0, closed: 0, full: 0, totalInvestment: 0 })

    const fetchGroups = useCallback(async () => {
        try {
            const supabase = getSupabaseClient()

            // First get the groups with properties
            const { data: groupsData, error: groupsError } = await supabase
                .from('property_groups')
                .select(`
                    *,
                    properties (title, location, price)
                `)
                .order('created_at', { ascending: false })

            if (groupsError) {
                console.error('Supabase error:', groupsError)
                throw groupsError
            }

            // Then get members for each group
            const groupsWithMembers = await Promise.all(
                (groupsData as any[] || []).map(async (group) => {
                    const { data: members, error: membersError } = await supabase
                        .from('group_members')
                        .select('id, investment_amount')
                        .eq('group_id', group.id)

                    if (membersError) {
                        console.error('Error fetching members:', membersError)
                        return {
                            ...group,
                            group_members: [],
                            _count: { group_members: 0 },
                            current_amount: 0
                        }
                    }

                    const currentAmount = (members as any[])?.reduce((sum, member) =>
                        sum + (member.investment_amount || 0), 0) || 0

                    return {
                        ...group,
                        group_members: members || [],
                        _count: { group_members: members?.length || 0 },
                        current_amount: currentAmount
                    }
                })
            )

            setGroups(groupsWithMembers as unknown as PropertyGroup[])

            // Calculate stats
            const total = groupsWithMembers.length
            const open = groupsWithMembers.filter(g => g.status === 'open').length
            const closed = groupsWithMembers.filter(g => g.status === 'closed').length
            const full = groupsWithMembers.filter(g => g.status === 'full').length
            const totalInvestment = groupsWithMembers.reduce((sum, g) => sum + (g.current_amount || 0), 0)

            setStats({ total, open, closed, full, totalInvestment })
        } catch (error: any) {
            console.error('Error fetching groups:', error)
            const errorMessage = error?.message || 'Failed to load groups'
            toast.error(`Failed to load groups: ${errorMessage}`)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchGroups()

        // Real-time subscription
        const supabase = getSupabaseClient()
        const channel = supabase
            .channel('groups_changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'property_groups' }, () => {
                fetchGroups()
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'group_members' }, () => {
                fetchGroups()
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [fetchGroups])

    async function updateGroupStatus(id: string, status: string) {
        try {
            const supabase = getSupabaseClient()
            const { error } = await supabase
                .from('property_groups')
                // @ts-ignore
                .update({ status })
                .eq('id', id)

            if (error) throw error

            toast.success(`Group ${status} successfully`)
            fetchGroups()
        } catch (error) {
            console.error('Error updating group:', error)
            toast.error('Failed to update group status')
        }
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
        }).format(amount)
    }

    const columns: ColumnDef<PropertyGroup>[] = [
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
            accessorKey: 'progress',
            header: 'Progress',
            cell: ({ row }) => {
                const progress = (row.original.filled_slots / row.original.total_slots) * 100
                return (
                    <div className="space-y-2 min-w-[200px]">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">
                                {row.original.filled_slots} / {row.original.total_slots} slots
                            </span>
                            <span className="font-medium">{Math.round(progress)}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                    </div>
                )
            },
        },
        {
            accessorKey: 'investment',
            header: 'Investment',
            cell: ({ row }) => (
                <div className="space-y-1">
                    <p className="font-medium text-gray-900">
                        {formatCurrency(row.original.current_amount || 0)}
                    </p>
                    <p className="text-xs text-gray-500">
                        Target: {formatCurrency(row.original.target_amount)}
                    </p>
                    <p className="text-xs text-gray-500">
                        Min: {formatCurrency(row.original.minimum_investment)}
                    </p>
                </div>
            ),
        },
        {
            accessorKey: 'members',
            header: 'Members',
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">{row.original._count?.group_members || 0}</span>
                </div>
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
                <div className="flex items-center gap-2">
                    <Link href={`/admin/groups/${row.original.id}`}>
                        <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                        </Button>
                    </Link>
                    {row.original.status === 'open' && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateGroupStatus(row.original.id, 'closed')}
                        >
                            <Lock className="h-4 w-4 mr-1" />
                            Close
                        </Button>
                    )}
                    {row.original.status === 'closed' && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateGroupStatus(row.original.id, 'open')}
                        >
                            <Unlock className="h-4 w-4 mr-1" />
                            Open
                        </Button>
                    )}
                </div>
            ),
        },
    ]

    if (loading) {
        return (
            <div className="space-y-6">
                <h1 className="text-3xl font-bold text-gray-900">Group Buying</h1>
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
                <h1 className="text-3xl font-bold text-gray-900">Group Buying Management</h1>
                <p className="mt-1 text-sm text-gray-500">
                    Manage investment groups and allocate members
                </p>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-4">
                <div className="rounded-xl border bg-white p-6 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="rounded-lg bg-blue-100 p-3">
                            <Users className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Groups</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                        </div>
                    </div>
                </div>
                <div className="rounded-xl border bg-white p-6 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="rounded-lg bg-green-100 p-3">
                            <Unlock className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-600">Open</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.open}</p>
                        </div>
                    </div>
                </div>
                <div className="rounded-xl border bg-white p-6 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="rounded-lg bg-gray-100 p-3">
                            <Lock className="h-6 w-6 text-gray-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-600">Closed</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.closed}</p>
                        </div>
                    </div>
                </div>
                <div className="rounded-xl border bg-white p-6 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="rounded-lg bg-coral-light p-3">
                            <DollarSign className="h-6 w-6 text-coral" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Investment</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {formatCurrency(stats.totalInvestment)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Data Table */}
            <div className="rounded-xl border bg-white shadow-sm">
                <DataTable
                    columns={columns}
                    data={groups}
                    searchKey="properties.title"
                    searchPlaceholder="Search by property..."
                />
            </div>
        </div>
    )
}
