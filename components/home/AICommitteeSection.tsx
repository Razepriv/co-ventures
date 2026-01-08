'use client';

import React, { useState } from 'react';
import { Brain, BarChart3, FileCheck, Building2, Scale, Target } from 'lucide-react';
import { Section } from '../ui/Section';
import { RadialOrbitalTimeline, TimelineItem } from './RadialOrbitalTimeline';
import { motion } from 'framer-motion';

// AI Committee dataset
const aiCommitteeData: TimelineItem[] = [
  {
    id: 1,
    title: 'Market Pulse',
    date: 'v2.4.1',
    content: 'Analyzes market dynamics, demand drivers, infrastructure developments, and comparable transactions to assess market positioning and timing.',
    category: 'Analysis',
    icon: BarChart3,
    relatedIds: [2, 6],
    status: 'completed',
    energy: 92,
  },
  {
    id: 2,
    title: 'Deal Underwriter',
    date: 'v2.3.8',
    content: 'Builds base and downside case models, calculates IRR, evaluates cashflow scenarios, and identifies key value drivers for investment decisions.',
    category: 'Financial',
    icon: FileCheck,
    relatedIds: [1, 3, 6],
    status: 'completed',
    energy: 88,
  },
  {
    id: 3,
    title: 'Developer & Delivery',
    date: 'v2.2.5',
    content: 'Reviews builder track record, past project delivery timelines, financial stability, and execution capabilities to assess completion risk.',
    category: 'Execution',
    icon: Building2,
    relatedIds: [2, 4, 6],
    status: 'completed',
    energy: 85,
  },
  {
    id: 4,
    title: 'Legal Sentinel',
    date: 'v2.1.9',
    content: 'Examines title clarity, RERA registration, development approvals, compliance status, and documentation completeness for legal safety.',
    category: 'Compliance',
    icon: Scale,
    relatedIds: [3, 5, 6],
    status: 'in-progress',
    energy: 78,
  },
  {
    id: 5,
    title: 'Exit Optimizer',
    date: 'v2.0.3',
    content: 'Evaluates exit scenarios, liquidity options, hold vs. sell decisions, and how the opportunity fits within a broader portfolio strategy.',
    category: 'Strategy',
    icon: Target,
    relatedIds: [4, 6],
    status: 'completed',
    energy: 90,
  },
  {
    id: 6,
    title: 'Committee Synthesizer',
    date: 'v3.0.0',
    content: 'Synthesizes all agent inputs, highlights contradictions, identifies key risks and opportunities, and provides a clear recommendation with next steps.',
    category: 'Synthesis',
    icon: Brain,
    relatedIds: [1, 2, 3, 4, 5],
    status: 'completed',
    energy: 95,
  },
];

export const AICommitteeSection: React.FC = () => {
  const [hasInteracted, setHasInteracted] = useState(false);

  const handleFirstInteraction = () => {
    if (!hasInteracted) {
      setHasInteracted(true);
      // Could trigger analytics or other side effects here
      console.log('First interaction with AI Committee orbital');
    }
  };

  return (
    <Section background="white" className="py-8 md:py-12 lg:py-16 overflow-hidden relative">
      {/* Grid Background Pattern */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(0, 0, 0, 0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0, 0, 0, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />
      
      {/* Header */}
      <div className="text-center mb-10 md:mb-14 max-w-3xl mx-auto px-4">
        {/* Eyebrow */}
        <motion.p
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-coral text-xs font-semibold tracking-widest uppercase mb-4"
        >
          TECH-ENABLED GOVERNANCE
        </motion.p>
        
        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-3xl md:text-4xl lg:text-5xl font-bold text-charcoal mb-6"
        >
          Meet our AI Investment Committee
        </motion.h2>
        
        {/* Body paragraph */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-lg text-gray-600 leading-relaxed"
        >
          We combine human expertise with an AI-assisted review process designed to stress-test each deal. 
          Five specialized &ldquo;agents&rdquo; review the opportunity from different angles—ensuring no stone is left unturned.
        </motion.p>
      </div>

      {/* Orbital Diagram */}
      <div className="relative">
        <RadialOrbitalTimeline 
          timelineData={aiCommitteeData}
          onFirstInteraction={handleFirstInteraction}
        />
        
        {/* Subtle instruction hint */}
        <div 
          className={`
            text-center mt-4 transition-opacity duration-500
            ${hasInteracted ? 'opacity-0' : 'opacity-100'}
          `}
        >
          <p className="text-xs text-charcoal/40 flex items-center justify-center gap-2">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-coral/50 animate-pulse" />
            Click any agent to explore
          </p>
        </div>
      </div>
    </Section>
  );
};
