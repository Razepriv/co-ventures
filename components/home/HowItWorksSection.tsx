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
    position: 'left'
  },
  {
    number: '02',
    icon: Users,
    title: 'Connect with Co-Buyers',
    description: 'We match you with verified co-buyers sharing similar goals',
    position: 'right'
  },
  {
    number: '03',
    icon: FileCheck,
    title: 'Legal & Financial Setup',
    description: 'Our experts handle all documentation and financing arrangements',
    position: 'left'
  },
  {
    number: '04',
    icon: Home,
    title: 'Move Into Your Home',
    description: 'Complete ownership transfer and start your new chapter',
    position: 'right'
  },
];

export const HowItWorksSection: React.FC = () => {
  return (
    <Section id="how-it-works" className="py-24 lg:py-32 bg-[#F8F9FA]">
      {/* Header */}
      <div className="text-center mb-20">
        <h2 className="text-5xl lg:text-[56px] font-bold text-[#2D3748] mb-4">
          How Co-Housing Works
        </h2>
        <p className="text-xl text-[#6B7280]">
          Your journey to co-ownership in{' '}
          <span className="text-coral font-semibold">4 simple steps</span>
        </p>
      </div>

      {/* Journey Path - Desktop */}
      <div className="relative max-w-6xl mx-auto px-6 hidden lg:block" style={{ minHeight: '900px' }}>
        {/* Curved dashed connecting lines using SVG */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
          {/* Curve from step 1 to step 2 */}
          <path
            d="M 320 110 Q 450 160, 580 250"
            stroke="#FF7B63"
            strokeWidth="2.5"
            strokeDasharray="8 8"
            fill="none"
          />
          {/* Curve from step 2 to step 3 */}
          <path
            d="M 580 330 Q 450 420, 320 510"
            stroke="#FF7B63"
            strokeWidth="2.5"
            strokeDasharray="8 8"
            fill="none"
          />
          {/* Curve from step 3 to step 4 */}
          <path
            d="M 320 590 Q 450 680, 580 770"
            stroke="#FF7B63"
            strokeWidth="2.5"
            strokeDasharray="8 8"
            fill="none"
          />
        </svg>
        
        {/* Connection dots */}
        <div className="absolute" style={{ left: '320px', top: '110px', width: '14px', height: '14px', backgroundColor: '#FF7B63', borderRadius: '50%', zIndex: 10 }} />
        <div className="absolute" style={{ left: '580px', top: '250px', width: '14px', height: '14px', backgroundColor: '#FF7B63', borderRadius: '50%', zIndex: 10 }} />
        <div className="absolute" style={{ left: '320px', top: '510px', width: '14px', height: '14px', backgroundColor: '#FF7B63', borderRadius: '50%', zIndex: 10 }} />
        <div className="absolute" style={{ left: '580px', top: '770px', width: '14px', height: '14px', backgroundColor: '#FF7B63', borderRadius: '50%', zIndex: 10 }} />

        {/* Steps */}
        <div className="relative">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isLeft = step.position === 'left';
            const topPosition = index * 260 + 50;
            
            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, x: isLeft ? -60 : 60 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="absolute"
                style={{
                  top: `${topPosition}px`,
                  left: isLeft ? '10%' : 'auto',
                  right: isLeft ? 'auto' : '10%',
                  width: '420px'
                }}
              >
                <div className="relative flex items-center group">
                  {isLeft ? (
                    <>
                      {/* Left-aligned card */}
                      <div 
                        className="flex-1 bg-gradient-to-br from-[#FF7B63] to-[#FF6B52] py-8 pr-24 pl-10 shadow-[0_10px_30px_rgba(255,123,99,0.2)] hover:shadow-[0_15px_40px_rgba(255,123,99,0.3)] transition-all duration-300 hover:-translate-y-1"
                        style={{ borderRadius: '70px' }}
                      >
                        <h3 className="text-2xl font-bold text-white mb-2 leading-tight">
                          {step.title}
                        </h3>
                        <p className="text-white/95 text-base leading-relaxed pr-2">
                          {step.description}
                        </p>
                      </div>
                      
                      {/* Step badge with border - positioned on right */}
                      <div className="absolute right-0 top-1/2 transform -translate-y-1/2" style={{ zIndex: 20 }}>
                        <div className="relative">
                          {/* Circle badge */}
                          <div 
                            className="relative bg-white shadow-xl"
                            style={{ 
                              width: '75px', 
                              height: '75px', 
                              borderRadius: '50%',
                              border: '4px solid #FF7B63',
                              zIndex: 2 
                            }}
                          >
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="text-center">
                                <div className="text-[11px] font-bold text-[#FF7B63] uppercase tracking-[0.1em] mb-0.5">
                                  STEP
                                </div>
                                <div className="text-[26px] font-bold text-[#FF7B63] leading-none">
                                  {step.number}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Step badge with border - positioned on left */}
                      <div className="absolute left-0 top-1/2 transform -translate-y-1/2" style={{ zIndex: 20 }}>
                        <div className="relative">
                          {/* Circle badge */}
                          <div 
                            className="relative bg-white shadow-xl"
                            style={{ 
                              width: '75px', 
                              height: '75px', 
                              borderRadius: '50%',
                              border: '4px solid #FF7B63',
                              zIndex: 2 
                            }}
                          >
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="text-center">
                                <div className="text-[11px] font-bold text-[#FF7B63] uppercase tracking-[0.1em] mb-0.5">
                                  STEP
                                </div>
                                <div className="text-[26px] font-bold text-[#FF7B63] leading-none">
                                  {step.number}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Right-aligned card */}
                      <div 
                        className="flex-1 bg-gradient-to-br from-[#FF7B63] to-[#FF6B52] py-8 pl-24 pr-10 shadow-[0_10px_30px_rgba(255,123,99,0.2)] hover:shadow-[0_15px_40px_rgba(255,123,99,0.3)] transition-all duration-300 hover:-translate-y-1"
                        style={{ borderRadius: '70px' }}
                      >
                        <h3 className="text-2xl font-bold text-white mb-2 leading-tight">
                          {step.title}
                        </h3>
                        <p className="text-white/95 text-base leading-relaxed pl-2">
                          {step.description}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Journey Path - Mobile/Tablet */}
      <div className="relative max-w-2xl mx-auto px-6 lg:hidden">
        {/* Vertical dashed line */}
        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 border-l-[2px] border-dashed border-coral/40 transform -translate-x-1/2" />
        
        {/* Connection dots */}
        {steps.map((step, index) => (
          <div
            key={`dot-${step.number}`}
            className="absolute left-1/2 w-3 h-3 bg-coral rounded-full border-2 border-white transform -translate-x-1/2 z-10 shadow-md"
            style={{ top: `${index * 280 + 60}px` }}
          />
        ))}

        {/* Steps */}
        <div className="relative space-y-16 pt-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            
            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="relative"
              >
                {/* Card */}
                <div className="bg-gradient-to-br from-[#FF6B4A] to-[#E85A3A] rounded-[32px] shadow-[0_8px_32px_rgba(255,107,74,0.25)] overflow-hidden">
                  <div className="p-6 md:p-8">
                    {/* Step badge */}
                    <div className="flex justify-center mb-6">
                      <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-xl border-4 border-white">
                        <div className="text-center">
                          <div className="text-[8px] font-bold text-coral uppercase tracking-widest">
                            STEP
                          </div>
                          <div className="text-2xl font-bold text-coral leading-none">
                            {step.number}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="text-center">
                      <h3 className="text-xl md:text-2xl font-bold text-white mb-3 leading-tight">
                        {step.title}
                      </h3>
                      <p className="text-white/95 text-sm leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </Section>
  );
};
