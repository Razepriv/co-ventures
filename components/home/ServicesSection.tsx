'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { Section } from '../ui/Section';
import { motion } from 'framer-motion';

const services = [
  {
    title: 'Opportunity Sourcing & Screening',
    image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&q=80',
  },
  {
    title: 'Underwriting & Scenario Modeling',
    image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&q=80',
  },
  {
    title: 'Legal & Documentation Support',
    image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=600&q=80',
  },
  {
    title: 'On-Ground Due Diligence',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&q=80',
  },
  {
    title: 'Portfolio Support & Reporting',
    image: 'https://images.unsplash.com/photo-1551135049-8a33b5883817?w=600&q=80',
  },
];

export const ServicesSection: React.FC = () => {
  return (
    <Section background="white" className="py-24 lg:py-32">
      <div className="max-w-7xl mx-auto">
        {/* Header - Two Column Layout */}
        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          {/* Left - Heading */}
          <div>
            <motion.p
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-coral text-xs font-semibold tracking-widest uppercase mb-4"
            >
              / Services We Offer
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-charcoal leading-tight"
            >
              Certified<br />Excellence
            </motion.h2>
          </div>

          {/* Right - Description and CTAs */}
          <div className="flex flex-col justify-end">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-gray-600 text-lg leading-relaxed mb-6"
            >
              From sourcing opportunities and installations to preventative underwriting, we&apos;ve got you covered. Choose reliability, choose Co-ventures.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap gap-6"
            >
              <Link
                href="/services"
                className="text-coral font-semibold hover:text-coral/80 transition-colors flex items-center gap-1"
              >
                View All Services <ArrowUpRight className="w-4 h-4" />
              </Link>
              <Link
                href="/contact"
                className="text-coral font-semibold hover:text-coral/80 transition-colors flex items-center gap-1"
              >
                Get In Touch <ArrowUpRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Horizontal Scrolling Cards */}
        <div className="relative -mx-4 px-4 lg:-mx-8 lg:px-8">
          <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
            {services.map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex-shrink-0 w-[280px] md:w-[320px] snap-start group cursor-pointer"
              >
                <div className="relative rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 h-[380px]">
                  {/* Image */}
                  <Image
                    src={service.image}
                    alt={service.title}
                    width={320}
                    height={380}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  
                  {/* Overlay Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                  
                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="text-white font-bold text-lg mb-3 leading-tight">
                      {service.title}
                    </h3>
                    
                    {/* Arrow Button */}
                    <div className="w-10 h-10 bg-amber-400 rounded-full flex items-center justify-center group-hover:bg-coral transition-colors duration-300">
                      <ArrowUpRight className="w-5 h-5 text-charcoal" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Custom scrollbar hide */}
      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </Section>
  );
};
