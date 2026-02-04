'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Bed, Maximize, Key, ArrowRight } from 'lucide-react';
import { Section } from '../ui/Section';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { useCurrency } from '@/lib/contexts/CurrencyContext';
import useSWR from 'swr';

interface Property {
  id: string;
  title: string;
  slug: string;
  location: string;
  city: string;
  state: string;
  price: number;
  bhk_type: string;
  area_sqft: number;
  status: string;
  is_featured: boolean;
  featured_image: string;
  property_images: { image_url: string; is_primary: boolean }[];
  categories: { name: string; icon: string };
}

// SWR fetcher with error handling
const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch');
  const json = await res.json();
  return json.data || [];
};

// Get cached data from localStorage for instant loads
function getFeaturedFallback(): Property[] | undefined {
  if (typeof window === 'undefined') return undefined;
  try {
    const cached = localStorage.getItem('cv-featured-cache');
    if (cached) {
      const parsed = JSON.parse(cached);
      // Check if cache is less than 10 minutes old
      if (Date.now() - parsed.timestamp < 10 * 60 * 1000) {
        return parsed.data;
      }
    }
  } catch (e) {
    // Ignore
  }
  return undefined;
}

export const FeaturedPropertiesSection: React.FC = () => {
  // Use SWR for cached data fetching with stale-while-revalidate
  const { data: properties = [], isLoading: loading } = useSWR<Property[]>(
    '/api/properties/featured',
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60000, // 1 minute deduplication
      refreshInterval: 300000, // Refresh every 5 minutes
      fallbackData: getFeaturedFallback(),
      keepPreviousData: true,
      onSuccess: (data) => {
        // Cache in localStorage for instant loads on refresh
        if (typeof window !== 'undefined' && data && data.length > 0) {
          try {
            localStorage.setItem('cv-featured-cache', JSON.stringify({
              data,
              timestamp: Date.now(),
            }));
          } catch (e) {
            // Ignore storage errors
          }
        }
      },
    }
  );

  // Show loading only on first load without cached data
  if (loading && (!properties || properties.length === 0)) {
    return (
      <Section className="py-24 lg:py-32">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coral"></div>
        </div>
      </Section>
    );
  }

  if (!properties || properties.length === 0) return null;



  return (
    <Section className="py-24 lg:py-32">
      <div className="flex justify-between items-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-charcoal">
          Featured Opportunities
        </h2>
        <Link
          href="/properties"
          className="text-coral hover:text-coral-dark font-medium inline-flex items-center gap-2 group"
        >
          View All
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {properties.map((property) => (
          <PropertyCard
            key={property.id}
            property={property}
          />
        ))}
      </div>
    </Section>
  );
};

interface PropertyCardProps {
  property: Property;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
  const { formatPrice } = useCurrency();

  return (
    <Card hover className="overflow-hidden">
      <Link href={`/properties/${property.slug}`}>
        {/* Image Container */}
        <div className="relative h-64 overflow-hidden">
          <Image
            src={
              (property.featured_image && property.featured_image.startsWith('http') ? property.featured_image : null) ||
              property.property_images?.find(img => img.is_primary)?.image_url ||
              property.property_images?.[0]?.image_url ||
              'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80'
            }
            alt={`${property.title} in ${property.location}`}
            fill
            className="object-cover transition-transform duration-500 hover:scale-110"
          />

          {/* Badges */}
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            {property.is_featured && (
              <Badge variant="coral">Featured</Badge>
            )}
            {property.status === 'available' && (
              <Badge variant="green">Available</Badge>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-2xl font-bold text-charcoal mb-2">
            {formatPrice(property.price)}
          </p>

          <h3 className="text-lg font-semibold text-charcoal mb-2">
            {property.title}
          </h3>

          <div className="flex items-center gap-2 text-gray-600 mb-4">
            <MapPin className="w-4 h-4 text-coral flex-shrink-0" />
            <span className="text-sm">
              {property.location}, {property.city}
            </span>
          </div>

          {/* Features */}
          <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-200">
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <Bed className="w-4 h-4 text-coral" />
              <span>{property.bhk_type}</span>
            </div>
            <div className="w-px h-4 bg-gray-300" />
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <Maximize className="w-4 h-4 text-coral" />
              <span>{property.area_sqft?.toLocaleString() || 'N/A'} sqft</span>
            </div>
            <div className="w-px h-4 bg-gray-300" />
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <Key className="w-4 h-4 text-coral" />
              <span className="capitalize">{property.status.replace('-', ' ')}</span>
            </div>
          </div>

          {/* Bottom Row */}
          <div className="flex items-center justify-between">
            {property.categories && (
              <Badge variant="peach">{property.categories.name}</Badge>
            )}
            <span className="text-coral text-sm font-medium inline-flex items-center gap-1 ml-auto group-hover:gap-2 transition-all">
              View Details
              <ArrowRight className="w-4 h-4" />
            </span>
          </div>
        </div>
      </Link>
    </Card>
  );
};
