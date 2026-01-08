'use client';

import React, { useState } from 'react';
import { MapPin, Building2, IndianRupee, Bed, Search, SlidersHorizontal } from 'lucide-react';
import { Button } from '../ui/Button';
import { cities, propertyTypes, bedroomOptions } from '@/lib/mockData';

export const SearchBarSection: React.FC = () => {
  const [location, setLocation] = useState('');
  const [propertyType, setPropertyType] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState({ min: 5000000, max: 20000000 });
  const [bedrooms, setBedrooms] = useState<string[]>([]);

  const handleSearch = () => {
    // Build query parameters and navigate to properties page
    const params = new URLSearchParams();
    if (location) params.append('location', location);
    if (propertyType.length > 0) params.append('type', propertyType.join(','));
    params.append('minPrice', priceRange.min.toString());
    params.append('maxPrice', priceRange.max.toString());
    if (bedrooms.length > 0) params.append('bedrooms', bedrooms.join(','));
    
    window.location.href = `/properties?${params.toString()}`;
  };

  return (
    <div className="relative -mt-28 mb-16 z-30">
      <div className="container mx-auto px-6 md:px-10 lg:px-20 max-w-[1200px]">
        <div className="bg-white rounded-xl shadow-[0_20px_60px_rgb(0,0,0,0.15)] overflow-hidden border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-0">
            {/* Location Dropdown */}
            <div className="relative group">
              <div className="flex items-start gap-3 p-5 hover:bg-gray-50 transition-colors cursor-pointer border-b lg:border-b-0 lg:border-r border-gray-100">
                <MapPin className="w-5 h-5 text-coral mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <label className="block text-xs font-medium text-gray-600 mb-2 uppercase tracking-wide">City / Micro-market</label>
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full text-sm font-semibold text-charcoal bg-transparent focus:outline-none cursor-pointer appearance-none pr-6"
                    style={{ backgroundImage: "url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2212%22%20height%3D%227%22%20viewBox%3D%220%200%2012%207%22%20fill%3D%22none%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22M1%201L6%206L11%201%22%20stroke%3D%22%23666%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22/%3E%3C/svg%3E')", backgroundRepeat: 'no-repeat', backgroundPosition: 'right center', backgroundSize: '12px' }}
                    aria-label="Select location"
                  >
                    <option value="">Select Location</option>
                    {cities.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Property Type */}
            <div className="relative group">
              <div className="flex items-start gap-3 p-5 hover:bg-gray-50 transition-colors cursor-pointer border-b lg:border-b-0 lg:border-r border-gray-100">
                <Building2 className="w-5 h-5 text-coral mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <label className="block text-xs font-medium text-gray-600 mb-2 uppercase tracking-wide">Asset Type</label>
                  <select
                    className="w-full text-sm font-semibold text-charcoal bg-transparent focus:outline-none cursor-pointer appearance-none pr-6"
                    style={{ backgroundImage: "url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2212%22%20height%3D%227%22%20viewBox%3D%220%200%2012%207%22%20fill%3D%22none%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22M1%201L6%206L11%201%22%20stroke%3D%22%23666%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22/%3E%3C/svg%3E')", backgroundRepeat: 'no-repeat', backgroundPosition: 'right center', backgroundSize: '12px' }}
                    aria-label="Select property type"
                    defaultValue="All Types"
                  >
                    <option value="All Types">All Types</option>
                    {propertyTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Price Range */}
            <div className="relative group">
              <div className="flex items-start gap-3 p-5 hover:bg-gray-50 transition-colors cursor-pointer border-b lg:border-b-0 lg:border-r border-gray-100">
                <IndianRupee className="w-5 h-5 text-coral mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <label className="block text-xs font-medium text-gray-600 mb-2 uppercase tracking-wide">Ticket Size</label>
                  <div className="text-sm font-semibold text-charcoal truncate">
                    ₹25L - ₹5Cr
                  </div>
                </div>
              </div>
            </div>

            {/* Bedrooms */}
            <div className="relative group">
              <div className="flex items-start gap-3 p-5 hover:bg-gray-50 transition-colors cursor-pointer border-b lg:border-b-0 lg:border-r border-gray-100">
                <Bed className="w-5 h-5 text-coral mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <label className="block text-xs font-medium text-gray-600 mb-2 uppercase tracking-wide">Investment Horizon</label>
                  <select
                    className="w-full text-sm font-semibold text-charcoal bg-transparent focus:outline-none cursor-pointer appearance-none pr-6"
                    style={{ backgroundImage: "url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2212%22%20height%3D%227%22%20viewBox%3D%220%200%2012%207%22%20fill%3D%22none%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22M1%201L6%206L11%201%22%20stroke%3D%22%23666%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22/%3E%3C/svg%3E')", backgroundRepeat: 'no-repeat', backgroundPosition: 'right center', backgroundSize: '12px' }}
                    aria-label="Select bedrooms"
                    defaultValue="1 BHK"
                  >
                    {bedroomOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Search Button */}
            <div className="flex items-center p-5 hover:bg-gray-50 transition-colors">
              <Button
                onClick={handleSearch}
                className="w-full shadow-md font-bold"
                size="lg"
              >
                <Search className="w-5 h-5 mr-2" />
                Find Opportunities
              </Button>
            </div>
          </div>

          {/* More Filters Link */}
          <div className="px-5 py-4 border-t border-gray-100">
            <button className="text-sm text-coral hover:text-coral-dark font-semibold inline-flex items-center gap-2 transition-colors">
              <SlidersHorizontal className="w-4 h-4" />
              Refine Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
