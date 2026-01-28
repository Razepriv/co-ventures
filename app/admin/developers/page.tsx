"use client"

import { useState, useEffect, useCallback } from 'react'
import { getSupabaseClient } from '@/lib/supabase/client'
import { DataTable } from '@/components/admin/data-table'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Building2, Plus, Edit, Trash2, Image as ImageIcon, Check, X } from 'lucide-react'
import { ColumnDef } from '@tanstack/react-table'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'
import Image from 'next/image'

interface Developer {
    id: string
    name: string
    logo_url: string | null
    description: string | null
    website_url: string | null
    email: string | null
    phone: string | null
    years_of_experience: number | null
    total_projects: number | null
    is_active: boolean
    created_at: string
}

export default function DevelopersPage() {
    const [developers, setDevelopers] = useState<Developer[]>([])
    const [loading, setLoading] = useState(true)
    const [showDialog, setShowDialog] = useState(false)
    const [editingDeveloper, setEditingDeveloper] = useState<Developer | null>(null)
    const [formData, setFormData] = useState({
        name: '',
        logo_url: '',
        description: '',
        website_url: '',
        email: '',
        phone: '',
        years_of_experience: '',
        total_projects: '',
        is_active: true
    })
    const [uploadingLogo, setUploadingLogo] = useState(false)

    const fetchDevelopers = useCallback(async () => {
        try {
            const supabase = getSupabaseClient()
            const { data, error } = await supabase
                .from('developers')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) throw error
            setDevelopers((data as any[])?.map(d => ({
                ...d,
                years_of_experience: d.years_of_experience,
                total_projects: d.total_projects
            })) as Developer[] || [])
        } catch (error) {
            console.error('Error fetching developers:', error)
            toast.error('Failed to load developers')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchDevelopers()

        // Real-time subscription
        const supabase = getSupabaseClient()
        const channel = supabase
            .channel('developers_changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'developers' }, () => {
                fetchDevelopers()
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [fetchDevelopers])

    async function handleEdit(developer: Developer) {
        setEditingDeveloper(developer)
        setFormData({
            name: developer.name,
            logo_url: developer.logo_url || '',
            description: developer.description || '',
            website_url: developer.website_url || '',
            email: developer.email || '',
            phone: developer.phone || '',
            years_of_experience: developer.years_of_experience?.toString() || '',
            total_projects: developer.total_projects?.toString() || '',
            is_active: developer.is_active
        })
        setShowDialog(true)
    }

    function handleNew() {
        setEditingDeveloper(null)
        setFormData({
            name: '',
            logo_url: '',
            description: '',
            website_url: '',
            email: '',
            phone: '',
            years_of_experience: '',
            total_projects: '',
            is_active: true
        })
        setShowDialog(true)
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()

        if (!formData.name) {
            toast.error('Developer name is required')
            return
        }

        try {
            const supabase = getSupabaseClient()
            const developerData = {
                name: formData.name,
                logo_url: formData.logo_url || null,
                description: formData.description || null,
                website_url: formData.website_url || null,
                email: formData.email || null,
                phone: formData.phone || null,
                years_of_experience: formData.years_of_experience ? parseInt(formData.years_of_experience) : null,
                total_projects: formData.total_projects ? parseInt(formData.total_projects) : null,
                is_active: formData.is_active
            }

            if (editingDeveloper) {
                const { error } = await supabase
                    .from('developers')
                    // @ts-ignore
                    .update(developerData)
                    .eq('id', editingDeveloper.id)

                if (error) throw error
                toast.success('Developer updated successfully')
            } else {
                const { error } = await supabase
                    .from('developers')
                    // @ts-ignore
                    .insert(developerData)

                if (error) throw error
                toast.success('Developer created successfully')
            }

            setShowDialog(false)
            fetchDevelopers()
        } catch (error: any) {
            console.error('Error saving developer:', error)
            toast.error(error.message || 'Failed to save developer')
        }
    }

    async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file) return

        try {
            setUploadingLogo(true)
            const supabase = getSupabaseClient()
            const fileExt = file.name.split('.').pop()
            const fileName = `dev-${Date.now()}.${fileExt}`
            const filePath = `developers/${fileName}`

            const { error: uploadError } = await supabase.storage
                .from('coventures')
                .upload(filePath, file)

            if (uploadError) throw uploadError

            const { data: { publicUrl } } = supabase.storage
                .from('coventures')
                .getPublicUrl(filePath)

            setFormData(prev => ({ ...prev, logo_url: publicUrl }))
            toast.success('Logo uploaded successfully')
        } catch (error) {
            console.error('Error uploading logo:', error)
            toast.error('Failed to upload logo')
        } finally {
            setUploadingLogo(false)
        }
    }

    async function toggleActive(id: string, currentStatus: boolean) {
        try {
            const supabase = getSupabaseClient()
            const { error } = await supabase
                .from('developers')
                // @ts-ignore
                .update({ is_active: !currentStatus })
                .eq('id', id)

            if (error) throw error
            toast.success(`Developer ${!currentStatus ? 'activated' : 'deactivated'}`)
            fetchDevelopers()
        } catch (error) {
            console.error('Error toggling developer status:', error)
            toast.error('Failed to update status')
        }
    }

    async function deleteDeveloper(id: string) {
        if (!confirm('Are you sure you want to delete this developer?')) return

        try {
            const supabase = getSupabaseClient()
            const { error } = await supabase
                .from('developers')
                .delete()
                .eq('id', id)

            if (error) throw error
            toast.success('Developer deleted successfully')
            fetchDevelopers()
        } catch (error) {
            console.error('Error deleting developer:', error)
            toast.error('Failed to delete developer')
        }
    }

    const columns: ColumnDef<Developer>[] = [
        {
            accessorKey: 'name',
            header: 'Developer',
            cell: ({ row }) => (
                <div className="flex items-center gap-3">
                    {row.original.logo_url ? (
                        <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-gray-100 border shadow-sm">
                            <Image
                                src={row.original.logo_url}
                                alt={row.original.name}
                                fill
                                className="object-contain p-1"
                            />
                        </div>
                    ) : (
                        <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center border border-dashed text-gray-400">
                            <Building2 className="h-6 w-6" />
                        </div>
                    )}
                    <div>
                        <p className="font-medium text-gray-900 leading-tight">{row.original.name}</p>
                        {row.original.website_url && (
                            <a
                                href={row.original.website_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[10px] text-coral hover:underline font-medium"
                            >
                                Visit Website
                            </a>
                        )}
                    </div>
                </div>
            ),
        },
        {
            accessorKey: 'experience',
            header: 'Experience',
            cell: ({ row }) => (
                <div className="space-y-1">
                    {row.original.years_of_experience && (
                        <p className="text-sm text-gray-900">
                            {row.original.years_of_experience} years
                        </p>
                    )}
                    {row.original.total_projects && (
                        <p className="text-xs text-gray-500">
                            {row.original.total_projects} projects
                        </p>
                    )}
                </div>
            ),
        },
        {
            accessorKey: 'contact',
            header: 'Contact',
            cell: ({ row }) => (
                <div className="space-y-1 text-sm">
                    {row.original.email && (
                        <p className="text-gray-600">{row.original.email}</p>
                    )}
                    {row.original.phone && (
                        <p className="text-gray-600">{row.original.phone}</p>
                    )}
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
            accessorKey: 'created_at',
            header: 'Added',
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
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(row.original)}
                    >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleActive(row.original.id, row.original.is_active)}
                    >
                        {row.original.is_active ? (
                            <><X className="h-4 w-4 mr-1" /> Deactivate</>
                        ) : (
                            <><Check className="h-4 w-4 mr-1" /> Activate</>
                        )}
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteDeveloper(row.original.id)}
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
                <h1 className="text-3xl font-bold text-gray-900">Developers</h1>
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
                    <h1 className="text-3xl font-bold text-gray-900">Developer Management</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Manage property developers and builders
                    </p>
                </div>
                <Dialog open={showDialog} onOpenChange={setShowDialog}>
                    <DialogTrigger asChild>
                        <Button onClick={handleNew}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Developer
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>
                                {editingDeveloper ? 'Edit Developer' : 'Add New Developer'}
                            </DialogTitle>
                            <DialogDescription>
                                {editingDeveloper ? 'Update developer information' : 'Create a new developer profile'}
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="md:col-span-2">
                                    <Label>Developer Logo</Label>
                                    <div className="mt-2 flex items-center gap-4">
                                        <div className="relative h-20 w-20 rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden group">
                                            {formData.logo_url ? (
                                                <Image src={formData.logo_url} alt="Logo" fill className="object-contain p-2" />
                                            ) : (
                                                <Building2 className="h-8 w-8 text-gray-300" />
                                            )}
                                            {uploadingLogo && (
                                                <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-coral"></div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <input
                                                type="file"
                                                id="logo-upload-dev"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={handleLogoUpload}
                                                disabled={uploadingLogo}
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => document.getElementById('logo-upload-dev')?.click()}
                                                disabled={uploadingLogo}
                                            >
                                                {uploadingLogo ? 'Uploading...' : formData.logo_url ? 'Change Logo' : 'Upload Logo'}
                                            </Button>
                                            <p className="text-[10px] text-gray-500">PNG or JPG, Max 2MB</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="md:col-span-2">
                                    <Label htmlFor="name">Developer Name *</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="e.g., Prestige Group"
                                        required
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Brief description about the developer..."
                                        rows={3}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="website_url">Website</Label>
                                    <Input
                                        id="website_url"
                                        type="url"
                                        value={formData.website_url}
                                        onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                                        placeholder="https://example.com"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="contact@developer.com"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="phone">Phone</Label>
                                    <Input
                                        id="phone"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        placeholder="+91 9876543210"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="years_of_experience">Years of Experience</Label>
                                    <Input
                                        id="years_of_experience"
                                        type="number"
                                        value={formData.years_of_experience}
                                        onChange={(e) => setFormData({ ...formData, years_of_experience: e.target.value })}
                                        placeholder="25"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="total_projects">Total Projects</Label>
                                    <Input
                                        id="total_projects"
                                        type="number"
                                        value={formData.total_projects}
                                        onChange={(e) => setFormData({ ...formData, total_projects: e.target.value })}
                                        placeholder="150"
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="is_active"
                                        checked={formData.is_active}
                                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                        className="h-4 w-4 rounded border-gray-300 text-coral focus:ring-coral"
                                    />
                                    <Label htmlFor="is_active" className="cursor-pointer">Active</Label>
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 pt-4">
                                <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit">
                                    {editingDeveloper ? 'Update' : 'Create'} Developer
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-xl border bg-white p-6 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="rounded-lg bg-blue-100 p-3">
                            <Building2 className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Developers</p>
                            <p className="text-2xl font-bold text-gray-900">{developers.length}</p>
                        </div>
                    </div>
                </div>
                <div className="rounded-xl border bg-white p-6 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="rounded-lg bg-green-100 p-3">
                            <Check className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-600">Active</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {developers.filter(d => d.is_active).length}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="rounded-xl border bg-white p-6 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="rounded-lg bg-gray-100 p-3">
                            <X className="h-6 w-6 text-gray-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-600">Inactive</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {developers.filter(d => !d.is_active).length}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Data Table */}
            <div className="rounded-xl border bg-white shadow-sm">
                <DataTable
                    columns={columns}
                    data={developers}
                    searchKey="name"
                    searchPlaceholder="Search developers..."
                />
            </div>
        </div>
    )
}
