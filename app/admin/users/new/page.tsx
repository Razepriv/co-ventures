"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { ArrowLeft, UserPlus, Mail, Lock, Shield, User, Crown } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

export default function NewUserPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        full_name: '',
        role: 'user'
    })

    async function handleCreateUser(e: React.FormEvent) {
        e.preventDefault()

        if (!formData.email || !formData.password || !formData.full_name) {
            toast.error('Please fill in all required fields')
            return
        }

        if (formData.password.length < 8) {
            toast.error('Password must be at least 8 characters')
            return
        }

        setLoading(true)
        try {
            const response = await fetch('/api/admin/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create user')
            }

            toast.success('User created successfully')
            router.push('/admin/users')
        } catch (error: any) {
            console.error('Error creating user:', error)
            toast.error(error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6 px-6">
            <div className="flex items-center gap-4">
                <Link href="/admin/users">
                    <Button variant="outline" size="sm">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Add New User</h1>
                    <p className="mt-1 text-sm text-gray-500">Create a new user account manually</p>
                </div>
            </div>

            <div className="max-w-2xl">
                <Card>
                    <CardHeader>
                        <CardTitle>User Details</CardTitle>
                        <CardDescription>
                            Fill in the information below to create a new user account.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleCreateUser} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="full_name">Full Name *</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="full_name"
                                        value={formData.full_name}
                                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                        placeholder="John Doe"
                                        className="pl-10"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email address *</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="john@example.com"
                                        className="pl-10"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Password *</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="password"
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        placeholder="••••••••"
                                        className="pl-10"
                                        required
                                    />
                                </div>
                                <p className="text-xs text-gray-500">Minimum 8 characters</p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="role">Account Role</Label>
                                <Select
                                    value={formData.role}
                                    onValueChange={(value) => setFormData({ ...formData, role: value })}
                                >
                                    <SelectTrigger id="role">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="user">
                                            <div className="flex items-center gap-2">
                                                <User className="h-4 w-4" />
                                                <span>Regular User</span>
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="admin">
                                            <div className="flex items-center gap-2">
                                                <Shield className="h-4 w-4" />
                                                <span>Administrator</span>
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="super_admin">
                                            <div className="flex items-center gap-2">
                                                <Crown className="h-4 w-4" />
                                                <span>Super Admin</span>
                                            </div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="pt-4 flex items-center justify-end gap-3">
                                <Link href="/admin/users">
                                    <Button variant="outline" type="button">Cancel</Button>
                                </Link>
                                <Button type="submit" disabled={loading} className="gap-2">
                                    <UserPlus className="h-4 w-4" />
                                    {loading ? 'Creating...' : 'Create User'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
