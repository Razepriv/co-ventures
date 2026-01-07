// Property Types
export interface Property {
  id: string;
  name: string;
  price: number;
  location: {
    area: string;
    city: string;
  };
  images: string[];
  bhk: number;
  area: number; // in sqft
  status: 'ready' | 'under-construction' | 'upcoming';
  featured: boolean;
  new: boolean;
  coHousingAvailable: boolean;
  saved?: boolean;
}

// Testimonial Types
export interface Testimonial {
  id: string;
  customerName: string;
  profileImage?: string;
  reviewText: string;
  rating: number;
  propertyType: string;
  location: string;
  approved: boolean;
  featured: boolean;
  date: string;
}

// Blog Post Types
export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  featuredImage: string;
  author: {
    name: string;
    avatar?: string;
  };
  publishDate: string;
  readTime: number; // in minutes
  featured: boolean;
  published: boolean;
}

// Stats Types
export interface Stats {
  happyFamilies: number;
  propertyValue: string;
  completedProjects: number;
  satisfactionRate: number;
}

// Search Criteria Types
export interface SearchCriteria {
  location?: string;
  propertyTypes: string[];
  priceRange: {
    min: number;
    max: number;
  };
  bedrooms: number[];
  amenities?: string[];
  propertyStatus?: string[];
  possessionDate?: string;
  furnishingStatus?: string[];
  coHousingAvailable?: boolean;
}

// Currency Types
export type Currency = 'INR' | 'USD' | 'EUR';

// Navigation Types
export interface NavItem {
  label: string;
  href: string;
}
