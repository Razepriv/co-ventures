'use client'

import { Shield, Download, ExternalLink } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import Image from 'next/image'

interface ReraInfo {
    rera_number: string
    qr_code_url?: string
    status: string
    description?: string
    certificate_url?: string
    valid_until?: string
}

interface RERASectionProps {
    reraInfo: ReraInfo | null
    reraNumber?: string
}

export function RERASection({ reraInfo, reraNumber }: RERASectionProps) {
    // Use reraInfo if available, otherwise fall back to simple reraNumber
    const rera = reraInfo || (reraNumber ? { rera_number: reraNumber, status: 'approved' } : null)

    if (!rera) {
        return null
    }

    return (
        <Card className="border-green-200 bg-green-50/30">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-green-600" />
                    RERA Information
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">RERA Registration Number</p>
                            <p className="text-lg font-bold text-gray-900 font-mono">{rera.rera_number}</p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-600 mb-1">Status</p>
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                {rera.status === 'approved' ? 'Approved & Verified' : rera.status}
                            </div>
                        </div>

                        {reraInfo?.description && (
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Description</p>
                                <p className="text-sm text-gray-700">{reraInfo.description}</p>
                            </div>
                        )}

                        {reraInfo?.valid_until && (
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Valid Until</p>
                                <p className="text-sm font-medium text-gray-900">
                                    {new Date(reraInfo.valid_until).toLocaleDateString('en-IN', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric'
                                    })}
                                </p>
                            </div>
                        )}

                        {reraInfo?.certificate_url && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(reraInfo.certificate_url, '_blank')}
                                className="w-full md:w-auto"
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Download Certificate
                            </Button>
                        )}
                    </div>

                    {reraInfo?.qr_code_url && (
                        <div className="flex flex-col items-center justify-center p-4 bg-white rounded-lg border border-gray-200">
                            <p className="text-sm text-gray-600 mb-3">Scan QR Code to Verify</p>
                            <div className="relative w-48 h-48 bg-gray-100 rounded-lg overflow-hidden">
                                <Image
                                    src={reraInfo.qr_code_url}
                                    alt="RERA QR Code"
                                    fill
                                    className="object-contain p-2"
                                />
                            </div>
                        </div>
                    )}
                </div>

                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs text-blue-800">
                        <strong>RERA Compliance:</strong> This property is registered under the Real Estate
                        (Regulation and Development) Act, 2016, ensuring transparency and accountability in all
                        transactions.
                    </p>
                </div>
            </CardContent>
        </Card>
    )
}
