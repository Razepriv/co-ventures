'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Bed, Maximize, Key, Heart, ArrowRight } from 'lucide-react';
import { Section } from '../ui/Section';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { getSupabaseClient } from '@/lib/supabase/client';
import { useCurrency } from '@/lib/contexts/CurrencyContext';

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

export const FeaturedPropertiesSection: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  // const [savedProperties, setSavedProperties] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchProperties();
  }, []);

  async function fetchProperties() {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('properties')
        .select('*, categories(name, icon), property_images(image_url, is_primary)')
        .eq('is_featured', true)
        .eq('status', 'available')
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) throw error;
      console.log('Fetched properties:', data);
      setProperties(data || []);
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <Section className="py-24 lg:py-32">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coral"></div>
        </div>
      </Section>
    );
  }

  if (properties.length === 0) return null;



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
