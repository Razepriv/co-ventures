import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms & Conditions | Co-ventures',
  description:
    'Terms governing your use of the Co-ventures website and related communications.',
  openGraph: {
    title: 'Terms & Conditions | Co-ventures',
    description:
      'Terms governing your use of the Co-ventures website and related communications.',
    type: 'website',
  },
}

export default function TermsAndConditionsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

