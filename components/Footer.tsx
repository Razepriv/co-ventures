'use client';

import React from 'react';
import Link from 'next/link';
import { Mail, Phone, MapPin } from 'lucide-react';

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



export const Footer: React.FC = () => {

  return (
    <footer className="bg-charcoal-dark text-white">
      <div className="container mx-auto px-6 md:px-10 lg:px-20 max-w-[1440px] py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand Column */}
          <div>
            <Link href="/" className="flex items-center mb-6">
              <img 
                src="/logo.svg" 
                alt="Co-ventures" 
                className="h-10 w-auto"
              />
            </Link>
            
            <p className="text-gray-400 text-sm leading-relaxed mb-6 max-w-[280px]">
              Making premium real estate accessible through collaborative co-ownership
            </p>
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
            <ul className="space-y-4">
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
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500">
              © 2026 Co-ventures. All rights reserved.
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
