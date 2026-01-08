import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { organizationSchema, websiteSchema } from '@/lib/seo';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/lib/auth/AuthProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'H Co Housy Ventures - Affordable Co-Ownership Real Estate in India',
  description: 'Unlock your dream home through co-housing. Join forces with verified co-buyers to own premium properties at a fraction of the cost. Explore opportunities now.',
  keywords: ['co-housing', 'real estate', 'shared ownership', 'affordable housing', 'property investment', 'India', 'housy ventures'],
  authors: [{ name: 'H Co Housy Ventures' }],
  openGraph: {
    title: 'H Co Housy Ventures - Affordable Co-Ownership Real Estate',
    description: 'Unlock your dream home through co-housing. Join forces to own premium properties at a fraction of the cost.',
    type: 'website',
    locale: 'en_IN',
    siteName: 'H Co Housy Ventures',
    images: ['/logo.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'H Co Housy Ventures',
    description: 'Unlock your dream home through co-housing.',
    images: ['/logo.png'],
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
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
