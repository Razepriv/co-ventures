# Co Housing Ventures Website

A modern, fully-responsive website for Co Housing Ventures - making premium real estate accessible through collaborative co-ownership.

## 🎯 Overview

Complete implementation of the Co Housing Ventures home page with 13 comprehensive sections:
- ✨ Hero with dual CTAs and trust indicators
- 🔍 Advanced search bar with filters
- 💡 Why Co-Housing benefits section
- 🏘️ Featured properties showcase
- 📋 How It Works timeline
- 🛠️ Services overview
- ⭐ Success stories
- 📊 Statistics with animated counters
- 💬 Testimonials carousel
- 📰 Blog insights
- 📞 CTA section
- 🔗 Comprehensive footer

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- npm, yarn, or pnpm

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   ```

3. **Run development server:**
   ```bash
   npm run dev
   ```

4. **Open in browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
npm start
```

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router) with TypeScript
- **Styling:** Tailwind CSS with custom design tokens
- **Animations:** Framer Motion for scroll animations
- **Carousel:** Swiper for testimonials
- **Icons:** Lucide React
- **Image Optimization:** Next.js Image component

## 📁 Project Structure

```
co-housing-ventures/
├── app/
│   ├── layout.tsx              # Root layout with SEO
│   ├── page.tsx                # Home page composition
│   └── globals.css             # Global styles
├── components/
│   ├── ui/                     # Reusable components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── Section.tsx
│   │   └── Badge.tsx
│   ├── home/                   # Home page sections
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
│   ├── Header.tsx              # Sticky navigation
│   └── Footer.tsx              # Footer with newsletter
├── lib/
│   ├── utils.ts                # Utility functions
│   ├── mockData.ts             # Development data
│   ├── api.ts                  # API integration points
│   └── seo.ts                  # SEO schemas
├── types/
│   └── index.ts                # TypeScript definitions
└── public/
    ├── robots.txt
    ├── manifest.json
    └── logo.svg
```

## ✨ Key Features

### Design System
- **Colors:** Coral (#FF6B4A), Charcoal (#2D2D2D), Light Peach (#FFF5F2)
- **Typography:** Inter font family with responsive sizing
- **Spacing:** Consistent padding and margins across breakpoints
- **Shadows:** Soft, medium, strong, and hover variants

### Responsive Design
- Mobile-first approach
- Breakpoints: 640px, 768px, 1024px, 1280px, 1440px
- Grid layouts that adapt to screen size
- Touch-optimized for mobile devices

### Accessibility (WCAG 2.1 AA)
- Semantic HTML structure
- Keyboard navigation support
- ARIA labels and roles
- Color contrast ratios 4.5:1+
- Focus indicators
- Screen reader compatible

### Performance Optimization
- Next.js Image optimization with WebP
- Lazy loading for below-fold images
- Code splitting and tree shaking
- Minimal bundle size
- Fast page loads (<3s LCP target)

### SEO
- Comprehensive meta tags
- Open Graph and Twitter Card support
- JSON-LD structured data
- robots.txt and sitemap ready
- Semantic HTML markup

## 📊 Performance Targets

| Metric | Target | Critical |
|--------|--------|----------|
| First Contentful Paint | < 1.5s | < 2.5s |
| Largest Contentful Paint | < 2.5s | < 4.0s |
| Cumulative Layout Shift | < 0.1 | < 0.25 |
| First Input Delay | < 100ms | < 300ms |

## 🌐 Browser Support

- ✅ Chrome (latest 2 versions)
- ✅ Safari (latest 2 versions)
- ✅ Firefox (latest 2 versions)
- ✅ Edge (latest 2 versions)
- ✅ Mobile Safari (iOS)
- ✅ Chrome Mobile (Android)

## 📚 Documentation

For detailed documentation, see [DEVELOPMENT.md](./DEVELOPMENT.md) which includes:
- Complete component documentation
- API integration guide
- Deployment checklist
- Testing procedures
- Troubleshooting guide

## 🔄 Development Status

**Current Phase:** ✅ Home Page Complete (MVP Ready)

**Completed:**
- ✅ Project setup and configuration
- ✅ Design system and UI components
- ✅ All 13 home page sections
- ✅ Header with sticky navigation
- ✅ Footer with newsletter signup
- ✅ Mock data for development
- ✅ SEO metadata and structured data
- ✅ Responsive design implementation
- ✅ Accessibility features
- ✅ Performance optimizations

**Next Steps:**
1. Connect to backend API
2. Implement user authentication
3. Create property detail pages
4. Build blog system
5. Add admin panel for content management

## 🧪 Testing

### Run Type Check
```bash
npm run type-check
```

### Run Linter
```bash
npm run lint
```

### Manual Testing
- Test all interactive elements
- Verify responsive design on multiple devices
- Check keyboard navigation
- Validate forms
- Test all CTAs and links

## 🚢 Deployment

### Recommended Platforms
- **Vercel** (Optimized for Next.js) - Recommended
- Netlify
- AWS Amplify
- Custom Node.js server

### Deployment Checklist
- [ ] Update environment variables
- [ ] Configure custom domain
- [ ] Set up analytics tracking
- [ ] Test all API integrations
- [ ] Run Lighthouse audit
- [ ] Enable error monitoring
- [ ] Configure CDN

## 📝 Environment Variables

See `.env.example` for required variables. Key variables:

```bash
NEXT_PUBLIC_APP_URL=https://cohousingventures.com
NEXT_PUBLIC_API_URL=https://api.cohousingventures.com
NEXT_PUBLIC_GA_ID=your-ga-id
```

## 🤝 Contributing

This is a private project. For internal development:
1. Follow existing code patterns
2. Use TypeScript for all new files
3. Maintain responsive design
4. Test accessibility features
5. Write meaningful commit messages

## 📄 License

Private - All rights reserved © 2026 Co Housing Ventures

## 📞 Support

For questions or issues:
- 📧 Email: dev@cohousingventures.com
- 📖 Documentation: See DEVELOPMENT.md
- 📋 PRD: Refer to original requirements document
