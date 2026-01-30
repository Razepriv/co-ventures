/**
 * Application-wide constants and configuration
 */

export const APP_CONFIG = {
  name: process.env.NEXT_PUBLIC_APP_NAME || 'Co Housing Ventures',
  url: process.env.NEXT_PUBLIC_APP_URL || 'https://www.coventure.in',
  description:
    'Discover your dream co-living space with Co Housing Ventures. Browse premium co-housing properties, shared living spaces, and affordable housing solutions across India.',
  keywords: [
    'co-housing',
    'co-living',
    'shared housing',
    'affordable housing',
    'real estate',
    'property rental',
    'India',
  ],
} as const

export const SUPABASE_CONFIG = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
} as const

export const STORAGE_BUCKETS = {
  properties: process.env.NEXT_PUBLIC_STORAGE_BUCKET_PROPERTIES || 'properties',
  avatars: process.env.NEXT_PUBLIC_STORAGE_BUCKET_AVATARS || 'avatars',
  blog: process.env.NEXT_PUBLIC_STORAGE_BUCKET_BLOG || 'blog-images',
} as const

export const FEATURE_FLAGS = {
  blog: process.env.NEXT_PUBLIC_ENABLE_BLOG === 'true',
  cohousing: process.env.NEXT_PUBLIC_ENABLE_COHOUSING === 'true',
  payment: process.env.NEXT_PUBLIC_ENABLE_PAYMENT === 'true',
  socialLogin: process.env.NEXT_PUBLIC_ENABLE_SOCIAL_LOGIN === 'true',
  maintenanceMode: process.env.NEXT_PUBLIC_MAINTENANCE_MODE === 'true',
  debug: process.env.NEXT_PUBLIC_ENABLE_DEBUG === 'true',
  mockApi: process.env.NEXT_PUBLIC_MOCK_API === 'true',
} as const

export const API_CONFIG = {
  rateLimit: {
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000'),
  },
  secretKey: process.env.API_SECRET_KEY || '',
} as const

export const ANALYTICS_CONFIG = {
  googleAnalytics: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '',
  hotjar: {
    id: process.env.NEXT_PUBLIC_HOTJAR_ID || '',
    version: process.env.NEXT_PUBLIC_HOTJAR_VERSION || '6',
  },
  sentry: {
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || '',
    authToken: process.env.SENTRY_AUTH_TOKEN || '',
  },
} as const

export const EXTERNAL_SERVICES = {
  googleMaps: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  cdn: process.env.NEXT_PUBLIC_CDN_URL || '',
} as const

export const EMAIL_CONFIG = {
  sendgrid: process.env.SENDGRID_API_KEY || '',
  from: process.env.EMAIL_FROM || 'noreply@coventure.in',
  fromName: process.env.EMAIL_FROM_NAME || 'Co Housing Ventures',
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.sendgrid.net',
    port: parseInt(process.env.SMTP_PORT || '587'),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
} as const

export const ROUTES = {
  home: '/',
  properties: '/properties',
  propertyDetail: (id: string) => `/properties/${id}`,
  categories: '/categories',
  categoryDetail: (slug: string) => `/categories/${slug}`,
  blog: '/blog',
  blogPost: (slug: string) => `/blog/${slug}`,
  cohousing: '/cohousing',
  about: '/about',
  contact: '/contact',
  auth: {
    login: '/auth/login',
    signup: '/auth/signup',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
    callback: '/auth/callback',
  },
  dashboard: {
    home: '/dashboard',
    properties: '/dashboard/properties',
    enquiries: '/dashboard/enquiries',
    saved: '/dashboard/saved',
    profile: '/dashboard/profile',
  },
  admin: {
    home: '/admin',
    properties: '/admin/properties',
    users: '/admin/users',
    enquiries: '/admin/enquiries',
    blog: '/admin/blog',
    testimonials: '/admin/testimonials',
    settings: '/admin/settings',
  },
} as const

export const PAGINATION = {
  defaultLimit: 10,
  maxLimit: 100,
  defaultPage: 1,
} as const

export const PROPERTY_TYPES = [
  'Apartment',
  'Villa',
  'Independent House',
  'Penthouse',
  'Studio',
  'Farmhouse',
  'Cottage',
  'Co-Living Space',
] as const

export const PROPERTY_STATUS = {
  available: 'Available',
  pending: 'Pending',
  sold: 'Sold',
  draft: 'Draft',
} as const

export const USER_ROLES = {
  user: 'User',
  admin: 'Admin',
  super_admin: 'Super Admin',
} as const

export const ENQUIRY_STATUS = {
  new: 'New',
  in_progress: 'In Progress',
  closed: 'Closed',
} as const

export const MESSAGE_STATUS = {
  new: 'New',
  in_progress: 'In Progress',
  resolved: 'Resolved',
} as const

export const BUDGET_RANGES = [
  '₹10L - ₹25L',
  '₹25L - ₹50L',
  '₹50L - ₹75L',
  '₹75L - ₹1Cr',
  '₹1Cr - ₹2Cr',
  '₹2Cr+',
] as const

export const MOVE_IN_TIMELINES = [
  'Immediate (Within 1 month)',
  '1-3 months',
  '3-6 months',
  '6-12 months',
  '1+ year',
  'Flexible',
] as const

export const AMENITIES = [
  'Swimming Pool',
  'Gym',
  'Parking',
  'Garden',
  'Security',
  'Power Backup',
  'Lift',
  'Club House',
  'Kids Play Area',
  'Intercom',
  'Gas Pipeline',
  'Water Supply',
  'Maintenance Staff',
  'WiFi',
  'Air Conditioning',
] as const

export const BLOG_CATEGORIES = [
  'Real Estate',
  'Co-Housing',
  'Investment',
  'Lifestyle',
  'Interior Design',
  'Market Trends',
  'Legal',
  'Finance',
] as const

export const SOCIAL_LINKS = {
  facebook: 'https://facebook.com/cohousingventures',
  twitter: 'https://twitter.com/cohousingventures',
  instagram: 'https://instagram.com/cohousingventures',
  linkedin: 'https://linkedin.com/company/cohousingventures',
  youtube: 'https://youtube.com/@cohousingventures',
} as const

export const CONTACT_INFO = {
  email: 'info@coventure.in',
  phone: '+91 98765 43210',
  address: 'Cohousy, Grand Road, Eon Free Zone, Kharadi Gaon, Pune 411014, India',
} as const

export const SEO_DEFAULTS = {
  titleTemplate: '%s | Co Housing Ventures',
  defaultTitle: 'Co Housing Ventures - Premium Co-Living Spaces in India',
  description: APP_CONFIG.description,
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: APP_CONFIG.url,
    siteName: APP_CONFIG.name,
  },
  twitter: {
    handle: '@cohousingventures',
    site: '@cohousingventures',
    cardType: 'summary_large_image',
  },
} as const

export const FILE_UPLOAD = {
  maxSize: 5 * 1024 * 1024, // 5MB
  allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  allowedDocTypes: ['application/pdf', 'application/msword'],
} as const

export const VALIDATION = {
  password: {
    minLength: 8,
    maxLength: 100,
    requireUppercase: true,
    requireLowercase: true,
    requireNumber: true,
    requireSpecialChar: false,
  },
  phone: {
    minLength: 10,
    maxLength: 15,
  },
  name: {
    minLength: 2,
    maxLength: 100,
  },
} as const
