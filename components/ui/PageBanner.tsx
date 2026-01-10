'use client';

import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface PageBannerProps {
  title: string;
  subtitle?: string;
  imageSrc: string;
  className?: string;
}

export const PageBanner: React.FC<PageBannerProps> = ({ title, subtitle, imageSrc, className }) => {
  return (
    <section className={cn('relative h-[50vh] min-h-[320px] flex items-center overflow-hidden', className)}>
      <div className="absolute inset-0 z-0">
        <Image src={imageSrc} alt={title} fill className="object-cover" priority />
        <div className="absolute inset-0 bg-black/55" />
      </div>
      <div className="container mx-auto px-6 md:px-10 lg:px-20 max-w-[1440px] relative z-10">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 drop-shadow-2xl">{title}</h1>
          {subtitle && (
            <p className="text-lg md:text-xl text-white/90 leading-relaxed">{subtitle}</p>
          )}
        </div>
      </div>
    </section>
  );
};
