import { Property, Testimonial, BlogPost, Stats } from '@/types';

// Mock Properties Data
export const mockProperties: Property[] = [
  {
    id: 'prop-1',
    name: 'Skyline Residences',
    price: 12000000,
    location: {
      area: 'Whitefield',
      city: 'Bangalore',
    },
    images: ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800'],
    bhk: 3,
    area: 1650,
    status: 'ready',
    featured: true,
    new: true,
    coHousingAvailable: true,
  },
  {
    id: 'prop-2',
    name: 'Green Valley Villas',
    price: 18500000,
    location: {
      area: 'Sarjapur Road',
      city: 'Bangalore',
    },
    images: ['https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800'],
    bhk: 4,
    area: 2200,
    status: 'ready',
    featured: true,
    new: false,
    coHousingAvailable: true,
  },
  {
    id: 'prop-3',
    name: 'Urban Heights',
    price: 9500000,
    location: {
      area: 'Marathahalli',
      city: 'Bangalore',
    },
    images: ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800'],
    bhk: 2,
    area: 1250,
    status: 'under-construction',
    featured: true,
    new: true,
    coHousingAvailable: true,
  },
];

// Mock Testimonials Data
export const mockTestimonials: Testimonial[] = [
  {
    id: 'test-1',
    customerName: 'Priya Sharma',
    reviewText: 'Co-housing with Together Buying made my dream of owning a villa possible. The team was supportive throughout, and I found amazing co-buyers who became friends!',
    rating: 5,
    propertyType: 'Villa',
    location: 'Bangalore',
    approved: true,
    featured: true,
    date: '2025-11-15',
  },
  {
    id: 'test-2',
    customerName: 'Rahul Verma',
    reviewText: 'The entire process was smooth and transparent. From finding the right property to completing all legal formalities, the team handled everything professionally.',
    rating: 5,
    propertyType: 'Apartment',
    location: 'Mumbai',
    approved: true,
    featured: true,
    date: '2025-10-28',
  },
  {
    id: 'test-3',
    customerName: 'Anjali Reddy',
    reviewText: 'I was skeptical about co-housing initially, but the verification process and legal support gave me complete confidence. Highly recommended!',
    rating: 5,
    propertyType: 'Penthouse',
    location: 'Hyderabad',
    approved: true,
    featured: false,
    date: '2025-12-05',
  },
  {
    id: 'test-4',
    customerName: 'Vikram Singh',
    reviewText: 'Best decision ever! The financial planning assistance helped me understand my investment better. Now I own a premium property I could only dream of before.',
    rating: 5,
    propertyType: 'Villa',
    location: 'Pune',
    approved: true,
    featured: false,
    date: '2025-09-20',
  },
  {
    id: 'test-5',
    customerName: 'Meera Patel',
    reviewText: 'The community aspect of co-housing is wonderful. We share common spaces and have built a supportive neighborhood. Thank you Together Buying!',
    rating: 5,
    propertyType: 'Apartment',
    location: 'Bangalore',
    approved: true,
    featured: false,
    date: '2025-11-01',
  },
  {
    id: 'test-6',
    customerName: 'Arjun Nair',
    reviewText: 'Professional service from start to finish. The property management services ensure everything runs smoothly even after purchase.',
    rating: 5,
    propertyType: 'Apartment',
    location: 'Chennai',
    approved: true,
    featured: false,
    date: '2025-10-12',
  },
];

// Mock Blog Posts Data
export const mockBlogPosts: BlogPost[] = [
  {
    id: 'blog-1',
    title: 'The Ultimate Guide to Co-Housing in 2026',
    excerpt: 'Everything you need to know about co-housing opportunities, benefits, and how to get started with your co-ownership journey.',
    category: 'Market Insights',
    featuredImage: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800',
    author: {
      name: 'John Doe',
    },
    publishDate: '2025-12-15',
    readTime: 8,
    featured: true,
    published: true,
  },
  {
    id: 'blog-2',
    title: 'How Priya and Her Co-Buyers Bought Their Dream Villa',
    excerpt: 'A heartwarming story of collaboration, trust, and achieving homeownership dreams through co-housing.',
    category: 'Success Stories',
    featuredImage: 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=800',
    author: {
      name: 'Sarah Johnson',
    },
    publishDate: '2025-12-10',
    readTime: 5,
    featured: false,
    published: true,
  },
  {
    id: 'blog-3',
    title: '5 Financial Benefits of Co-Housing You Should Know',
    excerpt: 'Discover how shared ownership can reduce your financial burden while providing premium living spaces.',
    category: 'Financial Planning',
    featuredImage: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800',
    author: {
      name: 'Michael Chen',
    },
    publishDate: '2025-12-05',
    readTime: 6,
    featured: false,
    published: true,
  },
];

// Mock Stats Data
export const mockStats: Stats = {
  happyFamilies: 500,
  propertyValue: '₹100Cr',
  completedProjects: 50,
  satisfactionRate: 98,
};

// Cities for location dropdown
export const cities = [
  'Bangalore',
  'Mumbai',
  'Delhi NCR',
  'Pune',
  'Hyderabad',
  'Chennai',
  'Kolkata',
  'Ahmedabad',
];

// Property types
export const propertyTypes = [
  'All Types',
  'Apartments',
  'Villas',
  'Penthouses',
  'Plots',
];

// Bedroom configurations
export const bedroomOptions = [
  '1 BHK',
  '2 BHK',
  '3 BHK',
  '4 BHK',
  '5+ BHK',
];
