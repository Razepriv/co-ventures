'use client'

import { useState } from 'react'
import { Users, UserPlus, Lock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { toast } from 'sonner'
import { useAuth } from '@/lib/auth/AuthProvider'

interface PropertyGroup {
    total_slots: number
    filled_slots: number
    is_locked: boolean
    group_members?: Array<{ full_name: string; joined_at: string }>
}

interface GroupBuyingSectionProps {
    propertyId: string
    group: PropertyGroup
    onJoinSuccess: () => void
}

export function GroupBuyingSection({ propertyId, group, onJoinSuccess }: GroupBuyingSectionProps) {
    const { user } = useAuth()
    const [showJoinModal, setShowJoinModal] = useState(false)
    const [joining, setJoining] = useState(false)
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        phone: ''
    })

    const handleJoinGroup = async () => {
        if (!user) {
            toast.error('Please login to join the group')
            return
        }

        if (!formData.full_name || !formData.email) {
            toast.error('Please fill in all required fields')
            return
        }

        setJoining(true)
        try {
            const response = await fetch(`/api/properties/${propertyId}/group`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to join group')
            }

            toast.success('Successfully joined the investment group!')
            setShowJoinModal(false)
            setFormData({ full_name: '', email: '', phone: '' })
            onJoinSuccess()
        } catch (error: any) {
            console.error('Error joining group:', error)
            toast.error(error.message || 'Failed to join group')
        } finally {
            setJoining(false)
        }
    }

    const percentage = (group.filled_slots / group.total_slots) * 100

    return (
        <>
            <Card className="border-2 border-coral/20 bg-gradient-to-br from-coral/5 to-orange-50/50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-coral" />
                        Group Investment
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-600">Group Progress</span>
                            <span className="text-sm font-bold text-gray-900">
                                {group.filled_slots}/{group.total_slots} Members
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                            <div
                                className="bg-gradient-to-r from-coral to-orange-500 h-full transition-all duration-500"
                                style={{ width: `${percentage}%` }}
                            />
                        </div>
                    </div>

                    {group.is_locked ? (
                        <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <Lock className="w-5 h-5 text-yellow-600" />
                            <p className="text-sm text-yellow-800 font-medium">
                                This group is now locked and not accepting new members
                            </p>
                        </div>
                    ) : group.filled_slots >= group.total_slots ? (
                        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                            <p className="text-sm text-green-800 font-medium">
                                🎉 Group is now full!
                            </p>
                        </div>
                    ) : (
                        <Button
                            onClick={() => setShowJoinModal(true)}
                            className="w-full"
                            size="lg"
                        >
                            <UserPlus className="w-5 h-5 mr-2" />
                            Join Investment Group
                        </Button>
                    )}

                    {group.group_members && group.group_members.length > 0 && (
                        <div>
                            <p className="text-xs text-gray-600 mb-2">Recent Members</p>
                            <div className="space-y-1">
                                {group.group_members.slice(0, 3).map((member, idx) => (
                                    <div key={idx} className="text-xs text-gray-700 flex items-center gap-2">
                                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                                        {member.full_name}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Join Group Modal */}
            {showJoinModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative z-[61]">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-gray-900">Join Investment Group</h3>
                            <button
                                onClick={() => setShowJoinModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Full Name *
                                </label>
                                <Input
                                    value={formData.full_name}
                                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                    placeholder="Enter your full name"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email *
                                </label>
                                <Input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="Enter your email"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Phone (Optional)
                                </label>
                                <Input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="Enter your phone number"
                                />
                            </div>

                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    onClick={() => setShowJoinModal(false)}
                                    className="flex-1"
                                    disabled={joining}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleJoinGroup}
                                    className="flex-1"
                                    disabled={joining}
                                >
                                    {joining ? 'Joining...' : 'Join Group'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
