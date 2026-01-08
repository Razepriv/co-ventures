'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Home, IndianRupee, Building, Star } from 'lucide-react';

interface StatProps {
  icon: React.ElementType;
  value: string | number;
  label: string;
  suffix?: string;
}

const StatCounter: React.FC<StatProps> = ({ icon: Icon, value, label, suffix = '' }) => {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  
  // Check if value is a range (contains -) or needs special handling
  const isRange = typeof value === 'string' && value.includes('-');

  useEffect(() => {
    // Skip animation for range values
    if (isRange) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          const target = typeof value === 'string' ? parseInt(value.replace(/\D/g, '')) : value;
          const duration = 2000;
          const steps = 60;
          const increment = target / steps;
          let current = 0;

          const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
              setCount(target);
              clearInterval(timer);
            } else {
              setCount(Math.floor(current));
            }
          }, duration / steps);

          return () => clearInterval(timer);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [value, hasAnimated, isRange]);

  const displayValue = typeof value === 'string' && value.includes('Cr') 
    ? `₹${count}Cr${suffix}` 
    : isRange
    ? `${value}${suffix}`
    : `${count}${suffix}`;

  return (
    <div ref={ref} className="text-center">
      {Icon && (
        <Icon className="w-10 h-10 text-white mx-auto mb-4 opacity-80" />
      )}
      <div className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3">
        {displayValue}
      </div>
      <div className="text-lg text-white/80">
        {label}
      </div>
    </div>
  );
};

export const ByTheNumbersSection: React.FC = () => {
  return (
    <section className="py-20 bg-gradient-to-r from-coral to-coral-light">
      <div className="container mx-auto px-6 md:px-10 lg:px-20 max-w-[1440px]">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
          <StatCounter
            icon={Home}
            value="250"
            label="Opportunities Evaluated"
            suffix="+"
          />
          <StatCounter
            icon={IndianRupee}
            value="10"
            label="Cities Tracked"
            suffix="+"
          />
          <StatCounter
            icon={Building}
            value="40"
            label="Active Markets Screened"
            suffix="+"
          />
          <StatCounter
            icon={Star}
            value="48-72"
            label="Decision Turnaround"
            suffix=" hrs"
          />
        </div>
        <p className="text-center text-white/80 text-sm mt-8 max-w-2xl mx-auto">
          Figures shown are internal pipeline metrics, not investor returns.
        </p>
      </div>
    </section>
  );
};
