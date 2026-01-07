'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Home, IndianRupee, Building, Star } from 'lucide-react';
import { Section } from '../ui/Section';
import { mockStats } from '@/lib/mockData';

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

  useEffect(() => {
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
  }, [value, hasAnimated]);

  const displayValue = typeof value === 'string' && value.includes('Cr') 
    ? `₹${count}Cr${suffix}` 
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
            value={mockStats.happyFamilies}
            label="Happy Families"
            suffix="+"
          />
          <StatCounter
            icon={IndianRupee}
            value="100"
            label="Property Value"
            suffix="Cr+"
          />
          <StatCounter
            icon={Building}
            value={mockStats.completedProjects}
            label="Completed Projects"
            suffix="+"
          />
          <StatCounter
            icon={Star}
            value={mockStats.satisfactionRate}
            label="Satisfaction Rate"
            suffix="%"
          />
        </div>
      </div>
    </section>
  );
};
