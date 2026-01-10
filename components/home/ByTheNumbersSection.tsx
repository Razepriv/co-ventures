'use client';

import React from 'react';

// Simple line-art SVGs to echo the reference design
const VennCircles = () => (
  <svg viewBox="0 0 120 120" className="w-24 h-24 text-charcoal/30">
    <circle cx="50" cy="60" r="28" stroke="currentColor" fill="none" strokeWidth="2" />
    <circle cx="70" cy="60" r="28" stroke="currentColor" fill="none" strokeWidth="2" />
  </svg>
);

const OrbitArrows = () => (
  <svg viewBox="0 0 120 120" className="w-24 h-24 text-charcoal/30">
    <circle cx="60" cy="60" r="30" stroke="currentColor" fill="none" strokeWidth="2" strokeDasharray="6 6" />
    <path d="M60 20 l6 -6 M60 20 l-6 -6" stroke="currentColor" strokeWidth="2" />
    <path d="M60 100 l6 6 M60 100 l-6 6" stroke="currentColor" strokeWidth="2" />
  </svg>
);

const SplitCircle = () => (
  <svg viewBox="0 0 120 120" className="w-24 h-24 text-charcoal/30">
    <circle cx="60" cy="60" r="28" stroke="currentColor" fill="none" strokeWidth="2" />
    <line x1="60" y1="32" x2="60" y2="88" stroke="currentColor" strokeWidth="2" />
  </svg>
);

type MetricCardProps = {
  eyebrow?: string;
  value?: string;
  suffix?: string;
  description?: string;
  rightIllustration?: React.ReactNode;
  className?: string;
};

const MetricCard: React.FC<MetricCardProps> = ({ eyebrow, value, suffix, description, rightIllustration, className }) => (
  <div className={`bg-white border border-gray-200 rounded-xl p-8 flex items-center justify-between ${className || ''}`}>
    <div>
      {eyebrow && <div className="text-[11px] uppercase tracking-wide text-gray-500 mb-4">{eyebrow}</div>}
      {value && (
        <div className="text-5xl md:text-6xl font-bold text-charcoal">
          {value}
          {suffix && <span className="text-coral">{suffix}</span>}
        </div>
      )}
      {description && (
        <p className="mt-4 text-gray-600 max-w-md">{description}</p>
      )}
    </div>
    {rightIllustration && (
      <div className="ml-8 hidden md:block">{rightIllustration}</div>
    )}
  </div>
);

export const ByTheNumbersSection: React.FC = () => {
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-6 md:px-10 lg:px-20 max-w-[1440px]">
        {/* Heading */}
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-charcoal text-center leading-tight max-w-4xl mx-auto">
          Scale Backed by Experience and a
          <br />
          Proven Record of Sustainable Growth
        </h2>

        {/* Grid */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Top row */}
          <MetricCard
            eyebrow="Leadership Experience"
            value="25"
            suffix="+"
            className=""
          />
          <div className="bg-white border border-gray-200 rounded-xl p-8">
            <p className="text-gray-600">
              With over 25 years of combined leadership experience, our team brings strategic insight and
              proven expertise to guide every decision and create lasting value.
            </p>
          </div>
          <MetricCard rightIllustration={<VennCircles />} />

          {/* Middle wide card */}
          <MetricCard
            eyebrow="Capital Deployed"
            value="$3.5B"
            suffix="+"
            description="We have deployed over $3.5 billion in capital across diverse industries, backing strong businesses and creating long‑term value through disciplined investment and strategic growth."
            className="md:col-span-3"
          />

          {/* Bottom row */}
          <MetricCard rightIllustration={<OrbitArrows />} />
          <MetricCard
            eyebrow="Portfolio Companies"
            value="40"
            suffix="+"
          />
          <MetricCard rightIllustration={<SplitCircle />} />
        </div>
      </div>
    </section>
  );
};
