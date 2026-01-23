'use client'

import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Button } from '@/components/ui/Button'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ArrowRight, MessageSquare } from 'lucide-react'

// ─────────────────────────────────────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────────────────────────────────────

const faqCategories = [
  {
    title: 'Getting started',
    items: [
      {
        q: 'What does Co-ventures do?',
        a: 'Co-ventures helps investors evaluate Indian real estate opportunities using a disciplined process—screening, research, underwriting, documentation support, and clear communication.',
      },
      {
        q: 'Who is this for?',
        a: 'Investors in India and globally (including NRIs) who want structured evaluation and plain-English clarity—without hype.',
      },
      {
        q: 'How do I get started?',
        a: 'Schedule a short call. We\'ll align on your goals, preferred markets, ticket size, and horizon—then share relevant opportunities and diligence highlights.',
      },
    ],
  },
  {
    title: 'Opportunities and evaluation',
    items: [
      {
        q: 'What types of opportunities do you focus on?',
        a: 'Opportunities tied to real demand in growth corridors and micro-markets, filtered by execution readiness and risk clarity.',
      },
      {
        q: 'How do you choose markets and micro-markets?',
        a: 'We look at fundamentals like job corridors, migration patterns, infrastructure upgrades, affordability bands, and absorption reality.',
      },
      {
        q: 'Do you provide underwriting and scenario analysis?',
        a: 'Yes. We summarize assumptions and run base and downside scenarios so the tradeoffs are visible before decisions are made.',
      },
      {
        q: 'Can you help if I already have a deal?',
        a: 'Yes. We can support diligence and underwriting so you can stress-test assumptions and surface blind spots before proceeding.',
      },
    ],
  },
  {
    title: 'Risk and compliance',
    items: [
      {
        q: 'Do you guarantee returns?',
        a: 'No. Real estate investing involves risk. Our role is to improve decision quality through disciplined evaluation and clearer execution workflows.',
      },
      {
        q: 'Is this an offer to invest?',
        a: 'No. This website is for informational purposes only and does not constitute an offer or solicitation. Any opportunity will be shared through the appropriate process and documentation.',
      },
      {
        q: 'What are the main risks in real estate investing?',
        a: 'Common risks include market cycles, execution delays, cost overruns, documentation issues, liquidity constraints, and changes in demand. We aim to surface and explain these risks early.',
      },
    ],
  },
  {
    title: 'Process and communication',
    items: [
      {
        q: 'What does your process look like?',
        a: 'We follow a structured workflow: discovery → shortlist → validate → underwrite → document → track and review.',
      },
      {
        q: 'How do you share updates?',
        a: 'We use structured milestone updates and decision-point alerts written in plain English—so you always know what changed and what it means.',
      },
      {
        q: 'How long does evaluation typically take?',
        a: 'It depends on the opportunity and the availability of documents and on-ground verification. We\'ll set expectations clearly upfront and share decision timelines early.',
      },
    ],
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────────

export default function FAQsPage() {
  return (
    <>
      <Header />
      <main className="pt-20">
        {/* ───────────────────────────────────────────────────────────────────
            HERO
        ─────────────────────────────────────────────────────────────────── */}
        <section className="relative h-[60vh] min-h-[400px] flex items-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <Image
              src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1920&q=80"
              alt="FAQs"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-black/60" />
          </div>

          <div className="max-w-6xl mx-auto px-4 md:px-6 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl"
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-6 drop-shadow-2xl">
                FAQs
              </h1>
              <p className="text-lg md:text-xl text-white/90 leading-relaxed mb-8 max-w-2xl">
                Straight answers to common questions—so you can evaluate opportunities with clarity.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link href="/contact">
                  <Button size="lg" className="shadow-lg hover:shadow-xl">
                    Schedule a Call
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/properties">
                  <Button size="lg" variant="outline" className="bg-white/10 backdrop-blur-md border-2 border-white text-white hover:bg-white hover:text-coral">
                    Explore Opportunities
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ───────────────────────────────────────────────────────────────────
            FAQ CATEGORIES
        ─────────────────────────────────────────────────────────────────── */}
        {faqCategories.map((category, categoryIndex) => (
          <section
            key={categoryIndex}
            className={`py-16 md:py-20 ${
              categoryIndex % 2 === 0 ? 'bg-peach-light' : 'bg-white'
            }`}
          >
            <div className="max-w-6xl mx-auto px-4 md:px-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mb-12"
              >
                <p className="text-coral text-xs font-semibold tracking-widest uppercase mb-4">
                  {category.title}
                </p>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-charcoal mb-8">
                  {category.title}
                </h2>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="max-w-3xl mx-auto"
              >
                <div className="bg-white rounded-2xl shadow-soft p-6 md:p-8">
                  <Accordion type="single" collapsible className="w-full">
                    {category.items.map((faq, idx) => (
                      <AccordionItem
                        key={idx}
                        value={`${categoryIndex}-faq-${idx}`}
                      >
                        <AccordionTrigger className="text-left text-charcoal font-semibold hover:text-coral">
                          {faq.q}
                        </AccordionTrigger>
                        <AccordionContent className="text-gray-600 leading-relaxed">
                          {faq.a}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              </motion.div>
            </div>
          </section>
        ))}

        {/* ───────────────────────────────────────────────────────────────────
            STILL HAVE QUESTIONS CTA
        ─────────────────────────────────────────────────────────────────── */}
        <section className="py-16 md:py-20 bg-peach-light">
          <div className="max-w-6xl mx-auto px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-3xl mx-auto text-center"
            >
              <div className="bg-white rounded-2xl shadow-medium p-8 md:p-12 border border-gray-100">
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-charcoal mb-4">
                  Still have questions?
                </h2>
                <p className="text-lg text-gray-600 leading-relaxed mb-6">
                  If you want to talk through your goals or a specific
                  opportunity, schedule a short call with our team.
                </p>
                <Link href="/contact">
                  <Button
                    size="lg"
                    className="shadow-lg hover:shadow-xl"
                  >
                    Contact Us
                    <MessageSquare className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ───────────────────────────────────────────────────────────────────
            FINAL CTA + DISCLAIMER
        ─────────────────────────────────────────────────────────────────── */}
        <section className="py-20 md:py-24 bg-gradient-to-r from-coral to-coral-light">
          <div className="max-w-6xl mx-auto px-4 md:px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-6">
                Ready to evaluate an opportunity with Co-ventures?
              </h2>
              <p className="text-lg md:text-xl text-white/90 mb-10 max-w-2xl mx-auto">
                Share your goals and preferred horizon. We&apos;ll guide you through
                a clear, capital-first evaluation process.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <Link href="/contact">
                  <Button
                    size="lg"
                    variant="secondary"
                    className="bg-white text-coral hover:bg-peach-light border-0 shadow-xl"
                  >
                    Schedule a Call
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/properties">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-2 border-white text-white hover:bg-white/10"
                  >
                    Explore Opportunities
                  </Button>
                </Link>
              </div>
              <p className="text-sm text-white/80">
                Informational only. Investing involves risk. Not an offer or solicitation.
              </p>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

