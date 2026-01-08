import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'How It Works - Co-ventures | Disciplined Real Estate Investment Process',
  description: 'A structured, investor-friendly process built to reduce uncertainty and improve decision quality. Learn how Co-ventures helps you evaluate Indian real estate opportunities with clarity and control.',
  keywords: ['real estate investment process', 'property due diligence', 'real estate underwriting', 'India real estate', 'disciplined investing', 'co-ventures'],
  openGraph: {
    title: 'How It Works - Co-ventures',
    description: 'A disciplined, investor-friendly process built to reduce uncertainty and improve decision quality—without hype.',
    type: 'website',
  },
}

export default function HowItWorksLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

