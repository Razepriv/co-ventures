import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy | Co-ventures',
  description:
    'Learn how Co-ventures collects, uses, shares, and protects personal information on our website.',
  openGraph: {
    title: 'Privacy Policy | Co-ventures',
    description:
      'Learn how Co-ventures collects, uses, shares, and protects personal information on our website.',
    type: 'website',
  },
}

export default function PrivacyPolicyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

