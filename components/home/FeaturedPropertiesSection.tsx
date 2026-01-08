'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Bed, Maximize, Key, Heart, ArrowRight } from 'lucide-react';
import { Section } from '../ui/Section';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Property } from '@/types';
import { formatPrice } from '@/lib/utils';
import { mockProperties } from '@/lib/mockData';

export const FeaturedPropertiesSection: React.FC = () => {
  const [savedProperties, setSavedProperties] = useState<Set<string>>(new Set());

  const toggleSave = (propertyId: string) => {
    setSavedProperties((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(propertyId)) {
        newSet.delete(propertyId);
      } else {
        newSet.add(propertyId);
      }
      return newSet;
    });
  };

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
        {mockProperties.map((property) => (
          <PropertyCard
            key={property.id}
            property={property}
            isSaved={savedProperties.has(property.id)}
            onToggleSave={toggleSave}
          />
        ))}
      </div>
    </Section>
  );
};

interface PropertyCardProps {
  property: Property;
  isSaved: boolean;
  onToggleSave: (id: string) => void;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property, isSaved, onToggleSave }) => {
  return (
    <Card hover className="overflow-hidden">
      <Link href={`/properties/${property.id}`}>
        {/* Image Container */}
        <div className="relative h-64 overflow-hidden">
          <Image
            src={property.images[0]}
            alt={`${property.name} in ${property.location.area}`}
            fill
            className="object-cover transition-transform duration-500 hover:scale-110"
          />
          
          {/* Badges */}
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            {property.featured && (
              <Badge variant="coral">Featured</Badge>
            )}
            {property.new && (
              <Badge variant="green">New</Badge>
            )}
          </div>

          {/* Save Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              onToggleSave(property.id);
            }}
            className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors"
            aria-label={isSaved ? 'Remove from saved' : 'Save property'}
          >
            <Heart
              className={`w-5 h-5 transition-colors ${
                isSaved ? 'fill-coral text-coral' : 'text-gray-600'
              }`}
            />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-2xl font-bold text-charcoal mb-2">
            {formatPrice(property.price)}
          </p>

          <h3 className="text-lg font-semibold text-charcoal mb-2">
            {property.name}
          </h3>

          <div className="flex items-center gap-2 text-gray-600 mb-4">
            <MapPin className="w-4 h-4 text-coral flex-shrink-0" />
            <span className="text-sm">
              {property.location.area}, {property.location.city}
            </span>
          </div>

          {/* Features */}
          <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-200">
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <Bed className="w-4 h-4 text-coral" />
              <span>{property.bhk} BHK</span>
            </div>
            <div className="w-px h-4 bg-gray-300" />
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <Maximize className="w-4 h-4 text-coral" />
              <span>{property.area.toLocaleString()} sqft</span>
            </div>
            <div className="w-px h-4 bg-gray-300" />
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <Key className="w-4 h-4 text-coral" />
              <span className="capitalize">{property.status.replace('-', ' ')}</span>
            </div>
          </div>

          {/* Bottom Row */}
          <div className="flex items-center justify-between">
            {property.coHousingAvailable && (
              <Badge variant="peach">Curated investment opportunity</Badge>
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
