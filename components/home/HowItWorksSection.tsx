'use client';

import React from 'react';
import { Search, Users, FileCheck, Home } from 'lucide-react';
import { Section } from '../ui/Section';
import { motion } from 'framer-motion';

const steps = [
  {
    number: '01',
    icon: Search,
    title: 'Browse & Select',
    description: 'Explore our curated properties and find your perfect match',
  },
  {
    number: '02',
    icon: Users,
    title: 'Connect with Co-Buyers',
    description: 'We match you with verified co-buyers sharing similar goals',
  },
  {
    number: '03',
    icon: FileCheck,
    title: 'Legal & Financial Setup',
    description: 'Our experts handle all documentation and financing arrangements',
  },
  {
    number: '04',
    icon: Home,
    title: 'Move Into Your Home',
    description: 'Complete ownership transfer and start your new chapter',
  },
];

export const HowItWorksSection: React.FC = () => {
  return (
    <Section id="how-it-works" className="py-24 lg:py-32 bg-white">
      {/* Header */}
      <div className="text-center mb-20 max-w-3xl mx-auto px-6">
        <div className="w-12 h-1 bg-coral mx-auto mb-6"></div>
        <h2 className="text-4xl lg:text-5xl font-bold text-[#2D3748] mb-6">
          How it works
        </h2>
        <p className="text-lg text-[#6B7280] leading-relaxed">
          Your journey to co-ownership made simple. Follow these easy steps to find your perfect property and connect with like-minded co-buyers.
        </p>
      </div>

      {/* Horizontal Flow - Desktop */}
      <div className="hidden lg:block max-w-7xl mx-auto px-6">
        <div className="relative">
          {/* Dotted connecting line */}
          <svg 
            className="absolute top-24 left-0 w-full h-2" 
            style={{ zIndex: 0 }}
            preserveAspectRatio="none"
            viewBox="0 0 1200 20"
          >
            <path
              d="M 150 10 L 1050 10"
              stroke="#E0E0E0"
              strokeWidth="3"
              strokeDasharray="10 10"
              fill="none"
            />
          </svg>

          {/* Steps Grid */}
          <div className="grid grid-cols-4 gap-8 relative" style={{ zIndex: 1 }}>
            {steps.map((step, index) => {
              const Icon = step.icon;
              
              return (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.15 }}
                  className="flex flex-col items-center text-center"
                >
                  {/* Icon Container - Illustration placeholder */}
                  <div className="relative mb-8">
                    {/* Connection dot on top */}
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-coral rounded-full border-4 border-white shadow-md z-10" />
                    
                    {/* Illustration Box */}
                    <div className="w-48 h-48 bg-gradient-to-br from-[#F8F9FA] to-[#E8EAF0] rounded-3xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
                      {/* Step number badge */}
                      <div className="absolute -top-3 -right-3 w-12 h-12 bg-coral rounded-full flex items-center justify-center shadow-lg">
                        <span className="text-white font-bold text-lg">{step.number}</span>
                      </div>
                      
                      {/* Icon with custom styling per step */}
                      <div className="relative">
                        {index === 0 && (
                          // Profile/Form illustration
                          <div className="space-y-2">
                            <div className="w-32 h-3 bg-coral/20 rounded"></div>
                            <div className="w-24 h-3 bg-peach/30 rounded"></div>
                            <div className="w-28 h-3 bg-coral/20 rounded"></div>
                            <div className="flex gap-2 mt-4">
                              <div className="w-3 h-3 bg-coral rounded-full"></div>
                              <div className="w-3 h-3 bg-peach rounded-full"></div>
                              <div className="w-3 h-3 bg-coral/40 rounded-full"></div>
                            </div>
                          </div>
                        )}
                        
                        {index === 1 && (
                          // Cards/Blocks illustration
                          <div className="grid grid-cols-2 gap-3">
                            <div className="w-14 h-16 bg-[#4ECB71] rounded-lg"></div>
                            <div className="w-14 h-16 bg-peach rounded-lg"></div>
                            <div className="w-14 h-16 bg-coral rounded-lg"></div>
                            <div className="w-14 h-16 bg-[#4A90E2] rounded-lg"></div>
                          </div>
                        )}
                        
                        {index === 2 && (
                          // Document/List illustration
                          <div className="space-y-2">
                            <div className="w-32 h-20 bg-white rounded-lg border-2 border-gray-200 p-2">
                              <div className="w-full h-2 bg-gray-300 rounded mb-2"></div>
                              <div className="w-3/4 h-2 bg-coral/40 rounded mb-2"></div>
                              <div className="w-full h-2 bg-gray-300 rounded mb-2"></div>
                              <div className="w-2/3 h-2 bg-peach/40 rounded"></div>
                            </div>
                          </div>
                        )}
                        
                        {index === 3 && (
                          // Chart/Growth illustration
                          <div className="flex items-end gap-2">
                            <div className="w-6 h-12 bg-peach rounded-t-lg"></div>
                            <div className="w-6 h-16 bg-coral rounded-t-lg"></div>
                            <div className="w-6 h-20 bg-[#4A90E2] rounded-t-lg"></div>
                            <div className="absolute -top-2 -right-2 w-8 h-8 bg-[#4A90E2] rounded-full flex items-center justify-center">
                              <div className="w-4 h-4 bg-white rounded-full"></div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Step Title */}
                  <h3 className="text-xl font-bold text-[#2D3748] mb-3">
                    {step.title}
                  </h3>
                  
                  {/* Step Description */}
                  <p className="text-sm text-[#6B7280] leading-relaxed">
                    {step.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile/Tablet View */}
      <div className="lg:hidden max-w-2xl mx-auto px-6">
        <div className="relative">
          {/* Vertical dotted line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 border-l-2 border-dashed border-gray-300" />
          
          {/* Steps */}
          <div className="space-y-12">
            {steps.map((step, index) => {
              const Icon = step.icon;
              
              return (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="relative flex gap-6"
                >
                  {/* Connection dot */}
                  <div className="flex-shrink-0 w-16">
                    <div className="w-4 h-4 bg-coral rounded-full border-4 border-white shadow-md relative z-10 ml-6" />
                  </div>

                  {/* Content Card */}
                  <div className="flex-1 pb-8">
                    {/* Illustration Box */}
                    <div className="w-full h-40 bg-gradient-to-br from-[#F8F9FA] to-[#E8EAF0] rounded-2xl flex items-center justify-center shadow-lg mb-4 relative border border-gray-100">
                      {/* Step number badge */}
                      <div className="absolute -top-3 -right-3 w-10 h-10 bg-coral rounded-full flex items-center justify-center shadow-lg">
                        <span className="text-white font-bold text-base">{step.number}</span>
                      </div>
                      
                      {/* Simplified icons for mobile */}
                      <Icon className="w-16 h-16 text-coral/40" strokeWidth={1.5} />
                    </div>

                    {/* Text Content */}
                    <h3 className="text-lg font-bold text-[#2D3748] mb-2">
                      {step.title}
                    </h3>
                    <p className="text-sm text-[#6B7280] leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </Section>
  );
};
