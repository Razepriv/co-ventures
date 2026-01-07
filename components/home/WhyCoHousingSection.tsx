'use client';

import React from 'react';
import { Home, Users2, Users, ShieldCheck } from 'lucide-react';
import { Section } from '../ui/Section';
import { Card } from '../ui/Card';
import { motion } from 'framer-motion';

const benefits = [
  {
    icon: Home,
    title: 'Affordable Premium Living',
    description: 'Access luxury properties at a fraction of the cost through shared ownership model',
  },
  {
    icon: Users2,
    title: 'Shared Investment, Shared Returns',
    description: 'Lower financial risk with collective ownership while enjoying proportional returns',
  },
  {
    icon: Users,
    title: 'Community Living',
    description: 'Build lasting relationships with like-minded families in thoughtfully designed spaces',
  },
  {
    icon: ShieldCheck,
    title: 'Expert Guidance',
    description: 'End-to-end support from our real estate specialists through every step of your journey',
  },
];

export const WhyCoHousingSection: React.FC = () => {
  return (
    <Section background="peach" className="py-24 lg:py-32">
      <div className="text-center mb-16">
        <motion.p
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-coral text-xs font-semibold tracking-widest uppercase mb-4"
        >
          THE FUTURE OF HOME OWNERSHIP
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-3xl md:text-4xl lg:text-5xl font-bold text-charcoal"
        >
          Why Choose Co-Housing?
        </motion.h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {benefits.map((benefit, index) => {
          const Icon = benefit.icon;
          return (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card hover className="p-8 h-full text-center">
                <div className="w-16 h-16 bg-coral rounded-full flex items-center justify-center mx-auto mb-6">
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-charcoal mb-4">
                  {benefit.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {benefit.description}
                </p>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </Section>
  );
};
