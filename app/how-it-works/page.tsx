'use client'

import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ArrowRight, CheckCircle2 } from 'lucide-react'

// ─────────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────────

export default function HowItWorksPage() {
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
              src="https://images.unsplash.com/photo-1434626881859-194d67b2b86f?w=1920&q=80"
              alt="How It Works"
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
                How it works
              </h1>
              <p className="text-lg md:text-xl text-white/90 leading-relaxed mb-8 max-w-2xl">
                A disciplined, investor-friendly process built to reduce uncertainty and improve decision quality—without hype.
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
              <p className="text-sm text-white/70 tracking-wide">
                Capital-first • Diligence-led • Plain-English clarity
              </p>
            </motion.div>
          </div>
        </section>

        {/* ───────────────────────────────────────────────────────────────────
            OVERVIEW
        ─────────────────────────────────────────────────────────────────── */}
        <section className="py-16 md:py-20 bg-peach-light">
          <div className="max-w-6xl mx-auto px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-4xl mx-auto text-center"
            >
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-charcoal mb-6">
                A simple process that stays disciplined
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                Real estate decisions get messy when assumptions aren&apos;t written down and timelines aren&apos;t clear. Co-ventures follows a structured workflow: screen → validate → underwrite → document → communicate—so every step stays predictable.
              </p>
            </motion.div>
          </div>
        </section>

        {/* ───────────────────────────────────────────────────────────────────
            STEPS
        ─────────────────────────────────────────────────────────────────── */}
        <section className="py-16 md:py-20 bg-white">
          <div className="max-w-6xl mx-auto px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-12 text-center"
            >
              <div className="w-12 h-1 bg-coral mx-auto mb-6"></div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-charcoal mb-4">
                The Co-ventures workflow
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Six steps designed to keep decisions clean and execution controlled.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  step: '01',
                  title: 'Discovery',
                  description: 'We understand your goals, ticket size, preferred markets, and time horizon—so we can filter opportunities that actually fit.',
                },
                {
                  step: '02',
                  title: 'Shortlist',
                  description: 'We share curated opportunities aligned to your thesis, and clearly explain why each one made the cut.',
                },
                {
                  step: '03',
                  title: 'Validate',
                  description: 'We review micro-market signals, comps, absorption reality, and practical risk flags—so the story matches the ground truth.',
                },
                {
                  step: '04',
                  title: 'Underwrite',
                  description: 'We map base and downside scenarios, identify return drivers, and stress-test assumptions so tradeoffs are visible early.',
                },
                {
                  step: '05',
                  title: 'Document',
                  description: 'We guide documentation readiness, checklists, and timelines so closing workflows stay clean and predictable.',
                },
                {
                  step: '06',
                  title: 'Track & Review',
                  description: 'You receive milestone updates and decision-point clarity—so you always know what changed, why it matters, and what happens next.',
                },
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="relative"
                >
                  <div className="bg-white rounded-2xl p-6 shadow-soft hover:shadow-medium transition-all duration-300 h-full border border-gray-100">
                    {/* Illustration box */}
                    <div className="relative mb-6 h-32 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl flex items-center justify-center">
                      {/* Step number badge */}
                      <div className="absolute -top-3 -right-3 w-10 h-10 bg-coral rounded-full flex items-center justify-center shadow-lg">
                        <span className="text-white font-bold text-base">{item.step}</span>
                      </div>
                      
                      {/* Simple illustration patterns */}
                      {idx === 0 && (
                        <div className="space-y-2">
                          <div className="w-24 h-2 bg-coral/30 rounded"></div>
                          <div className="w-16 h-2 bg-peach rounded"></div>
                          <div className="w-20 h-2 bg-coral/30 rounded"></div>
                        </div>
                      )}
                      {idx === 1 && (
                        <div className="flex gap-2">
                          <div className="w-8 h-12 bg-coral rounded"></div>
                          <div className="w-8 h-16 bg-peach rounded"></div>
                          <div className="w-8 h-10 bg-coral-light rounded"></div>
                        </div>
                      )}
                      {idx === 2 && (
                        <div className="space-y-2">
                          <div className="w-20 h-14 bg-white rounded-lg border-2 border-gray-200 p-2">
                            <div className="w-full h-1.5 bg-gray-300 rounded mb-1"></div>
                            <div className="w-3/4 h-1.5 bg-coral/40 rounded mb-1"></div>
                            <div className="w-full h-1.5 bg-gray-300 rounded"></div>
                          </div>
                        </div>
                      )}
                      {idx === 3 && (
                        <div className="grid grid-cols-2 gap-2">
                          <div className="w-10 h-10 bg-green-400 rounded-lg"></div>
                          <div className="w-10 h-10 bg-peach rounded-lg"></div>
                          <div className="w-10 h-10 bg-coral rounded-lg"></div>
                          <div className="w-10 h-10 bg-blue-400 rounded-lg"></div>
                        </div>
                      )}
                      {idx === 4 && (
                        <div className="space-y-1">
                          <div className="flex gap-1">
                            <div className="w-3 h-3 bg-coral rounded-full"></div>
                            <div className="w-3 h-3 bg-peach rounded-full"></div>
                            <div className="w-3 h-3 bg-coral-light rounded-full"></div>
                          </div>
                          <div className="w-24 h-8 bg-white rounded border-2 border-coral/30"></div>
                        </div>
                      )}
                      {idx === 5 && (
                        <div className="flex items-end gap-1.5">
                          <div className="w-4 h-8 bg-peach rounded-t"></div>
                          <div className="w-4 h-12 bg-coral rounded-t"></div>
                          <div className="w-4 h-14 bg-blue-400 rounded-t"></div>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <h3 className="font-bold text-charcoal mb-2 text-lg">{item.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ───────────────────────────────────────────────────────────────────
            WHAT YOU RECEIVE
        ─────────────────────────────────────────────────────────────────── */}
        <section className="py-16 md:py-20 bg-peach-light">
          <div className="max-w-6xl mx-auto px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-12"
            >
              <p className="text-coral text-xs font-semibold tracking-widest uppercase mb-4">
                DELIVERABLES
              </p>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-charcoal mb-4">
                What you receive
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl">
                Clear outputs designed to make decisions easier—without drowning you in paperwork.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  title: 'Deal Snapshot (1-page)',
                  description: 'Thesis, location context, demand drivers, and key risks—at a glance.',
                },
                {
                  title: 'Diligence Highlights',
                  description: 'Comps, absorption notes, verification checklist, and practical risk flags.',
                },
                {
                  title: 'Underwriting Summary',
                  description: 'Assumptions, base vs downside scenarios, and sensitivity takeaways.',
                },
                {
                  title: 'Documentation Checklist',
                  description: "What's needed, timelines, responsibilities, and closing readiness.",
                },
                {
                  title: 'Milestone Updates',
                  description: 'A structured cadence so you always know what changed and what it means.',
                },
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex gap-4 p-6 rounded-xl bg-white border border-gray-200 hover:border-coral-light hover:shadow-soft transition-all duration-300"
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-coral flex items-center justify-center text-sm font-bold text-white">
                    {idx + 1}
                  </div>
                  <div>
                    <h3 className="font-semibold text-charcoal mb-1">{item.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ───────────────────────────────────────────────────────────────────
            WHO THIS IS FOR
        ─────────────────────────────────────────────────────────────────── */}
        <section className="py-16 md:py-20 bg-white">
          <div className="max-w-6xl mx-auto px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-12"
            >
              <p className="text-coral text-xs font-semibold tracking-widest uppercase mb-4">
                WHO THIS IS FOR
              </p>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-charcoal mb-4">
                Who this is for
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl">
                Co-ventures works best for investors who value clarity over hype.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-3xl mx-auto"
            >
              <Card className="bg-white border border-gray-200 rounded-2xl shadow-soft">
                <CardContent className="p-8">
                  <ul className="space-y-4">
                    {[
                      'You want structured evaluation, not sales narratives',
                      'You prefer conservative assumptions and written-down tradeoffs',
                      'You want clean workflows and predictable communication',
                      "You're exploring India's growth corridors with a long-term lens",
                    ].map((bullet, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-base text-gray-700">
                        <CheckCircle2 className="w-6 h-6 text-coral flex-shrink-0 mt-0.5" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* ───────────────────────────────────────────────────────────────────
            FAQ TEASER
        ─────────────────────────────────────────────────────────────────── */}
        <section className="py-16 md:py-20 bg-peach-light">
          <div className="max-w-6xl mx-auto px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-12"
            >
              <p className="text-coral text-xs font-semibold tracking-widest uppercase mb-4">
                FREQUENTLY ASKED QUESTIONS
              </p>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-charcoal mb-4">
                Common questions
              </h2>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-3xl mx-auto bg-white rounded-2xl shadow-soft p-6 md:p-8"
            >
              <Accordion type="single" collapsible className="w-full">
                {[
                  {
                    q: 'Do you guarantee returns?',
                    a: 'No. Real estate investing involves risk. Our role is to improve decision quality through disciplined evaluation and clearer execution workflows.',
                  },
                  {
                    q: 'Can you help if I already have a deal?',
                    a: 'Yes. We can support diligence and underwriting so you can stress-test assumptions before proceeding.',
                  },
                  {
                    q: 'What do I need to get started?',
                    a: 'A short call to understand your goals and preferences. From there, we share opportunities and diligence highlights aligned to your fit.',
                  },
                ].map((faq, idx) => (
                  <AccordionItem key={idx} value={`faq-${idx}`}>
                    <AccordionTrigger className="text-left text-charcoal font-semibold hover:text-coral">
                      {faq.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-600 leading-relaxed">
                      {faq.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-10 text-center"
            >
              <Link href="/faqs">
                <Button variant="outline" className="border-2 border-coral text-coral hover:bg-coral hover:text-white">
                  View all FAQs
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
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
                Want to walk through your goals together?
              </h2>
              <p className="text-lg md:text-xl text-white/90 mb-10 max-w-2xl mx-auto">
                Schedule a short call. We&apos;ll align on your horizon, preferred markets, and what a disciplined evaluation looks like for you.
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

