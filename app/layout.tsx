import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { organizationSchema, websiteSchema } from '@/lib/seo';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Co Housing Ventures - Affordable Co-Ownership Real Estate in India',
  description: 'Unlock your dream home through co-housing. Join forces with verified co-buyers to own premium properties at a fraction of the cost. Explore opportunities now.',
  keywords: ['co-housing', 'real estate', 'shared ownership', 'affordable housing', 'property investment', 'India'],
  authors: [{ name: 'Co Housing Ventures' }],
  openGraph: {
    title: 'Co Housing Ventures - Affordable Co-Ownership Real Estate',
    description: 'Unlock your dream home through co-housing. Join forces to own premium properties at a fraction of the cost.',
    type: 'website',
    locale: 'en_IN',
    siteName: 'Co Housing Ventures',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Co Housing Ventures',
    description: 'Unlock your dream home through co-housing.',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
  },
  robots: {
    index: true,
    follow: true,
  },
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <link rel="icon" href="/logo.svg" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
