import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'FAQs | Co-ventures - Straight Answers to Real Estate Investment Questions',
  description: 'Get clear answers to common questions about real estate investment evaluation, risk management, and our disciplined process—in plain English.',
  openGraph: {
    title: 'FAQs | Co-ventures',
    description: 'Straight answers to common questions—so you can evaluate opportunities with clarity.',
  },
}

export default function FAQsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

