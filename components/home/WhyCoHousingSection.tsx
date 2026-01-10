'use client';

import React from 'react';
import { Home, Users2, Users, ShieldCheck } from 'lucide-react';
import { Section } from '../ui/Section';
import { motion } from 'framer-motion';

const benefits = [
  {
    icon: Home,
    title: 'Capital-First Selection',
    description: 'We prioritize downside protection through conservative assumptions and risk screening before we talk upside.',
    bgColor: 'bg-amber-50',
    blobColor: 'bg-gradient-to-br from-amber-400 to-amber-500',
    rotation: '-rotate-3',
  },
  {
    icon: Users2,
    title: 'Disciplined Underwriting',
    description: 'Every opportunity is assessed with structured comps, absorption reality checks, and scenario modeling - not hype.',
    bgColor: 'bg-purple-50',
    blobColor: 'bg-gradient-to-br from-purple-500 to-purple-600',
    rotation: 'rotate-2',
  },
  {
    icon: Users,
    title: 'Growth-Corridor Focus',
    description: 'We track infrastructure, jobs, migration, and affordability bands to stay aligned with real demand.',
    bgColor: 'bg-pink-50',
    blobColor: 'bg-gradient-to-br from-pink-400 to-pink-500',
    rotation: '-rotate-2',
  },
  {
    icon: ShieldCheck,
    title: 'Transparent Process',
    description: 'Clear evaluation, clean documentation standards, and straightforward communication - so you invest with clarity.',
    bgColor: 'bg-blue-50',
    blobColor: 'bg-gradient-to-br from-blue-400 to-blue-500',
    rotation: 'rotate-3',
  },
];

export const WhyCoHousingSection: React.FC = () => {
  return (
    <Section background="white" className="py-24 lg:py-32 overflow-hidden relative">
      {/* Animated Background Grid */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ 
        backgroundImage: 'linear-gradient(#FF6B4A 1px, transparent 1px), linear-gradient(90deg, #FF6B4A 1px, transparent 1px)',
        backgroundSize: '50px 50px',
        zIndex: 0
      }} />

      {/* Animated Background Blobs */}
      <motion.div
        animate={{
          x: [0, 30, 0],
          y: [0, -20, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-20 left-[5%] w-64 h-64 bg-gradient-to-br from-amber-400/20 to-orange-400/20 rounded-full blur-3xl"
        style={{ zIndex: 0 }}
      />
      <motion.div
        animate={{
          x: [0, -40, 0],
          y: [0, 30, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
        className="absolute top-40 right-[8%] w-80 h-80 bg-gradient-to-br from-purple-400/15 to-purple-500/15 rounded-full blur-3xl"
        style={{ zIndex: 0 }}
      />
      <motion.div
        animate={{
          x: [0, 20, 0],
          y: [0, -30, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2
        }}
        className="absolute bottom-32 left-[15%] w-72 h-72 bg-gradient-to-br from-pink-400/20 to-pink-500/20 rounded-full blur-3xl"
        style={{ zIndex: 0 }}
      />
      <motion.div
        animate={{
          x: [0, -25, 0],
          y: [0, 20, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 9,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 3
        }}
        className="absolute bottom-20 right-[10%] w-64 h-64 bg-gradient-to-br from-blue-400/15 to-blue-500/15 rounded-full blur-3xl"
        style={{ zIndex: 0 }}
      />

      {/* Heading */}
      <div className="text-center mb-20 relative" style={{ zIndex: 2 }}>
        <motion.p
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-coral text-xs font-semibold tracking-widest uppercase mb-4"
        >
          THE CO-VENTURES APPROACH
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-3xl md:text-4xl lg:text-5xl font-bold text-charcoal"
        >
          Why Investors <span className="text-coral">Choose</span> Co-ventures
        </motion.h2>
      </div>

      {/* Bento Grid with Tilted Cards */}
      <div className="relative max-w-6xl mx-auto">
        {/* Dotted connector lines - subtle SVG paths */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none opacity-20"
          style={{ zIndex: 1 }}
        >
          <line
            x1="25%"
            y1="35%"
            x2="45%"
            y2="50%"
            stroke="#FF6B4A"
            strokeWidth="2"
            strokeDasharray="6 6"
          />
          <line
            x1="55%"
            y1="35%"
            x2="45%"
            y2="50%"
            stroke="#FF6B4A"
            strokeWidth="2"
            strokeDasharray="6 6"
          />
          <line
            x1="25%"
            y1="65%"
            x2="45%"
            y2="50%"
            stroke="#FF6B4A"
            strokeWidth="2"
            strokeDasharray="6 6"
          />
          <line
            x1="55%"
            y1="65%"
            x2="45%"
            y2="50%"
            stroke="#FF6B4A"
            strokeWidth="2"
            strokeDasharray="6 6"
          />
        </svg>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24 relative" style={{ zIndex: 2 }}>
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 40, rotate: 0 }}
                whileInView={{ opacity: 1, y: 0, rotate: parseInt(benefit.rotation.replace(/[^\d-]/g, '')) }}
                viewport={{ once: true }}
                transition={{ 
                  delay: index * 0.15,
                  duration: 0.6,
                  type: 'spring',
                  stiffness: 100
                }}
                className="relative"
              >
                {/* Card */}
                <div
                  className={`${benefit.bgColor} rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 ${benefit.rotation} hover:rotate-0`}
                  style={{
                    transformOrigin: 'center',
                  }}
                >
                  {/* Icon */}
                  <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center mb-6 shadow-md">
                    <Icon className="w-7 h-7 text-coral" />
                  </div>

                  {/* Title */}
                  <h3 className="text-2xl font-bold text-charcoal mb-4">
                    {benefit.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-700 leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </Section>
  );
};
