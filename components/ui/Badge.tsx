import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'coral' | 'green' | 'gray' | 'peach';
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'coral' }) => {
  const variants = {
    coral: 'bg-coral text-white',
    green: 'bg-green-500 text-white',
    gray: 'bg-gray-500 text-white',
    peach: 'bg-peach-light text-coral',
  };
  
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${variants[variant]}`}>
      {children}
    </span>
  );
};
