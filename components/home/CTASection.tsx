'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Calendar } from 'lucide-react';
import { Section } from '../ui/Section';
import { motion } from 'framer-motion';

export const CTASection: React.FC = () => {
  return (
    <Section background="white" className="py-24 lg:py-32">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-coral via-coral to-coral-light p-12 md:p-16 lg:p-20"
        >
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
          
          {/* Content */}
          <div className="relative z-10 text-center max-w-3xl mx-auto">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight"
            >
              Ready to Explore India&apos;s<br />
              Next Growth Markets?
            </motion.h2>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-lg md:text-xl text-white/95 mb-10 leading-relaxed"
            >
              Tell us your goals and preferences - we&apos;ll share opportunities aligned with your risk profile and investment horizon.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Link
                href="/properties"
                className="group bg-white text-coral px-8 py-4 rounded-xl font-semibold hover:bg-peach-light transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                Explore Opportunities
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <Link
                href="/contact"
                className="group border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/10 transition-all duration-300 flex items-center gap-2"
              >
                <Calendar className="w-5 h-5" />
                Schedule a Call
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </Section>
  );
};
