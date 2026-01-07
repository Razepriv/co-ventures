# Co Housing Ventures - Development Guide

## Project Overview

A modern, responsive website for Co Housing Ventures built with Next.js 14, TypeScript, and Tailwind CSS. The home page features 13 comprehensive sections designed according to PRD specifications.

## Technology Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **Carousel:** Swiper
- **Icons:** Lucide React
- **Image Optimization:** Next.js Image component

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn or pnpm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env.local
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
co-housing-ventures/
├── app/
│   ├── layout.tsx          # Root layout with SEO metadata
│   ├── page.tsx            # Home page composition
│   └── globals.css         # Global styles and Tailwind directives
├── components/
│   ├── ui/                 # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── Section.tsx
│   │   └── Badge.tsx
│   ├── home/               # Home page sections
│   │   ├── HeroSection.tsx
│   │   ├── SearchBarSection.tsx
│   │   ├── WhyCoHousingSection.tsx
│   │   ├── FeaturedPropertiesSection.tsx
│   │   ├── HowItWorksSection.tsx
│   │   ├── ServicesSection.tsx
│   │   ├── SuccessStoriesSection.tsx
│   │   ├── ByTheNumbersSection.tsx
│   │   ├── TestimonialsSection.tsx
│   │   ├── BlogInsightsSection.tsx
│   │   └── CTASection.tsx
│   ├── Header.tsx          # Sticky navigation header
│   └── Footer.tsx          # Footer with links and newsletter
├── lib/
│   ├── utils.ts            # Utility functions
│   ├── mockData.ts         # Mock data for development
│   ├── api.ts              # API integration functions
│   └── seo.ts              # SEO metadata and schemas
├── types/
│   └── index.ts            # TypeScript type definitions
├── public/
│   ├── robots.txt          # Search engine crawling rules
│   ├── manifest.json       # PWA manifest
│   └── logo.svg            # Logo asset
└── Configuration files
    ├── tailwind.config.ts  # Tailwind configuration
    ├── tsconfig.json       # TypeScript configuration
    ├── next.config.js      # Next.js configuration
    └── package.json        # Dependencies and scripts
