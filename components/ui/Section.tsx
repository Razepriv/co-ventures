import React from 'react';
import { cn } from '@/lib/utils';

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  background?: 'white' | 'peach' | 'gradient';
  id?: string;
}

export const Section: React.FC<SectionProps> = ({ 
  children, 
  className,
  background = 'white',
  id
}) => {
  const backgrounds = {
    white: 'bg-white',
    peach: 'bg-peach-light',
    gradient: 'bg-gradient-to-r from-coral to-coral-light',
  };
  
  return (
    <section 
      id={id}
      className={cn(
        'py-20 lg:py-24',
        backgrounds[background],
        className
      )}
    >
      <div className="container mx-auto px-6 md:px-10 lg:px-20 max-w-[1440px]">
        {children}
      </div>
    </section>
  );
};
