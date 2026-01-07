'use client';

import React from 'react';
import { Button } from '../ui/Button';

export const CTASection: React.FC = () => {
  return (
    <section className="py-24 bg-gradient-to-r from-coral to-coral-light">
      <div className="container mx-auto px-6 md:px-10 lg:px-20 max-w-[800px] text-center">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
          Ready to Find Your Dream Home?
        </h2>
        
        <p className="text-lg md:text-xl text-white/90 mb-10">
          Let us help you take the first step towards co-ownership
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            variant="secondary"
            className="bg-white text-coral hover:bg-peach-light border-0"
            onClick={() => window.location.href = '/properties'}
          >
            Start Your Journey
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-2 border-white text-white hover:bg-white/10"
            onClick={() => window.location.href = '/contact'}
          >
            Schedule Consultation
          </Button>
        </div>
      </div>
    </section>
  );
};