```

## Home Page Sections

### 1. Header (Sticky Navigation)
- **Location:** `components/Header.tsx`
- **Features:**
  - Sticky behavior with background transition on scroll
  - Currency selector (INR, USD, EUR)
  - Login/Account button
  - Mobile hamburger menu
  - Accessibility: Full keyboard navigation support

### 2. Hero Section
- **Location:** `components/home/HeroSection.tsx`
- **Features:**
  - Split layout (60/40) with content and image
  - Two CTA buttons: "Explore Properties" and "How It Works"
  - Trust indicators (500+ families, ₹100Cr+ properties, RERA certified)
  - Animations using Framer Motion
  - Responsive design

### 3. Search Bar Section
- **Location:** `components/home/SearchBarSection.tsx`
- **Features:**
  - Floating card design overlapping hero section
  - Location, Property Type, Price Range, Bedrooms filters
  - Search functionality with URL parameters
  - "More Filters" option
  - Mobile-responsive stacked layout

### 4. Why Co-Housing Section
- **Location:** `components/home/WhyCoHousingSection.tsx`
- **Features:**
  - 4-column grid layout (responsive)
  - Icon-based benefit cards
  - Hover animations
  - Light peach background

### 5. Featured Properties Section
- **Location:** `components/home/FeaturedPropertiesSection.tsx`
- **Features:**
  - 3-column property grid
  - Property cards with images, badges, save functionality
  - Price formatting in Indian number system
  - BHK, area, and status details
  - "View All" link to properties page

### 6. How It Works Section
- **Location:** `components/home/HowItWorksSection.tsx`
- **Features:**
  - 4-step timeline visualization
  - Dotted connecting lines (horizontal desktop, vertical mobile)
  - Step-by-step animations on scroll
  - Numbered icons

### 7. Services Section
- **Location:** `components/home/ServicesSection.tsx`
- **Features:**
  - Split layout: image (40%) + content (60%)
  - 5 service items with icons
  - Light peach background
  - "Explore All Services" CTA

### 8. Success Stories Section
- **Location:** `components/home/SuccessStoriesSection.tsx`
- **Features:**
  - 3-column blog/story cards
  - Category badges
  - Read time and publish date
  - Hover effects

### 9. By The Numbers Section
- **Location:** `components/home/ByTheNumbersSection.tsx`
- **Features:**
  - Gradient background (coral)
  - Animated counters with Intersection Observer
  - 4 key statistics
  - White text with icons

### 10. Testimonials Section
- **Location:** `components/home/TestimonialsSection.tsx`
- **Features:**
  - Swiper carousel
  - Auto-play with 5-second interval
  - 3 visible cards (responsive)
  - Star ratings
  - Customer profile information

### 11. Blog Insights Section
- **Location:** `components/home/BlogInsightsSection.tsx`
- **Features:**
  - Featured post (large, 60%) + 2 smaller posts (40%)
  - Category badges
  - Author, date, read time metadata
  - Light peach background

### 12. CTA Section
- **Location:** `components/home/CTASection.tsx`
- **Features:**
  - Gradient background
  - Two CTA buttons
  - Center-aligned content
  - White text on coral background

### 13. Footer
- **Location:** `components/Footer.tsx`
- **Features:**
  - 4-column layout: Brand, Quick Links, Resources, Contact
  - Social media icons
  - Newsletter signup form
  - Bottom bar with copyright and legal links
  - Dark background (#1A1A1A)

## Design System

### Colors

```typescript
coral: {
  DEFAULT: '#FF6B4A',
  dark: '#FF5A3D',
  light: '#FF8A6D',
}
charcoal: {
  DEFAULT: '#2D2D2D',
  dark: '#1A1A1A',
}
peach: {
  light: '#FFF5F2',
}
```

### Typography

- **Font Family:** Inter (Google Fonts)
- **Headings:** Bold (700), various sizes
- **Body:** Regular (400), 16px base
- **Small Text:** 14px
- **Micro Text:** 12px

### Spacing

- **Section Padding:** 100px vertical (desktop), 80px (tablet), 60px (mobile)
- **Container Max Width:** 1440px
- **Grid Gaps:** 32px (desktop), 24px (tablet), 16px (mobile)

### Shadows

- **Soft:** `0 2px 8px rgba(0,0,0,0.06)`
- **Medium:** `0 4px 16px rgba(0,0,0,0.08)`
- **Strong:** `0 8px 32px rgba(0,0,0,0.12)`
- **Hover:** `0 12px 32px rgba(0,0,0,0.12)`

### Transitions

- **Default Duration:** 300ms
- **Easing:** ease-out
- **Hover Effects:** Scale, translate, shadow changes

## Responsive Breakpoints

```typescript
sm: 640px   // Mobile landscape
md: 768px   // Tablet
lg: 1024px  // Desktop small
xl: 1280px  // Desktop
2xl: 1440px // Desktop large
```

## Accessibility Features

### WCAG 2.1 Level AA Compliance

- ✅ Color contrast ratios: 4.5:1 minimum
- ✅ Keyboard navigation support
- ✅ Focus indicators on all interactive elements
- ✅ Semantic HTML (h1-h6 hierarchy)
- ✅ Alt text for all images
- ✅ ARIA labels for icon buttons
- ✅ Form labels properly associated
- ✅ Touch targets: 44x44px minimum

### Testing

Run accessibility tests using:
- Chrome Lighthouse
- axe DevTools browser extension
- Manual keyboard navigation testing

## Performance Optimization

### Targets (from PRD)

- **First Contentful Paint (FCP):** < 1.5s
- **Largest Contentful Paint (LCP):** < 2.5s
- **Cumulative Layout Shift (CLS):** < 0.1
- **First Input Delay (FID):** < 100ms
- **Total Page Size:** < 2MB

### Optimizations Implemented

1. **Images:**
   - Next.js Image component with automatic optimization
   - WebP format support
   - Lazy loading for below-fold images
   - Proper width/height to prevent layout shift

2. **Code Splitting:**
   - Automatic code splitting with Next.js App Router
   - Dynamic imports for heavy components

3. **Fonts:**
   - Google Fonts with `font-display: swap`
   - Preload critical fonts

4. **CSS:**
   - Tailwind CSS with purge enabled
   - Critical CSS inlined automatically by Next.js

## SEO Implementation

### Meta Tags

- Title, description, keywords
- Open Graph tags for social sharing
- Twitter Card metadata
- Canonical URLs

### Structured Data (JSON-LD)

- Organization schema
- Website schema with SearchAction
- Breadcrumb schema (ready for implementation)

### Files

- `robots.txt` in public folder
- `manifest.json` for PWA support
- Sitemap (to be generated)

## API Integration

### Current State

Mock data is used for development. Files:
- `lib/mockData.ts` - Sample properties, testimonials, blog posts
- `lib/api.ts` - API function stubs

### Next Steps

Replace mock data with actual API calls:

```typescript
// Example: lib/api.ts
export const getFeaturedProperties = async () => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/properties/featured`);
  return response.json();
};
```

