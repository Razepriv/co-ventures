'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Facebook, Twitter, Linkedin, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

const quickLinks = [
  { label: 'Home', href: '/' },
  { label: 'About Us', href: '/about' },
  { label: 'Properties', href: '/properties' },
  { label: 'Services', href: '/services' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contact', href: '/contact' },
];

const resources = [
  { label: 'How It Works', href: '/how-it-works' },
  { label: 'FAQs', href: '/faqs' },
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms & Conditions', href: '/terms' },
  { label: 'Refund Policy', href: '/refund' },
  { label: 'Careers', href: '/careers' },
];

const socialLinks = [
  { icon: Facebook, href: 'https://facebook.com', label: 'Facebook' },
  { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
  { icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
  { icon: Instagram, href: 'https://instagram.com', label: 'Instagram' },
  { icon: Youtube, href: 'https://youtube.com', label: 'YouTube' },
];

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setNewsletterStatus('error');
      return;
    }

    // Simulate API call
    setNewsletterStatus('success');
    setEmail('');
    
    setTimeout(() => {
      setNewsletterStatus('idle');
    }, 3000);
  };

  return (
    <footer className="bg-charcoal-dark text-white">
      <div className="container mx-auto px-6 md:px-10 lg:px-20 max-w-[1440px] py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand Column */}
          <div>
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <div className="w-9 h-9 bg-coral rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">CH</span>
              </div>
              <span className="font-bold text-lg text-white">
                Co Housing Ventures
              </span>
            </Link>
            
            <p className="text-gray-400 text-sm leading-relaxed mb-6 max-w-[280px]">
              Making premium real estate accessible through collaborative co-ownership
            </p>

            <div className="flex gap-3">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 border border-gray-700 rounded-full flex items-center justify-center hover:bg-coral hover:border-coral transition-all"
                    aria-label={social.label}
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-base font-semibold mb-5">Quick Links</h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-coral transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-base font-semibold mb-5">Resources</h3>
            <ul className="space-y-3">
              {resources.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-coral transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-base font-semibold mb-5">Contact</h3>
            <ul className="space-y-4 mb-6">
              <li>
                <a
                  href="mailto:hello@cohousingventures.com"
                  className="text-sm text-gray-400 hover:text-coral transition-colors flex items-start gap-2"
                >
                  <Mail className="w-4 h-4 text-coral flex-shrink-0 mt-0.5" />
                  hello@cohousingventures.com
                </a>
              </li>
              <li>
                <a
                  href="tel:+919876543210"
                  className="text-sm text-gray-400 hover:text-coral transition-colors flex items-start gap-2"
                >
                  <Phone className="w-4 h-4 text-coral flex-shrink-0 mt-0.5" />
                  +91 98765 43210
                </a>
              </li>
              <li className="text-sm text-gray-400 flex items-start gap-2">
                <MapPin className="w-4 h-4 text-coral flex-shrink-0 mt-0.5" />
                123 Business Park, Koramangala, Bangalore - 560095
              </li>
            </ul>

            {/* Newsletter */}
            <h4 className="text-base font-semibold mb-3">Newsletter</h4>
            <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email"
                className="flex-1 px-3 py-2 bg-charcoal border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-coral transition-colors"
                required
              />
              <button
                type="submit"
                className="px-4 py-2 bg-coral hover:bg-coral-dark text-white rounded-lg transition-colors"
                aria-label="Subscribe to newsletter"
              >
                →
              </button>
            </form>
            {newsletterStatus === 'success' && (
              <p className="text-xs text-green-400 mt-2">Thanks for subscribing!</p>
            )}
            {newsletterStatus === 'error' && (
              <p className="text-xs text-red-400 mt-2">Please enter a valid email</p>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500">
              © 2026 Co Housing Ventures. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link href="/privacy" className="text-sm text-gray-500 hover:text-coral transition-colors">
                Privacy Policy
              </Link>
              <span className="text-gray-700">|</span>
              <Link href="/terms" className="text-sm text-gray-500 hover:text-coral transition-colors">
                Terms of Service
              </Link>
              <span className="text-gray-700">|</span>
              <Link href="/cookies" className="text-sm text-gray-500 hover:text-coral transition-colors">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
