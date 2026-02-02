# Product Requirements Document (PRD)
## Co-Ventures Real Estate Investment Platform

**Version:** 2.0  
**Last Updated:** February 2, 2026  
**Status:** MVP Complete - Phase 2 In Development  
**Document Owner:** Co-Ventures Product Team

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Product Vision & Goals](#2-product-vision--goals)
3. [Target Audience](#3-target-audience)
4. [Product Overview](#4-product-overview)
5. [Functional Requirements](#5-functional-requirements)
6. [Technical Architecture](#6-technical-architecture)
7. [User Experience & Design](#7-user-experience--design)
8. [AI-Powered Features](#8-ai-powered-features)
9. [Subscription & Monetization](#9-subscription--monetization)
10. [Admin Panel](#10-admin-panel)
11. [Non-Functional Requirements](#11-non-functional-requirements)
12. [Data Models](#12-data-models)
13. [API Specifications](#13-api-specifications)
14. [Security & Compliance](#14-security--compliance)
15. [Success Metrics](#15-success-metrics)
16. [Roadmap](#16-roadmap)
17. [Appendix](#17-appendix)

---

## 1. Executive Summary

### 1.1 Product Overview

Co-Ventures is a premium real estate investment platform that connects investors with curated co-ownership opportunities in India's high-growth corridors. The platform combines institutional-grade property analysis with AI-powered investment insights, making premium real estate accessible through collaborative co-ownership models.

### 1.2 Business Objectives

| Objective | Target | Timeline |
|-----------|--------|----------|
| Drive qualified investor inquiries | 500+ monthly | Q1 2026 |
| Premium subscription adoption | 15% conversion rate | Q2 2026 |
| Property portfolio value | ₹500 Cr AUM | Q4 2026 |
| Customer satisfaction score | >4.5/5.0 | Ongoing |

### 1.3 Key Differentiators

- **AI Investment Committee**: 6 specialized AI agents providing comprehensive property analysis
- **Institutional-Grade Underwriting**: Disciplined risk assessment and transparent documentation
- **Co-Ownership Model**: Fractional ownership making premium properties accessible
- **Real-Time Market Intelligence**: Dynamic pricing and market trend analysis

---

## 2. Product Vision & Goals

### 2.1 Vision Statement

> "To democratize premium real estate investment by combining institutional discipline with cutting-edge AI technology, enabling investors of all sizes to participate in India's growth story."

### 2.2 Strategic Goals

1. **Trust & Credibility**: Establish Co-Ventures as the most trusted platform for real estate investment
2. **Accessibility**: Lower barriers to entry for premium property investment
3. **Intelligence**: Provide AI-powered insights that rival institutional research teams
4. **Transparency**: Offer complete visibility into investment performance and documentation

### 2.3 Brand Positioning

| Attribute | Description |
|-----------|-------------|
| Voice | Confident, calm, professional |
| Tone | Plain English, no jargon or hype |
| Promise | "Capital-first, discipline-first, clarity-first" |
| Messaging | India growth corridors, disciplined underwriting, transparent processes |

---

## 3. Target Audience

### 3.1 Primary Personas

#### Persona 1: The Domestic HNI Investor
- **Demographics**: Age 35-55, income >₹50L/year
- **Goals**: Portfolio diversification, passive income, capital appreciation
- **Pain Points**: Lack of time for due diligence, trust issues with developers
- **Behavior**: Research-oriented, values expert opinions, prefers digital interactions

#### Persona 2: The NRI/Global Indian Investor
- **Demographics**: Age 30-50, based in US/UK/UAE/Singapore
- **Goals**: India market exposure, INR appreciation hedge, family asset base
- **Pain Points**: Distance from market, legal complexity, property management
- **Behavior**: Expects institutional-grade documentation, values remote management

#### Persona 3: The First-Time Property Investor
- **Demographics**: Age 28-40, income ₹25-50L/year
- **Goals**: Enter real estate market, build wealth, learn investing
- **Pain Points**: High entry barriers, lack of expertise, fear of mistakes
- **Behavior**: Seeks guidance, values educational content, risk-averse

### 3.2 Secondary Personas

- Real estate professionals seeking investment opportunities
- Family offices exploring alternative investments
- Wealth managers recommending to clients

---

## 4. Product Overview

### 4.1 Platform Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CO-VENTURES PLATFORM                      │
├──────────────────────┬──────────────────────┬───────────────────┤
│   PUBLIC WEBSITE     │    USER DASHBOARD    │   ADMIN PANEL     │
├──────────────────────┼──────────────────────┼───────────────────┤
│ • Home Page          │ • Profile Management │ • Analytics       │
│ • Property Listings  │ • Saved Properties   │ • Properties      │
│ • Property Details   │ • AI Assistant       │ • Users           │
│ • Search & Filters   │ • Comparison Tool    │ • Enquiries       │
│ • Blog & Insights    │ • Subscription Mgmt  │ • Blog CMS        │
│ • Contact/Enquiry    │ • Investment History │ • AI Config       │
│ • About/Services     │ • Notifications      │ • Settings        │
└──────────────────────┴──────────────────────┴───────────────────┘
                                │
                    ┌───────────┴───────────┐
                    │    AI ENGINE LAYER     │
                    ├────────────────────────┤
                    │ • Market Pulse Agent   │
                    │ • Deal Underwriter     │
                    │ • Developer Verifier   │
                    │ • Legal Compliance     │
                    │ • Exit Optimizer       │
                    │ • Committee Synthesizer│
                    └────────────────────────┘
```

### 4.2 Core Modules

| Module | Description | Status |
|--------|-------------|--------|
| Home Page | 13-section landing page with CTAs | ✅ Complete |
| Property Management | Listings, details, search, filters | ✅ Complete |
| User Authentication | Firebase auth with phone/email | ✅ Complete |
| AI Assistant | 6-agent investment committee | ✅ Complete |
| Subscription System | 4-tier plan with payments | ✅ Complete |
| Admin Panel | Full CMS with analytics | ✅ Complete |
| Blog System | Content management | ✅ Complete |
| Notifications | Real-time alerts | ✅ Complete |

---

## 5. Functional Requirements

### 5.1 Home Page (Public)

#### 5.1.1 Hero Section
- **FR-001**: Display compelling headline with animated text
- **FR-002**: Show dual CTAs ("Explore Properties" / "Schedule a Call")
- **FR-003**: Display trust indicators (properties count, investors, satisfaction rate)
- **FR-004**: Implement responsive layout for all devices

#### 5.1.2 Search & Filter Bar
- **FR-005**: Location search with city autocomplete
- **FR-006**: Property type filter (Apartment, Villa, Plot, Commercial)
- **FR-007**: Price range slider with dynamic bounds
- **FR-008**: BHK filter (1, 2, 3, 4+)
- **FR-009**: Status filter (Ready, Under Construction, Upcoming)
- **FR-010**: Co-housing availability toggle

#### 5.1.3 Why Co-Housing Section
- **FR-011**: Display 4 benefit cards with icons
- **FR-012**: Animate cards on scroll into view
- **FR-013**: Link to detailed pages

#### 5.1.4 Featured Properties
- **FR-014**: Display top 3-6 featured properties
- **FR-015**: Property cards with image, price, location, BHK, area
- **FR-016**: Save/favorite functionality with heart icon
- **FR-017**: "View All" link to properties page

#### 5.1.5 AI Committee Section
- **FR-018**: Showcase 6 AI agents with descriptions
- **FR-019**: Visual representation of analysis process
- **FR-020**: CTA to try AI assistant

#### 5.1.6 How It Works Timeline
- **FR-021**: 4-step process visualization
- **FR-022**: Animated timeline on scroll
- **FR-023**: Step descriptions and icons

#### 5.1.7 Services Section
- **FR-024**: Display 5 core services
- **FR-025**: Service cards with icons and descriptions
- **FR-026**: Links to detailed service pages

#### 5.1.8 Testimonials
- **FR-027**: Carousel/marquee of customer testimonials
- **FR-028**: Display customer name, photo, rating, review
- **FR-029**: Auto-scroll with pause on hover

#### 5.1.9 Statistics Section
- **FR-030**: Animated counters (properties, investors, satisfaction, value)
- **FR-031**: Trigger animation on scroll into view
- **FR-032**: Format numbers appropriately (1000+ → 1K+)

#### 5.1.10 Blog Insights
- **FR-033**: Display 3 latest blog posts
- **FR-034**: Featured post with larger card
- **FR-035**: Category tags, read time, publish date

#### 5.1.11 CTA Section
- **FR-036**: Gradient background with compelling copy
- **FR-037**: Dual CTAs with different styles
- **FR-038**: Contact information display

#### 5.1.12 Footer
- **FR-039**: 4-column layout with navigation links
- **FR-040**: Newsletter signup form
- **FR-041**: Social media links
- **FR-042**: Legal links (Privacy, Terms)

### 5.2 Property Management

#### 5.2.1 Property Listing Page
- **FR-043**: Grid/list view toggle
- **FR-044**: Pagination (12 per page)
- **FR-045**: Sort by price, date, popularity
- **FR-046**: Save/favorite properties
- **FR-047**: Quick view modal

#### 5.2.2 Property Detail Page
- **FR-048**: Image gallery with zoom capability
- **FR-049**: Key metrics (price, BHK, area, status)
- **FR-050**: Location map integration
- **FR-051**: Developer information
- **FR-052**: Amenities list with icons
- **FR-053**: Floor plans display
- **FR-054**: Investment metrics (ROI, yield, appreciation)
- **FR-055**: Similar properties recommendation
- **FR-056**: Enquiry form with property context
- **FR-057**: Share functionality
- **FR-058**: AI Assistant integration (subscription-gated)

#### 5.2.3 Search Functionality
- **FR-059**: Real-time search suggestions
- **FR-060**: Filter persistence in URL
- **FR-061**: Saved searches for logged-in users
- **FR-062**: Search result count display

### 5.3 User Authentication & Profile

#### 5.3.1 Authentication
- **FR-063**: Email/password registration and login
- **FR-064**: Phone number authentication (OTP)
- **FR-065**: Google OAuth integration
- **FR-066**: Password reset flow
- **FR-067**: Session management with secure tokens

#### 5.3.2 User Profile
- **FR-068**: Profile picture upload
- **FR-069**: Personal information management
- **FR-070**: Saved properties list
- **FR-071**: Search history
- **FR-072**: Notification preferences
- **FR-073**: Subscription status display

### 5.4 Enquiry System

- **FR-074**: Multi-step enquiry form
- **FR-075**: Property-specific enquiry context
- **FR-076**: Investment amount selection
- **FR-077**: Preferred contact time
- **FR-078**: Enquiry status tracking
- **FR-079**: Email notifications for updates

### 5.5 Blog System

- **FR-080**: Blog post listing with categories
- **FR-081**: Individual post pages with rich content
- **FR-082**: Author attribution
- **FR-083**: Social sharing
- **FR-084**: Related posts recommendation
- **FR-085**: Comments system (optional)

### 5.6 Notifications

- **FR-086**: In-app notification center
- **FR-087**: Real-time notification updates
- **FR-088**: Email notification preferences
- **FR-089**: Notification categories (property updates, enquiry status, promotions)
- **FR-090**: Read/unread status management

---

## 6. Technical Architecture

### 6.1 Technology Stack

| Layer | Technology | Justification |
|-------|------------|---------------|
| Frontend | Next.js 14 (App Router) | SSR, performance, SEO |
| Language | TypeScript | Type safety, maintainability |
| Styling | Tailwind CSS | Utility-first, rapid development |
| Animations | Framer Motion | Smooth, declarative animations |
| State | React Query (TanStack) | Server state management |
| Forms | React Hook Form + Zod | Validation, type-safe forms |
| Database | Supabase (PostgreSQL) | Real-time, auth, storage |
| Auth | Firebase + Supabase | Phone auth, OAuth |
| Payments | Razorpay | Indian payment gateway |
| AI | Google Gemini API | Language model for analysis |
| Hosting | Vercel | Edge deployment, Next.js optimized |
| Analytics | Google Analytics 4 | User behavior tracking |

### 6.2 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ Next.js App │  │ PWA Support │  │ Service Worker      │  │
│  └──────┬──────┘  └──────┬──────┘  └──────────┬──────────┘  │
└─────────┼────────────────┼─────────────────────┼────────────┘
          │                │                     │
          ▼                ▼                     ▼
┌─────────────────────────────────────────────────────────────┐
│                      API LAYER                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ Next.js API │  │ Server      │  │ Middleware          │  │
│  │ Routes      │  │ Actions     │  │ (Auth, Rate Limit)  │  │
│  └──────┬──────┘  └──────┬──────┘  └──────────┬──────────┘  │
└─────────┼────────────────┼─────────────────────┼────────────┘
          │                │                     │
          ▼                ▼                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    SERVICE LAYER                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────────┐  │
│  │ Property │  │ User     │  │ AI       │  │ Subscription│  │
│  │ Service  │  │ Service  │  │ Service  │  │ Service     │  │
│  └─────┬────┘  └────┬─────┘  └────┬─────┘  └──────┬──────┘  │
└────────┼────────────┼─────────────┼───────────────┼─────────┘
         │            │             │               │
         ▼            ▼             ▼               ▼
┌─────────────────────────────────────────────────────────────┐
│                    DATA LAYER                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │   Supabase   │  │   Firebase   │  │   Google Gemini  │   │
│  │  (Database)  │  │    (Auth)    │  │      (AI)        │   │
│  └──────────────┘  └──────────────┘  └──────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 6.3 Database Schema (Key Tables)

```sql
-- Core Tables
users                    -- User profiles and preferences
properties               -- Property listings
property_images          -- Property image gallery
property_amenities       -- Property amenities mapping
developers               -- Developer information
cities                   -- City master data

-- Engagement Tables
enquiries               -- User enquiries
leads                   -- Lead management
contacts                -- Contact form submissions
newsletter_subscribers  -- Newsletter signups

-- Content Tables
blog_posts              -- Blog content
testimonials            -- Customer testimonials
media_library           -- Uploaded media files

-- AI & Subscription Tables
subscription_plans      -- Available plans
user_subscriptions     -- User subscription status
ai_agent_configurations -- AI agent settings
ai_property_analyses   -- Saved AI analyses
ai_api_keys            -- API key management

-- System Tables
notifications          -- User notifications
form_submissions       -- Generic form data
audit_logs             -- System audit trail
```

### 6.4 API Structure

```
/api/
├── auth/
│   ├── login/
│   ├── register/
│   └── verify/
├── properties/
│   ├── [id]/
│   ├── search/
│   └── featured/
├── ai/
│   ├── chat/
│   └── analyze-property/
├── subscriptions/
│   ├── plans/
│   └── [userId]/
├── razorpay/
│   ├── create-subscription/
│   └── webhook/
├── enquiries/
├── leads/
├── contact/
├── newsletter/
├── notifications/
└── admin/
    ├── properties/
    ├── users/
    ├── analytics/
    └── settings/
```

---

## 7. User Experience & Design

### 7.1 Design System

#### 7.1.1 Color Palette

| Color | Hex | Usage |
|-------|-----|-------|
| Coral | #FF6B4A | Primary brand, CTAs, accents |
| Charcoal | #2D2D2D | Text, dark backgrounds |
| Light Peach | #FFF5F2 | Section backgrounds |
| White | #FFFFFF | Clean backgrounds, cards |
| Gray-50 | #F9FAFB | Subtle backgrounds |
| Gray-900 | #111827 | Body text |

#### 7.1.2 Typography

```css
Font Family: Inter (Google Fonts)

Headings:
- H1: 48-56px, Bold (700), line-height 1.2
- H2: 36-40px, Bold (700), line-height 1.3
- H3: 28-32px, Semi-bold (600), line-height 1.4
- H4: 24px, Semi-bold (600), line-height 1.4

Body:
- Large: 18px, Regular (400), line-height 1.6
- Regular: 16px, Regular (400), line-height 1.6
- Small: 14px, Regular (400), line-height 1.5
- Micro: 12px, Regular (400), line-height 1.4
```

#### 7.1.3 Spacing System

```css
Base: 4px

Scale:
- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px
- 2xl: 48px
- 3xl: 64px
- 4xl: 96px
```

#### 7.1.4 Shadows

```css
shadow-sm:    0 1px 2px rgba(0, 0, 0, 0.05)
shadow:       0 1px 3px rgba(0, 0, 0, 0.1)
shadow-md:    0 4px 6px rgba(0, 0, 0, 0.1)
shadow-lg:    0 10px 15px rgba(0, 0, 0, 0.1)
shadow-xl:    0 20px 25px rgba(0, 0, 0, 0.1)
shadow-hover: 0 20px 40px rgba(0, 0, 0, 0.15)
```

### 7.2 Component Library

| Component | Variants | Description |
|-----------|----------|-------------|
| Button | primary, secondary, outline, ghost | Action triggers |
| Input | text, email, phone, password, textarea | Form inputs |
| Card | default, hover, selected | Content containers |
| Badge | default, success, warning, error | Status indicators |
| Modal | default, fullscreen, drawer | Overlay content |
| Dropdown | select, multi-select, autocomplete | Selection inputs |
| Tabs | horizontal, vertical | Content organization |
| Table | sortable, filterable, paginated | Data display |
| Toast | success, error, warning, info | Notifications |

### 7.3 Responsive Breakpoints

| Breakpoint | Min Width | Target Devices |
|------------|-----------|----------------|
| sm | 640px | Large phones |
| md | 768px | Tablets |
| lg | 1024px | Laptops |
| xl | 1280px | Desktops |
| 2xl | 1440px | Large screens |

### 7.4 Animation Guidelines

- **Entrance**: Fade up with 0.3s duration, ease-out
- **Exit**: Fade down with 0.2s duration, ease-in
- **Hover**: Scale 1.02-1.05 with 0.2s duration
- **Loading**: Skeleton shimmer or spinner
- **Scroll**: Trigger at 20% viewport visibility

---

## 8. AI-Powered Features

### 8.1 AI Investment Committee

The platform features 6 specialized AI agents that simulate an institutional investment committee:

#### 8.1.1 Market Pulse Agent
- **Tier**: Basic
- **Function**: Analyze market trends, demand-supply dynamics, price trajectories
- **Input**: Property location, type, market data
- **Output**: Market health score (0-100), trend analysis, risk factors

#### 8.1.2 Deal Underwriter Agent
- **Tier**: Basic
- **Function**: Financial viability assessment, ROI calculation, IRR projections
- **Input**: Property price, expected rental, appreciation estimates
- **Output**: IRR score, cash flow analysis, investment recommendation

#### 8.1.3 Developer Verification Agent
- **Tier**: Pro
- **Function**: Developer track record, credibility assessment
- **Input**: Developer name, past projects, delivery history
- **Output**: Credibility score, red flags, recommendation

#### 8.1.4 Legal & Regulatory Agent
- **Tier**: Pro
- **Function**: RERA compliance, approvals verification, documentation review
- **Input**: Property registration details, approvals list
- **Output**: Compliance score, pending approvals, legal risks

#### 8.1.5 Exit Optimizer Agent
- **Tier**: Pro
- **Function**: Liquidity assessment, exit strategy planning
- **Input**: Property type, location, market conditions
- **Output**: Liquidity score, exit timeline, recommended strategies

#### 8.1.6 Committee Synthesizer Agent
- **Tier**: Pro
- **Function**: Aggregate all agent reports into final recommendation
- **Input**: All agent outputs
- **Output**: Overall score (0-100), final recommendation, key considerations

### 8.2 AI Chat Interface

- **FR-091**: Context-aware chat with property knowledge
- **FR-092**: Message history persistence
- **FR-093**: Suggested questions for guidance
- **FR-094**: Typewriter effect for responses
- **FR-095**: Markdown rendering for formatted responses

### 8.3 Property Comparison Tool

- **FR-096**: Add up to 5 properties for comparison
- **FR-097**: Side-by-side metrics comparison
- **FR-098**: Radar charts for visual comparison
- **FR-099**: AI-generated insights comparing properties
- **FR-100**: Export comparison as PDF/Excel

### 8.4 AI Configuration (Admin)

- **FR-101**: Edit system prompts for each agent
- **FR-102**: Adjust model parameters (temperature, max tokens)
- **FR-103**: Enable/disable agents
- **FR-104**: Version history with rollback
- **FR-105**: Test agents with sample properties

---

## 9. Subscription & Monetization

### 9.1 Subscription Tiers

| Plan | Price (Monthly) | Price (Yearly) | Target User |
|------|-----------------|----------------|-------------|
| Free | ₹0 | ₹0 | Casual browsers |
| AI Basic | ₹999 | ₹9,990 | Active investors |
| AI Pro | ₹2,499 | ₹24,990 | Serious investors |
| AI Enterprise | ₹9,999 | ₹99,990 | Institutions/HNIs |

### 9.2 Feature Matrix

| Feature | Free | Basic | Pro | Enterprise |
|---------|------|-------|-----|------------|
| Property browsing | ✅ | ✅ | ✅ | ✅ |
| Property search | ✅ | ✅ | ✅ | ✅ |
| Save properties | 5 | 20 | 100 | Unlimited |
| AI analyses/month | 0 | 10 | 50 | Unlimited |
| Market Pulse Agent | ❌ | ✅ | ✅ | ✅ |
| Deal Underwriter | ❌ | ✅ | ✅ | ✅ |
| Developer Verification | ❌ | ❌ | ✅ | ✅ |
| Legal & Regulatory | ❌ | ❌ | ✅ | ✅ |
| Exit Optimizer | ❌ | ❌ | ✅ | ✅ |
| Committee Synthesizer | ❌ | ❌ | ✅ | ✅ |
| Property comparison | 2 | 3 | 5 | 10 |
| Export reports | ❌ | PDF | PDF/Excel | All formats |
| Priority support | ❌ | ❌ | ✅ | ✅ |
| Dedicated manager | ❌ | ❌ | ❌ | ✅ |

### 9.3 Payment Integration

- **Gateway**: Razorpay
- **Supported Methods**: UPI, Cards, Net Banking, Wallets
- **Subscription Management**: Auto-renewal, cancel anytime
- **Webhooks**: Payment success, failure, subscription updates

### 9.4 Revenue Model

```
Revenue Streams:
1. Subscription fees (recurring)
2. Featured listing fees (from developers)
3. Lead generation fees
4. Enterprise consulting fees
```

---

## 10. Admin Panel

### 10.1 Dashboard & Analytics

- **FR-106**: Real-time metrics dashboard
- **FR-107**: Property distribution charts
- **FR-108**: Revenue trend visualization
- **FR-109**: User acquisition metrics
- **FR-110**: Enquiry conversion rates
- **FR-111**: Date range filtering
- **FR-112**: Export analytics data

### 10.2 Property Management

- **FR-113**: CRUD operations for properties
- **FR-114**: Bulk actions (delete, feature, unfeature)
- **FR-115**: Image upload with drag-and-drop
- **FR-116**: Property status management
- **FR-117**: SEO metadata editing
- **FR-118**: Duplicate property detection

### 10.3 User Management

- **FR-119**: User listing with search/filter
- **FR-120**: User role management (admin, user)
- **FR-121**: Subscription status view
- **FR-122**: User activity logs
- **FR-123**: Account suspension capability

### 10.4 Content Management

- **FR-124**: Blog post editor (rich text)
- **FR-125**: Testimonial management
- **FR-126**: Media library with organization
- **FR-127**: Newsletter management
- **FR-128**: FAQ management

### 10.5 CRM Features

- **FR-129**: Enquiry management with status
- **FR-130**: Lead scoring and assignment
- **FR-131**: Contact history tracking
- **FR-132**: Email template management
- **FR-133**: Follow-up reminders

### 10.6 AI Configuration

- **FR-134**: Agent prompt management
- **FR-135**: Model parameter tuning
- **FR-136**: API key management
- **FR-137**: Usage monitoring
- **FR-138**: Cost tracking

### 10.7 Settings

- **FR-139**: Site configuration
- **FR-140**: SEO settings
- **FR-141**: Email notification settings
- **FR-142**: Integration settings
- **FR-143**: Backup and restore

---

## 11. Non-Functional Requirements

### 11.1 Performance

| Metric | Target | Critical Threshold |
|--------|--------|-------------------|
| First Contentful Paint | < 1.5s | < 2.5s |
| Largest Contentful Paint | < 2.5s | < 4.0s |
| Cumulative Layout Shift | < 0.1 | < 0.25 |
| First Input Delay | < 100ms | < 300ms |
| Time to Interactive | < 3.5s | < 5.0s |
| API Response Time (p95) | < 500ms | < 1000ms |

### 11.2 Scalability

- Handle 10,000+ concurrent users
- Support 50,000+ property listings
- Process 1,000+ enquiries/day
- Scale horizontally with demand

### 11.3 Availability

- 99.9% uptime SLA
- Automated failover
- Global CDN distribution
- Real-time monitoring and alerts

### 11.4 Security

- HTTPS everywhere
- Data encryption at rest and in transit
- OWASP Top 10 compliance
- Regular security audits
- GDPR/data privacy compliance

### 11.5 Accessibility (WCAG 2.1 AA)

- Color contrast ratio ≥ 4.5:1
- Keyboard navigation support
- Screen reader compatibility
- Focus indicators
- Alt text for images
- Semantic HTML structure

### 11.6 Browser Support

| Browser | Versions | Priority |
|---------|----------|----------|
| Chrome | Latest 2 | High |
| Safari | Latest 2 | High |
| Firefox | Latest 2 | Medium |
| Edge | Latest 2 | Medium |
| Mobile Safari | iOS 14+ | High |
| Chrome Mobile | Android 10+ | High |

### 11.7 Internationalization

- Primary language: English
- Currency display: INR (primary), USD, EUR (selectable)
- Date format: DD MMM YYYY
- Number format: Indian (lakhs, crores)

---

## 12. Data Models

### 12.1 Property Model

```typescript
interface Property {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  location: {
    address: string;
    area: string;
    city: string;
    state: string;
    pincode: string;
    coordinates: { lat: number; lng: number };
  };
  specifications: {
    bhk: number;
    area: number; // sqft
    carpetArea: number;
    floors: number;
    facing: string;
    age: number;
  };
  type: 'apartment' | 'villa' | 'plot' | 'commercial';
  status: 'ready' | 'under-construction' | 'upcoming';
  developer: Developer;
  images: string[];
  amenities: string[];
  investment: {
    expectedROI: number;
    rentalYield: number;
    appreciationRate: number;
    minInvestment: number;
  };
  coHousingAvailable: boolean;
  featured: boolean;
  publishedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### 12.2 User Model

```typescript
interface User {
  id: string;
  email: string;
  phone?: string;
  fullName: string;
  avatar?: string;
  role: 'user' | 'admin' | 'super_admin';
  subscription?: {
    planId: string;
    status: 'active' | 'cancelled' | 'past_due';
    currentPeriodEnd: Date;
  };
  preferences: {
    notifications: boolean;
    newsletter: boolean;
    currency: 'INR' | 'USD' | 'EUR';
  };
  savedProperties: string[];
  createdAt: Date;
  lastLoginAt: Date;
}
```

### 12.3 Subscription Model

```typescript
interface SubscriptionPlan {
  id: string;
  name: string;
  slug: string;
  description: string;
  priceMonthly: number;
  priceYearly: number;
  analysesPerMonth: number; // 0 = unlimited
  maxPropertiesComparison: number;
  agentsAccess: string[]; // ['all'] or specific agent IDs
  features: string[];
  isActive: boolean;
}
```

### 12.4 AI Analysis Model

```typescript
interface AIPropertyAnalysis {
  id: string;
  userId: string;
  propertyId: string;
  analyses: {
    agentId: string;
    agentName: string;
    score: number;
    analysis: string;
    recommendations: string[];
    riskFactors: string[];
  }[];
  overallScore: number;
  recommendation: 'strong_buy' | 'buy' | 'hold' | 'avoid';
  createdAt: Date;
}
```

---

## 13. API Specifications

### 13.1 Authentication APIs

```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/verify-otp
POST /api/auth/reset-password
GET  /api/auth/me
```

### 13.2 Property APIs

```
GET    /api/properties                 # List properties
GET    /api/properties/featured        # Featured properties
GET    /api/properties/search          # Search with filters
GET    /api/properties/[id]            # Property details
POST   /api/properties                 # Create (admin)
PUT    /api/properties/[id]            # Update (admin)
DELETE /api/properties/[id]            # Delete (admin)
```

### 13.3 AI APIs

```
POST /api/ai/chat                      # Chat with AI
POST /api/ai/analyze-property          # Full property analysis
GET  /api/ai/analyses/[propertyId]     # Get saved analysis
```

### 13.4 Subscription APIs

```
GET  /api/subscriptions/plans          # List plans
GET  /api/subscriptions                # Current subscription
POST /api/razorpay/create-subscription # Create subscription
POST /api/razorpay/webhook             # Payment webhook
```

### 13.5 User APIs

```
GET    /api/profile                    # Get profile
PUT    /api/profile                    # Update profile
GET    /api/profile/saved-properties   # Saved properties
POST   /api/profile/save-property      # Save property
DELETE /api/profile/save-property/[id] # Remove saved
```

---

## 14. Security & Compliance

### 14.1 Authentication Security

- JWT-based session management
- Secure, HTTP-only cookies
- CSRF protection
- Rate limiting (100 requests/minute)
- Account lockout after 5 failed attempts

### 14.2 Data Security

- AES-256 encryption for sensitive data
- TLS 1.3 for data in transit
- Database encryption at rest
- Regular automated backups
- PII data masking in logs

### 14.3 Compliance

| Regulation | Status | Notes |
|------------|--------|-------|
| GDPR | Compliant | Cookie consent, data export |
| IT Act 2000 | Compliant | Indian data protection |
| RERA | Reference | Property verification |

### 14.4 Security Measures

- Input validation and sanitization
- SQL injection prevention (parameterized queries)
- XSS protection (React default escaping)
- CORS configuration
- Content Security Policy headers
- Regular dependency updates

---

## 15. Success Metrics

### 15.1 Business Metrics

| Metric | Current | Target Q1 | Target Q2 |
|--------|---------|-----------|-----------|
| Monthly Active Users | - | 5,000 | 15,000 |
| Conversion Rate (visitor → signup) | - | 5% | 8% |
| Subscription Conversion | - | 10% | 15% |
| MRR | - | ₹5L | ₹15L |
| Enquiries/Month | - | 500 | 1,500 |

### 15.2 Product Metrics

| Metric | Target |
|--------|--------|
| Avg. Session Duration | > 5 minutes |
| Pages per Session | > 4 |
| Bounce Rate | < 40% |
| Property Save Rate | > 15% |
| AI Feature Engagement | > 30% of premium users |

### 15.3 Technical Metrics

| Metric | Target |
|--------|--------|
| Page Load Time (p95) | < 3s |
| API Response Time (p95) | < 500ms |
| Error Rate | < 0.1% |
| Uptime | > 99.9% |

---

## 16. Roadmap

### 16.1 Phase 1: MVP (✅ Complete)
**Timeline**: Q4 2025

- [x] Home page with all 13 sections
- [x] Property listings and detail pages
- [x] User authentication (email, phone, OAuth)
- [x] Basic search and filters
- [x] Enquiry system
- [x] Admin panel (properties, users, content)
- [x] Blog system
- [x] Newsletter integration

### 16.2 Phase 2: AI & Monetization (✅ Complete)
**Timeline**: Q1 2026

- [x] AI Investment Committee (6 agents)
- [x] Subscription tiers (4 plans)
- [x] Razorpay payment integration
- [x] Property comparison tool
- [x] Admin AI configuration
- [x] Analytics dashboard
- [x] Email notifications

### 16.3 Phase 3: Growth Features (🔄 In Progress)
**Timeline**: Q2 2026

- [ ] Mobile app (React Native)
- [ ] Advanced portfolio tracking
- [ ] Investment calculator
- [ ] Document management
- [ ] Virtual property tours (360°)
- [ ] Real-time chat support

### 16.4 Phase 4: Scale & Expansion (📋 Planned)
**Timeline**: Q3-Q4 2026

- [ ] Multi-language support
- [ ] White-label solution for partners
- [ ] Advanced AI models (GPT-4, Claude)
- [ ] Blockchain-based ownership records
- [ ] Secondary market for co-ownership shares
- [ ] Institutional investor portal

---

## 17. Appendix

### 17.1 Glossary

| Term | Definition |
|------|------------|
| Co-Housing | Shared ownership model for property investment |
| BHK | Bedroom, Hall, Kitchen configuration |
| ROI | Return on Investment |
| IRR | Internal Rate of Return |
| HNI | High Net Worth Individual |
| NRI | Non-Resident Indian |
| RERA | Real Estate Regulatory Authority |
| AUM | Assets Under Management |

### 17.2 Dependencies

| Dependency | Version | Purpose |
|------------|---------|---------|
| next | ^14.1.0 | React framework |
| react | ^18.2.0 | UI library |
| typescript | ^5.3.3 | Type safety |
| tailwindcss | ^3.4.1 | Styling |
| framer-motion | ^11.0.3 | Animations |
| @supabase/supabase-js | ^2.90.0 | Database |
| firebase | ^12.8.0 | Auth |
| @google/generative-ai | ^0.24.1 | AI |
| razorpay | ^2.9.6 | Payments |
| react-hook-form | ^7.70.0 | Forms |
| zod | ^4.3.5 | Validation |
| recharts | ^3.6.0 | Charts |
| swiper | ^11.0.5 | Carousels |

### 17.3 Environment Variables

```bash
# Application
NEXT_PUBLIC_APP_URL=https://coventures.com
NEXT_PUBLIC_API_URL=https://api.coventures.com

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key

# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id

# AI
GEMINI_API_KEY=your_gemini_key

# Payments
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# Analytics
NEXT_PUBLIC_GA_ID=your_ga_id
```

### 17.4 Contact

**Product Team**: product@coventures.com  
**Technical Support**: dev@coventures.com  
**Business Inquiries**: contact@coventures.com

---

*This document is a living specification and will be updated as the product evolves.*

**Document History**
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Jan 7, 2026 | Product Team | Initial release |
| 2.0 | Feb 2, 2026 | Product Team | Added AI, subscriptions, admin features |