Update these endpoints:
- `/api/properties/featured` - Featured properties
- `/api/testimonials` - Customer testimonials
- `/api/blog/featured` - Featured blog posts
- `/api/newsletter/subscribe` - Newsletter signup
- `/api/contact` - Contact form submissions

## Environment Variables

Required for production:

```bash
NEXT_PUBLIC_APP_URL=https://cohousingventures.com
NEXT_PUBLIC_API_URL=https://api.cohousingventures.com
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
DATABASE_URL=postgresql://...
```

See `.env.example` for full list.

## Deployment

### Build for Production

```bash
npm run build
npm start
```

### Deployment Checklist

- [ ] Update environment variables
- [ ] Configure domain and SSL
- [ ] Set up analytics (Google Analytics, Hotjar)
- [ ] Test all forms and CTAs
- [ ] Run Lighthouse audit
- [ ] Test on real devices
- [ ] Set up error monitoring (Sentry)
- [ ] Configure CDN for static assets
- [ ] Set up database connection
- [ ] Test API integrations

### Recommended Hosting

- **Vercel** (optimized for Next.js)
- **Netlify**
- **AWS Amplify**
- **Custom Node.js server**

## Testing

### Manual Testing Checklist

- [ ] All sections render correctly
- [ ] Navigation links work
- [ ] CTA buttons trigger correct actions
- [ ] Forms validate properly
- [ ] Mobile menu opens/closes
- [ ] Images load with lazy loading
- [ ] Animations trigger on scroll
- [ ] Responsive design works on all breakpoints
- [ ] Keyboard navigation works
- [ ] Screen reader compatibility

### Browser Testing

Test on:
- ✅ Chrome (latest 2 versions)
- ✅ Safari (latest 2 versions)
- ✅ Firefox (latest 2 versions)
- ✅ Edge (latest 2 versions)
- ✅ Mobile Safari (iOS)
- ✅ Chrome Mobile (Android)

## Future Enhancements

### Phase 2 Features

1. **User Authentication:**
   - Login/signup modals
   - User dashboard
   - Saved properties functionality

2. **Advanced Search:**
   - More filters modal
   - Search history
   - Saved searches

3. **Property Detail Pages:**
   - Individual property pages
   - Image galleries
   - Virtual tours

4. **Blog System:**
   - Full blog with categories
   - Comments
   - Related posts

5. **Content Management:**
   - Admin panel for content updates
   - CMS integration (Sanity/Contentful)

6. **Analytics Dashboard:**
   - User behavior tracking
   - Conversion funnel analysis
   - A/B testing

## Troubleshooting

### Common Issues

**Issue: Styles not applying**
- Solution: Restart dev server, check Tailwind config

**Issue: Images not loading**
- Solution: Check Next.js config domains, verify image URLs

**Issue: Build errors**
- Solution: Run `npm run type-check` to find TypeScript errors

**Issue: Animations not working**
- Solution: Check Framer Motion installation, verify viewport detection

## Support

For questions or issues:
- Email: dev@cohousingventures.com
- Documentation: Check this file
- PRD Reference: See original PRD document

## Contributing

### Code Style

- Use TypeScript for all new files
- Follow existing component patterns
- Use Tailwind utility classes
- Add comments for complex logic
- Write meaningful commit messages

### Component Structure

```typescript
// Standard component template
import React from 'react';
import { ComponentProps } from './types';

export const ComponentName: React.FC<ComponentProps> = ({ prop1, prop2 }) => {
  return (
    <div className="...">
      {/* Component content */}
    </div>
  );
};
```

## License

Private - All rights reserved © 2026 Co Housing Ventures
