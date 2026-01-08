'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { Button } from './ui/Button';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Home', href: '/' },
  { label: 'Properties', href: '/properties' },
  { label: 'Services', href: '/services' },
  { label: 'About', href: '/about' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contact', href: '/contact' },
];

export const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currency, setCurrency] = useState('INR');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
        isScrolled
          ? 'bg-white shadow-md'
          : 'bg-transparent backdrop-blur-sm'
      )}
    >
      <div className="container mx-auto px-6 md:px-10 lg:px-20 max-w-[1440px]">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 z-10">
            <img 
              src="/logo.png" 
              alt="H Co Housy Ventures" 
              className="h-12 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative hover:text-coral transition-colors font-medium group",
                  isScrolled ? "text-charcoal" : "text-white drop-shadow-md"
                )}
              >
                {item.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-coral transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
          </nav>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* Currency Selector */}
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className={cn(
                "hidden md:block px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-coral text-sm transition-all",
                isScrolled 
                  ? "border border-gray-300 bg-white text-charcoal" 
                  : "border border-white/30 bg-white/10 backdrop-blur-md text-white"
              )}
              aria-label="Select currency"
            >
              <option value="INR" className="text-charcoal">₹ INR</option>
              <option value="USD" className="text-charcoal">$ USD</option>
              <option value="EUR" className="text-charcoal">€ EUR</option>
            </select>

            {/* Login Button */}
            <Button
              size="sm"
              className="hidden md:inline-flex shadow-lg"
              onClick={() => console.log('Login clicked')}
            >
              Log In
            </Button>

            {/* Mobile Menu Button */}
            <button
              className={cn(
                "lg:hidden p-2 hover:text-coral transition-colors",
                isScrolled ? "text-charcoal" : "text-white"
              )}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-200">
          <nav className="container mx-auto px-6 py-4 flex flex-col space-y-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-charcoal hover:text-coral transition-colors font-medium py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="pt-4 border-t border-gray-200">
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coral mb-4"
                aria-label="Select currency"
              >
                <option value="INR">₹ INR</option>
                <option value="USD">$ USD</option>
                <option value="EUR">€ EUR</option>
              </select>
              <Button
                size="md"
                className="w-full"
                onClick={() => {
                  console.log('Login clicked');
                  setIsMobileMenuOpen(false);
                }}
              >
                Log In
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};
