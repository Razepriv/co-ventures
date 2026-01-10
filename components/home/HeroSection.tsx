'use client';

import React from 'react';
import Image from 'next/image';
import { Home, IndianRupee, Shield } from 'lucide-react';
import { Button } from '../ui/Button';
import { motion } from 'framer-motion';

export const HeroSection: React.FC = () => {
  const handleExploreProperties = () => {
    window.location.href = '/properties';
  };

  const handleHowItWorks = () => {
    const element = document.getElementById('how-it-works');
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative h-screen min-h-[600px] flex items-center overflow-hidden">
      {/* Full-Width Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&q=90"
          alt="Invest in India's Growth Corridors"
          fill
          className="object-cover object-[center_25%]"
          priority
          quality={90}
        />
        {/* Dark Overlay for text contrast */}
        <div className="absolute inset-0 bg-black/60" />
      </div>

      {/* Content Container */}
      <div className="container mx-auto px-6 md:px-10 lg:px-20 max-w-[1440px] relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[70vh]">
          
          {/* Left Side - Main Headline & CTAs */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-left"
          >
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6 drop-shadow-2xl">
              Invest in India&apos;s Growth Corridors with Confidence
            </h1>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 mb-8"
            >
              <Button 
                size="lg" 
                onClick={handleExploreProperties}
                className="text-lg px-8 py-6 shadow-2xl hover:shadow-coral/50"
              >
                Explore Opportunities
              </Button>
              <Button 
                size="lg" 
                variant="secondary" 
                onClick={handleHowItWorks}
                className="text-lg px-8 py-6 bg-white/10 backdrop-blur-md border-2 border-white text-white hover:bg-white hover:text-coral shadow-2xl"
              >
                Our Strategy
              </Button>
            </motion.div>
          </motion.div>

          {/* Right Side - Subheading */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="hidden lg:flex items-center justify-end"
          >
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 max-w-md shadow-2xl">
              <p className="text-xl text-white leading-relaxed">
                Co-ventures gives you access to curated real estate opportunities across India&apos;s fastest-growing micro-markets - backed by disciplined underwriting and a capital-first mindset.
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Trust badges removed as requested */}
    </section>
  );
};
