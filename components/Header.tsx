'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Bell } from 'lucide-react';
import { Button } from './ui/Button';
import { cn } from '@/lib/utils';
import NotificationPopup from './notifications/NotificationPopup';
import { createClient } from '@/lib/supabase/client';
import { useCurrency } from '@/lib/contexts/CurrencyContext';

const navItems = [
  { label: 'Home', href: '/' },
  { label: 'Properties', href: '/properties' },
  { label: 'Services', href: '/services' },
  { label: 'About', href: '/about' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contact', href: '/contact' },
] as const;

export const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { currency, setCurrency, currencySymbols } = useCurrency();
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const pathname = usePathname();
  const supabase = createClient();

  // Memoized scroll handler with throttle
  const handleScroll = useCallback(() => {
    setIsScrolled(window.scrollY > 50);
  }, []);

  useEffect(() => {
    // Throttle scroll events for better performance
    let ticking = false;
    const throttledScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', throttledScroll, { passive: true });
    return () => window.removeEventListener('scroll', throttledScroll);
  }, [handleScroll]);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
        setShowNotifications(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const handleLoginClick = useCallback(() => {
    window.location.href = '/auth/login';
  }, []);

  const handleUserLoginClick = useCallback(() => {
    window.location.href = '/auth/phone-login';
  }, []);

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(prev => !prev);
  }, []);

  // Fetch unread notification count
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const { count, error } = await supabase
          .from('notifications')
          .select('*', { count: 'exact', head: true })
          .eq('is_read', false);

        if (error) throw error;
        setUnreadCount(count || 0);
      } catch (error) {
        console.error('Error fetching unread count:', error);
      }
    };

    fetchUnreadCount();

    // Real-time subscription for new notifications
    const channel = supabase
      .channel('unread_notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications'
        },
        () => {
          fetchUnreadCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  // Memoize active link check
  const isActiveLink = useCallback((href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  }, [pathname]);

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          isScrolled
            ? 'bg-white shadow-md'
            : 'bg-white/95 backdrop-blur-md shadow-sm'
        )}
      >
        <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12 max-w-7xl">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link 
              href="/" 
              className="flex items-center space-x-2 z-10 flex-shrink-0"
              aria-label="Co Housing Ventures Home"
            >
              <img 
                src="/logo.svg" 
                alt="Co Housing Ventures" 
                className="h-12 md:h-14 lg:h-16 w-auto"
                width={150}
                height={64}
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1 xl:space-x-2" role="navigation">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative px-3 xl:px-4 py-2 rounded-lg transition-all duration-200 font-medium text-sm xl:text-base group",
                    isActiveLink(item.href)
                      ? "text-coral"
                      : "text-charcoal hover:text-coral hover:bg-coral/5"
                  )}
                  aria-current={isActiveLink(item.href) ? 'page' : undefined}
                >
                  {item.label}
                  {isActiveLink(item.href) && (
                    <span className="absolute bottom-1 left-3 right-3 h-0.5 bg-coral" />
                  )}
                </Link>
              ))}
            </nav>

            {/* Right Section */}
            <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4">
              {/* Notification Bell */}
              <button
                onClick={() => setShowNotifications(true)}
                className="relative p-2 rounded-lg hover:bg-coral/10 transition-all text-charcoal"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Currency Selector */}
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as 'INR' | 'USD' | 'EUR' | 'GBP')}
                className={cn(
                  "hidden sm:block px-2 md:px-3 py-1.5 md:py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-coral text-xs md:text-sm transition-all cursor-pointer border border-gray-300 bg-white text-charcoal hover:border-coral"
                )}
                aria-label="Select currency"
              >
                <option value="INR" className="text-charcoal">₹ INR</option>
                <option value="USD" className="text-charcoal">$ USD</option>
                <option value="EUR" className="text-charcoal">€ EUR</option>
                <option value="GBP" className="text-charcoal">£ GBP</option>
              </select>

              {/* User Login Button */}
              <Button
                size="sm"
                variant="outline"
                className="hidden md:inline-flex"
                onClick={handleUserLoginClick}
              >
                User Login
              </Button>

              {/* Admin Login Button */}
              <Button
                size="sm"
                className="hidden md:inline-flex shadow-lg hover:shadow-xl transition-shadow"
                onClick={handleLoginClick}
              >
                Admin
              </Button>

              {/* Mobile Menu Button */}
              <button
                className={cn(
                  "lg:hidden p-2 rounded-lg hover:bg-coral/10 transition-all text-charcoal"
                )}
                onClick={toggleMobileMenu}
                aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={isMobileMenuOpen}
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <div
        className={cn(
          "fixed inset-0 z-40 lg:hidden transition-opacity duration-300",
          isMobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
      >
        {/* Backdrop */}
        <div 
          className={cn(
            "absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300",
            isMobileMenuOpen ? "opacity-100" : "opacity-0"
          )}
          onClick={toggleMobileMenu}
          aria-hidden="true"
        />

        {/* Menu Panel */}
        <div
          className={cn(
            "absolute right-0 top-16 md:top-20 bottom-0 w-full sm:w-80 bg-white shadow-2xl transform transition-transform duration-300 ease-out overflow-y-auto",
            isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
          )}
        >
          <nav className="px-4 sm:px-6 py-6 flex flex-col" role="navigation">
            <div className="space-y-1 mb-6">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "block px-4 py-3 rounded-lg transition-all font-medium",
                    isActiveLink(item.href)
                      ? "bg-coral text-white"
                      : "text-charcoal hover:bg-coral/5 hover:text-coral"
                  )}
                  onClick={toggleMobileMenu}
                  aria-current={isActiveLink(item.href) ? 'page' : undefined}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="pt-6 border-t border-gray-200 space-y-4">
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as 'INR' | 'USD' | 'EUR' | 'GBP')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coral text-sm cursor-pointer hover:border-coral transition-colors"
                aria-label="Select currency"
              >
                <option value="INR">₹ INR</option>
                <option value="USD">$ USD</option>
                <option value="EUR">€ EUR</option>
                <option value="GBP">£ GBP</option>
              </select>
              <Button
                size="md"
                variant="outline"
                className="w-full"
                onClick={() => {
                  handleUserLoginClick();
                  toggleMobileMenu();
                }}
              >
                User Login
              </Button>
              <Button
                size="md"
                className="w-full shadow-lg hover:shadow-xl transition-shadow"
                onClick={() => {
                  handleLoginClick();
                  toggleMobileMenu();
                }}
              >
                Admin Login
              </Button>
            </div>
          </nav>
        </div>
      </div>

      {/* Notification Popup */}
      <NotificationPopup 
        isOpen={showNotifications} 
        onClose={() => setShowNotifications(false)} 
      />
    </>
  );
};
