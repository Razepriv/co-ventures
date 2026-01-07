/** @type {import('next').Metadata} */
export const homePageMetadata = {
  title: 'Co Housing Ventures - Affordable Co-Ownership Real Estate in India',
  description: 'Unlock your dream home through co-housing. Join forces with verified co-buyers to own premium properties at a fraction of the cost. Explore opportunities now.',
  keywords: ['co-housing', 'real estate', 'shared ownership', 'affordable housing', 'property investment', 'India'],
  openGraph: {
    title: 'Co Housing Ventures - Affordable Co-Ownership Real Estate',
    description: 'Unlock your dream home through co-housing. Join forces to own premium properties at a fraction of the cost.',
    type: 'website',
    locale: 'en_IN',
    siteName: 'Co Housing Ventures',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Co Housing Ventures - Affordable Co-Ownership Real Estate',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Co Housing Ventures',
    description: 'Unlock your dream home through co-housing.',
    images: ['/images/twitter-image.jpg'],
  },
};

// Structured Data for SEO
export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Co Housing Ventures',
  url: 'https://cohousingventures.com',
  logo: 'https://cohousingventures.com/logo.png',
  description: 'Making premium real estate accessible through collaborative co-ownership',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '123 Business Park, Koramangala',
    addressLocality: 'Bangalore',
    postalCode: '560095',
    addressCountry: 'IN',
  },
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+91-98765-43210',
    contactType: 'Customer Service',
    email: 'hello@cohousingventures.com',
    availableLanguage: ['English', 'Hindi'],
  },
  sameAs: [
    'https://facebook.com/cohousingventures',
    'https://twitter.com/cohousingventures',
    'https://linkedin.com/company/cohousingventures',
    'https://instagram.com/cohousingventures',
  ],
};

export const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Co Housing Ventures',
  url: 'https://cohousingventures.com',
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://cohousingventures.com/properties?search={search_term_string}',
    'query-input': 'required name=search_term_string',
  },
};

export const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: 'https://cohousingventures.com',
    },
  ],
};
