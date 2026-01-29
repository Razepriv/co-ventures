"use client"

import { useState, useEffect, useCallback } from 'react'
import { getSupabaseClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { ArrowLeft, Mail, Phone, Clock, Eye, CheckCircle2, Calendar, MapPin, Building, User } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { formatDistanceToNow, format } from 'date-fns'

interface Enquiry {
    id: string
    full_name: string
    email: string
    phone: string
    property_id: string
    properties: {
        title: string
        location: string
        price: number
        image_url: string
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

export default function EnquiryDetailPage({ params }: { params: { id: string } }) {
    const router = useRouter()
    const [enquiry, setEnquiry] = useState<Enquiry | null>(null)
    const [loading, setLoading] = useState(true)

    const fetchEnquiry = useCallback(async () => {
        try {
            const supabase = getSupabaseClient()
            const { data, error } = await supabase
                .from('enquiries')
                .select(`
          *,
          properties (title, location, price, image_url)
        `)
                .eq('id', params.id)
                .single()

            if (error) throw error

            setEnquiry(data)
        } catch (error) {
            console.error('Error fetching enquiry:', error)
            toast.error('Failed to load enquiry details')
            router.push('/admin/enquiries')
        } finally {
            setLoading(false)
        }
    }, [params.id, router])

    useEffect(() => {
        fetchEnquiry()
    }, [fetchEnquiry])

    async function updateStatus(status: string) {
        if (!enquiry) return

        try {
            const supabase = getSupabaseClient()
            const { error } = await supabase
                .from('enquiries')
                // @ts-ignore
                .update({ status })
                .eq('id', enquiry.id)

            if (error) throw error

            toast.success('Status updated successfully')
            setEnquiry({ ...enquiry, status: status as any })
        } catch (error) {
            console.error('Error updating status:', error)
            toast.error('Failed to update status')
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-coral-600"></div>
            </div>
        )
    }

    if (!enquiry) return null

    const StatusIcon = statusConfig[enquiry.status].icon

    return (
        <div className="space-y-6 px-6 max-w-4xl mx-auto py-8">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.back()}
                    className="text-gray-500 hover:text-gray-900"
                >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Back
                </Button>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Enquiry Details</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Received {formatDistanceToNow(new Date(enquiry.created_at), { addSuffix: true })}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {Object.entries(statusConfig).map(([key, config]) => (
                        <Button
                            key={key}
                            variant={enquiry.status === key ? 'primary' : 'outline'}
                            size="sm"
                            onClick={() => updateStatus(key)}
                            className={enquiry.status === key ? 'bg-coral hover:bg-coral-600' : ''}
                        >
                            <config.icon className="h-3 w-3 mr-1" />
                            {config.label}
                        </Button>
                    ))}
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Contact Information */}
                <div className="bg-white rounded-xl border shadow-sm p-6 space-y-4">
                    <div className="flex items-center gap-2 border-b pb-3">
                        <User className="h-5 w-5 text-gray-400" />
                        <h2 className="font-semibold text-gray-900">Contact Information</h2>
                    </div>

                    <div className="space-y-3">
                        <div>
                            <label className="text-xs font-medium text-gray-500 uppercase">Name</label>
                            <p className="text-gray-900 font-medium">{enquiry.full_name}</p>
                        </div>

                        <div>
                            <label className="text-xs font-medium text-gray-500 uppercase">Email</label>
                            <div className="flex items-center gap-2 mt-1">
                                <Mail className="h-4 w-4 text-gray-400" />
                                <a href={`mailto:${enquiry.email}`} className="text-blue-600 hover:underline">
                                    {enquiry.email}
                                </a>
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-medium text-gray-500 uppercase">Phone</label>
                            <div className="flex items-center gap-2 mt-1">
                                <Phone className="h-4 w-4 text-gray-400" />
                                <a href={`tel:${enquiry.phone}`} className="text-blue-600 hover:underline">
                                    {enquiry.phone}
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Property Information */}
                {enquiry.properties && (
                    <div className="bg-white rounded-xl border shadow-sm p-6 space-y-4">
                        <div className="flex items-center gap-2 border-b pb-3">
                            <Building className="h-5 w-5 text-gray-400" />
                            <h2 className="font-semibold text-gray-900">Property Interest</h2>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <label className="text-xs font-medium text-gray-500 uppercase">Property</label>
                                <p className="text-gray-900 font-medium">{enquiry.properties.title}</p>
                            </div>

                            <div>
                                <label className="text-xs font-medium text-gray-500 uppercase">Location</label>
                                <div className="flex items-center gap-2 mt-1">
                                    <MapPin className="h-4 w-4 text-gray-400" />
                                    <p className="text-gray-600">{enquiry.properties.location}</p>
                                </div>
                            </div>

                            <div className="pt-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full"
                                    onClick={() => window.open(`/properties/${enquiry.property_id}`, '_blank')}
                                >
                                    View Property
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Message */}
                <div className="bg-white rounded-xl border shadow-sm p-6 space-y-4 md:col-span-2">
                    <div className="flex items-center gap-2 border-b pb-3">
                        <Mail className="h-5 w-5 text-gray-400" />
                        <h2 className="font-semibold text-gray-900">Message</h2>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 text-gray-700 whitespace-pre-wrap">
                        {enquiry.message || "No message provided."}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-gray-400 mt-2">
                        <Calendar className="h-3 w-3" />
                        <span>Sent on {format(new Date(enquiry.created_at), 'PPP p')}</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
