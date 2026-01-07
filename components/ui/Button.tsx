import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-coral focus:ring-offset-2';
    
    const variants = {
      primary: 'bg-coral text-white hover:bg-coral-dark hover:-translate-y-0.5 hover:shadow-medium',
      secondary: 'bg-white text-coral border-2 border-coral hover:bg-peach-light',
      outline: 'bg-transparent text-charcoal border-2 border-charcoal hover:bg-charcoal hover:text-white',
      ghost: 'bg-transparent text-coral hover:bg-peach-light',
    };
    
    const sizes = {
      sm: 'text-sm px-4 py-2 h-10',
      md: 'text-base px-6 py-3 h-12',
      lg: 'text-lg px-10 py-4 h-14',
    };
    
    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
