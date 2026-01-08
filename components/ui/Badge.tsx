import React from 'react';
import { cn } from '@/lib/utils/cn';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'coral' | 'green' | 'gray' | 'peach' | 'outline';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'coral', className }) => {
  const variants = {
    coral: 'bg-coral text-white',
    green: 'bg-green-500 text-white',
    gray: 'bg-gray-500 text-white',
    peach: 'bg-peach-light text-coral',
    outline: 'border border-gray-300 bg-white text-gray-700',
  };
  
  return (
    <span className={cn('inline-flex items-center px-3 py-1 rounded-full text-xs font-medium', variants[variant], className)}>
      {children}
    </span>
  );
};

