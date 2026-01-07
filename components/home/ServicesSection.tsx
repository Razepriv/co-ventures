'use client';

import React from 'react';
import Image from 'next/image';
import { Search, FileCheck, Calculator, UserCheck, Building } from 'lucide-react';
import { Section } from '../ui/Section';
import { Button } from '../ui/Button';

const services = [
  {
    icon: Search,
    title: 'Property Search & Matching',
    description: 'Access exclusive properties and get matched with ideal co-housing opportunities',
  },
  {
    icon: FileCheck,
    title: 'Legal Documentation & RERA Compliance',
    description: 'Complete legal support ensuring RERA compliance and secure ownership transfer',
  },
  {
    icon: Calculator,
    title: 'Financial Planning & Loan Assistance',
    description: 'Expert guidance on financing options, loan applications, and investment planning',
  },
  {
    icon: UserCheck,
    title: 'Co-Buyer Verification & Matching',
    description: 'Thorough background verification and strategic matching with compatible co-buyers',
  },
  {
    icon: Building,
    title: 'Property Management Services',
    description: 'Ongoing support for property maintenance and management after purchase',
  },
];

export const ServicesSection: React.FC = () => {
  return (
    <Section background="peach" className="py-24 lg:py-32">
      <div className="grid lg:grid-cols-5 gap-12 items-center">
        {/* Left Image - 40% */}
        <div className="lg:col-span-2 order-2 lg:order-1">
          <div className="relative rounded-2xl overflow-hidden shadow-strong">
            <Image
              src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80"
              alt="Professional consultation and services"
              width={600}
              height={750}
              className="w-full h-auto object-cover"
            />
          </div>
        </div>

        {/* Right Content - 60% */}
        <div className="lg:col-span-3 order-1 lg:order-2">
          <p className="text-coral text-xs font-semibold tracking-widest uppercase mb-4">
            COMPREHENSIVE SOLUTIONS
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-charcoal mb-8">
            Everything You Need Under One Roof
          </h2>

          <div className="space-y-6 mb-10">
            {services.map((service) => {
              const Icon = service.icon;
              return (
                <div key={service.title} className="flex gap-4 group">
                  <div className="flex-shrink-0 w-12 h-12 bg-peach-light rounded-full flex items-center justify-center group-hover:bg-white transition-colors">
                    <Icon className="w-6 h-6 text-coral" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-charcoal mb-2">
                      {service.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {service.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <Button size="lg" onClick={() => window.location.href = '/services'}>
            Explore All Services →
          </Button>
        </div>
      </div>
    </Section>
  );
};
