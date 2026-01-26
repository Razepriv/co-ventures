"use client"

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/Badge'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { ArrowLeft, Users, DollarSign, Trash2, UserPlus, Mail, Phone } from 'lucide-react'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'

interface GroupMember {
    id: string
    user_id: string | null
    full_name: string
    email: string
    phone: string
    investment_amount: number
    joined_at: string
}

interface PropertyGroup {
    id: string
    property_id: string
    properties: {
        title: string
        location: string
        price: number
        featured_image: string
    }
    total_slots: number
    filled_slots: number
    minimum_investment: number
    target_amount: number
    status: string
    created_at: string
}

export default function GroupDetailPage() {
    const params = useParams()
    const router = useRouter()
    const groupId = params.id as string

    const [group, setGroup] = useState<PropertyGroup | null>(null)
    const [members, setMembers] = useState<GroupMember[]>([])
    const [loading, setLoading] = useState(true)
    const [showAddMember, setShowAddMember] = useState(false)
    const [newMember, setNewMember] = useState({
        full_name: '',
        email: '',
        phone: '',
        investment_amount: ''
    })

    const fetchGroupData = useCallback(async () => {
        try {
            const supabase = getSupabaseClient()

            // Fetch group details
            const { data: groupData, error: groupError } = await supabase
                .from('property_groups')
                .select('*, properties (title, location, price, featured_image)')
                .eq('id', groupId)
                .single()

            if (groupError) throw groupError
            setGroup(groupData as unknown as PropertyGroup)

            // Fetch members
            const { data: membersData, error: membersError } = await supabase
                .from('group_members')
                .select('*')
                .eq('group_id', groupId)
                .order('joined_at', { ascending: false })

            if (membersError) throw membersError
            setMembers(membersData as unknown as GroupMember[] || [])
        } catch (error) {
            console.error('Error fetching group data:', error)
            toast.error('Failed to load group data')
        } finally {
            setLoading(false)
        }
    }, [groupId])

    useEffect(() => {
        fetchGroupData()

        // Real-time subscription
        const supabase = getSupabaseClient()
        const channel = supabase
            .channel(`group_${groupId}`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'group_members',
                filter: `group_id=eq.${groupId}`
            }, () => {
                fetchGroupData()
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [groupId, fetchGroupData])

    async function addMember() {
        if (!newMember.full_name || !newMember.email || !newMember.investment_amount) {
            toast.error('Please fill in all required fields')
            return
        }

        try {
            const supabase = getSupabaseClient()
            const { error } = await supabase
                .from('group_members')
                // @ts-ignore
                .insert({
                    group_id: groupId,
                    full_name: newMember.full_name,
                    email: newMember.email,
                    phone: newMember.phone || null,
                    investment_amount: parseFloat(newMember.investment_amount)
                })

            if (error) throw error

            // Update filled slots
            const newFilledSlots = (group?.filled_slots || 0) + 1
            await supabase
                .from('property_groups')
                // @ts-ignore
                .update({
                    filled_slots: newFilledSlots,
                    status: newFilledSlots >= (group?.total_slots || 0) ? 'full' : 'open'
                })
                .eq('id', groupId)

            toast.success('Member added successfully')
            setShowAddMember(false)
            setNewMember({ full_name: '', email: '', phone: '', investment_amount: '' })
            fetchGroupData()
        } catch (error) {
            console.error('Error adding member:', error)
            toast.error('Failed to add member')
        }
    }

    async function removeMember(memberId: string) {
        if (!confirm('Are you sure you want to remove this member?')) return

        try {
            const supabase = getSupabaseClient()
            const { error } = await supabase
                .from('group_members')
                .delete()
                .eq('id', memberId)

            if (error) throw error

            // Update filled slots
            const newFilledSlots = Math.max(0, (group?.filled_slots || 0) - 1)
            await supabase
                .from('property_groups')
                // @ts-ignore
                .update({
                    filled_slots: newFilledSlots,
                    status: newFilledSlots >= (group?.total_slots || 0) ? 'full' : 'open'
                })
                .eq('id', groupId)

            toast.success('Member removed successfully')
            fetchGroupData()
        } catch (error) {
            console.error('Error removing member:', error)
            toast.error('Failed to remove member')
        }
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
        }).format(amount)
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-coral-600"></div>
            </div>
        )
    }

    if (!group) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">Group not found</p>
                <Link href="/admin/groups">
                    <Button className="mt-4">Back to Groups</Button>
                </Link>
            </div>
        )
    }

    const currentAmount = members.reduce((sum, m) => sum + (m.investment_amount || 0), 0)
    const progress = (group.filled_slots / group.total_slots) * 100

    return (
        <div className="space-y-6 px-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/admin/groups">
                    <Button variant="outline" size="sm">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">{group.properties?.title}</h1>
                    <p className="mt-1 text-sm text-gray-500">{group.properties?.location}</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="pb-3">
                        <CardDescription>Progress</CardDescription>
                        <CardTitle className="text-2xl">{Math.round(progress)}%</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Progress value={progress} className="h-2" />
                        <p className="text-xs text-gray-500 mt-2">
                            {group.filled_slots} / {group.total_slots} slots filled
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardDescription>Total Members</CardDescription>
                        <CardTitle className="text-2xl flex items-center gap-2">
                            <Users className="h-5 w-5 text-blue-600" />
                            {members.length}
                        </CardTitle>
                    </CardHeader>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardDescription>Current Investment</CardDescription>
                        <CardTitle className="text-2xl">
                            {formatCurrency(currentAmount)}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-gray-500">
                            Target: {formatCurrency(group.target_amount)}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardDescription>Status</CardDescription>
                        <CardTitle className="text-2xl">
                            <Badge variant="outline" className={
                                group.status === 'open' ? 'bg-green-100 text-green-800' :
                                    group.status === 'full' ? 'bg-blue-100 text-blue-800' :
                                        'bg-gray-100 text-gray-800'
                            }>
                                {group.status.toUpperCase()}
                            </Badge>
                        </CardTitle>
                    </CardHeader>
                </Card>
            </div>

            {/* Add Member Section */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Group Members</CardTitle>
                            <CardDescription>Manage investment group members</CardDescription>
                        </div>
                        <Button onClick={() => setShowAddMember(!showAddMember)}>
                            <UserPlus className="h-4 w-4 mr-2" />
                            Add Member
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {showAddMember && (
                        <div className="mb-6 p-4 border rounded-lg bg-gray-50">
                            <h3 className="font-semibold mb-4">Add New Member</h3>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <Label htmlFor="full_name">Full Name *</Label>
                                    <Input
                                        id="full_name"
                                        value={newMember.full_name}
                                        onChange={(e) => setNewMember({ ...newMember, full_name: e.target.value })}
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="email">Email *</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={newMember.email}
                                        onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                                        placeholder="john@example.com"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="phone">Phone</Label>
                                    <Input
                                        id="phone"
                                        value={newMember.phone}
                                        onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
                                        placeholder="+91 9876543210"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="investment_amount">Investment Amount (₹) *</Label>
                                    <Input
                                        id="investment_amount"
                                        type="number"
                                        value={newMember.investment_amount}
                                        onChange={(e) => setNewMember({ ...newMember, investment_amount: e.target.value })}
                                        placeholder="500000"
                                        min={group.minimum_investment}
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Minimum: {formatCurrency(group.minimum_investment)}
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-2 mt-4">
                                <Button onClick={addMember}>Add Member</Button>
                                <Button variant="outline" onClick={() => setShowAddMember(false)}>Cancel</Button>
                            </div>
                        </div>
                    )}

                    {/* Members List */}
                    <div className="space-y-3">
                        {members.length === 0 ? (
                            <p className="text-center text-gray-500 py-8">No members yet</p>
                        ) : (
                            members.map((member) => (
                                <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900">{member.full_name}</p>
                                        <div className="flex gap-4 mt-1 text-sm text-gray-500">
                                            <div className="flex items-center gap-1">
                                                <Mail className="h-3 w-3" />
                                                {member.email}
                                            </div>
                                            {member.phone && (
                                                <div className="flex items-center gap-1">
                                                    <Phone className="h-3 w-3" />
                                                    {member.phone}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <p className="font-semibold text-coral">
                                                {formatCurrency(member.investment_amount)}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {formatDistanceToNow(new Date(member.joined_at), { addSuffix: true })}
                                            </p>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => removeMember(member.id)}
                                            className="text-red-600 hover:bg-red-50"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
