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
import { motion } from 'framer-motion'
import {
  Search,
  BarChart3,
  Calculator,
  FileText,
  MapPin,
  MessageSquare,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react'

// ─────────────────────────────────────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────────────────────────────────────

const services = [
  {
    icon: Search,
    title: 'Opportunity Sourcing & Screening',
    description:
      'We curate opportunities aligned with real demand—growth corridors, micro-market strength, and execution readiness—so you start with higher-quality options.',
    bullets: [
      'Thesis-led screening based on demand fundamentals',
      'Micro-market filters: jobs, infra, affordability, absorption',
      'Comparable pricing context and positioning notes',
      'Supply pipeline checks and practical risk flags',
      'Shortlist rationale: why this makes the cut',
      'Clear categorization: proceed vs watchlist',
    ],
  },
  {
    icon: BarChart3,
    title: 'Market Research & Micro-Market Analysis',
    description:
      'We validate the narrative with reality: comps, absorption, affordability bands, and demand drivers—so decisions are grounded on the ground truth.',
    bullets: [
      'Comparable sales and pricing band assessment',
      'Rental demand and rent-band evaluation (where relevant)',
      'Absorption and inventory reality checks',
      'Infrastructure catalysts and timing notes',
      'Micro-location pros/cons and positioning summary',
      'Key assumptions documented in plain English',
    ],
  },
  {
    icon: Calculator,
    title: 'Underwriting & Scenario Modeling',
    description:
      'We build conservative base and downside scenarios, highlight return drivers, and stress-test risks—so tradeoffs are visible before you commit.',
    bullets: [
      'Base case and downside case assumptions',
      'Sensitivity checks on price, timing, and costs',
      'Drivers-of-return summary: what must go right',
      'Risk flags: what can break the thesis',
      'Entry/exit lens and timing scenarios',
      'Decision memo: proceed / revise / pass',
    ],
  },
  {
    icon: FileText,
    title: 'Legal & Documentation Support',
    description:
      'We help you navigate documentation, readiness checks, and closing workflows with clarity—so execution stays clean and predictable.',
    bullets: [
      'Documentation checklist and timeline',
      'Readiness checks and compliance flags (as applicable)',
      'Title/document risk flags surfaced early',
      'Plain-English summary of key terms and obligations',
      'Coordination support through closing steps',
      'Documentation hygiene guidance post-close',
    ],
  },
  {
    icon: MapPin,
    title: 'On-Ground Due Diligence Coordination',
    description:
      'We coordinate practical verification—site reality, project readiness, and delivery risk—using structured checklists and clear reporting.',
    bullets: [
      'Site and location verification (as applicable)',
      'Builder/project track-record checks (where available)',
      'Phase readiness and delivery risk notes',
      'Milestone checklist and red-flag reporting',
      'Third-party coordination support if needed',
      'Summary report with recommended next steps',
    ],
  },
  {
    icon: MessageSquare,
    title: 'Reporting & Investor Communication',
    description:
      'A consistent update cadence and milestone clarity—so you always know what changed, why it matters, and what happens next.',
    bullets: [
      'Milestone updates: what happened / what changed / impact',
      'Decision-point alerts when action is required',
      'Issue tracking and resolution notes',
      'Documentation status visibility',
      'Portfolio-level summaries (if applicable)',
      'Plain-English communication—no jargon, no fluff',
    ],
  },
]

const deliverables = [
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
]

const steps = [
  {
    title: 'Discovery',
    description: 'We align on your goals, ticket size, preferred markets, and investment horizon.',
  },
  {
    title: 'Shortlist',
    description: 'We share curated opportunities that fit your thesis and screen out noise.',
  },
  {
    title: 'Validate',
    description: 'We review micro-market signals, comps, absorption reality, and risk flags.',
  },
  {
    title: 'Underwrite',
    description: 'We map base and downside scenarios, identify drivers, and stress-test assumptions.',
  },
  {
    title: 'Document',
    description: 'We support documentation readiness, checklists, timelines, and closing workflows.',
  },
  {
    title: 'Track & Review',
    description: 'You receive milestone updates and decision-point clarity throughout the journey.',
  },
]

const engagementModels = [
  {
    title: 'Opportunity-First',
    description:
      'Explore curated opportunities and receive structured diligence support before you decide.',
  },
  {
    title: 'Advisory / Diligence Support',
    description:
      'Already have a deal? We help you stress-test assumptions and surface blind spots.',
  },
  {
    title: 'Portfolio-Led',
    description:
      'Define your goals and horizon. We help you build a disciplined pipeline across markets.',
  },
]

const faqs = [
  {
    q: 'Do you guarantee returns?',
    a: 'No. Real estate investing involves risk. Our role is to improve decision quality through disciplined evaluation, clearer assumptions, and structured execution support.',
  },
  {
    q: 'Who is Co-ventures for?',
    a: 'Investors in India and globally (including NRIs) who want a structured approach to evaluating Indian real estate opportunities.',
  },
  {
    q: 'What types of opportunities do you focus on?',
    a: 'Opportunities tied to real demand in growth corridors and micro-markets, filtered by execution readiness and risk clarity.',
  },
  {
    q: 'Can you help if I already have a deal?',
    a: 'Yes. We can support diligence and underwriting so you can stress-test assumptions and surface blind spots before proceeding.',
  },
  {
    q: 'How do you choose markets and micro-markets?',
    a: 'We look at fundamentals such as job corridors, migration patterns, infrastructure upgrades, affordability bands, and absorption reality.',
  },
  {
    q: 'What do I need to get started?',
    a: 'A short call to understand your goals and preferences. Then we share a shortlist and diligence highlights aligned to your fit.',
  },
  {
    q: 'Is this an offer to invest?',
    a: 'No. This website is for informational purposes only and does not constitute an offer or solicitation. Any opportunity will be shared through the appropriate process and documentation.',
  },
  {
    q: 'How do you communicate updates?',
    a: 'We use structured milestone updates and decision-point alerts, written in plain English so you always know what changed and what it means.',
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────────

export default function ServicesPage() {
  return (
    <>
      <Header />
      <main className="pt-20">
        {/* ───────────────────────────────────────────────────────────────────
            HERO
        ─────────────────────────────────────────────────────────────────── */}
        <section className="py-16 md:py-20 bg-white">
          <div className="max-w-6xl mx-auto px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl"
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-charcoal mb-6">
                Services built for disciplined real estate investing
              </h1>
              <p className="text-lg md:text-xl text-gray-600 leading-relaxed mb-8 max-w-2xl">
                From screening and underwriting to documentation support and investor
                updates—Co-ventures helps you make decisions with clarity and control.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link href="/contact">
                  <Button size="lg" className="shadow-lg hover:shadow-xl">
                    Schedule a Call
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/properties">
                  <Button size="lg" variant="outline">
                    Explore Opportunities
                  </Button>
                </Link>
              </div>
              <p className="text-sm text-gray-500 tracking-wide">
                Capital-first • Diligence-led • Plain-English clarity
              </p>
            </motion.div>
          </div>
        </section>

        {/* ───────────────────────────────────────────────────────────────────
            CORE SERVICES
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
                OUR SERVICES
              </p>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-charcoal mb-4">
                What we offer
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl">
                A structured, end-to-end process designed to reduce uncertainty and improve
                decision quality—without hype.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service, index) => (
                <motion.div
                  key={service.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="bg-white border-0 rounded-xl p-0 shadow-soft hover:shadow-medium hover:-translate-y-1 transition-all duration-300 h-full">
                    <CardHeader className="pb-2">
                      <div className="w-12 h-12 rounded-full bg-coral flex items-center justify-center mb-3">
                        <service.icon className="w-6 h-6 text-white" />
                      </div>
                      <CardTitle className="text-lg font-semibold tracking-tight text-charcoal">
                        {service.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                        {service.description}
                      </p>
                      <ul className="space-y-2">
                        {service.bullets.map((bullet, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                            <CheckCircle2 className="w-4 h-4 text-coral flex-shrink-0 mt-0.5" />
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ───────────────────────────────────────────────────────────────────
            DELIVERABLES
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
                DELIVERABLES
              </p>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-charcoal mb-4">
                What you receive
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl">
                Clear, concise outputs designed to make decisions easier—without drowning you in
                documents.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {deliverables.map((item, idx) => (
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
            HOW IT WORKS
        ─────────────────────────────────────────────────────────────────── */}
        <section className="py-16 md:py-20 bg-peach-light">
          <div className="max-w-6xl mx-auto px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-12 text-center"
            >
              <div className="w-12 h-1 bg-coral mx-auto mb-6"></div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-charcoal mb-4">
                How it works
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                A simple process that stays disciplined—screen, validate, underwrite, document, and
                communicate.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {steps.map((step, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="relative"
                >
                  <div className="bg-white rounded-2xl p-6 shadow-soft hover:shadow-medium transition-all duration-300 h-full">
                    {/* Illustration box */}
                    <div className="relative mb-6 h-32 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl flex items-center justify-center">
                      {/* Step number badge */}
                      <div className="absolute -top-3 -right-3 w-10 h-10 bg-coral rounded-full flex items-center justify-center shadow-lg">
                        <span className="text-white font-bold text-base">{idx + 1}</span>
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
                    <h3 className="font-bold text-charcoal mb-2 text-lg">{step.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ───────────────────────────────────────────────────────────────────
            ENGAGEMENT MODELS
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
                ENGAGEMENT OPTIONS
              </p>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-charcoal mb-4">
                Ways to engage
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl">
                Choose the level of support you need—without forcing a one-size-fits-all package.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6">
              {engagementModels.map((model, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card className="bg-white border border-gray-200 rounded-2xl shadow-soft hover:shadow-medium hover:border-coral-light transition-all duration-300 h-full">
                    <CardHeader>
                      <div className="w-12 h-12 rounded-full bg-coral/10 flex items-center justify-center mb-3">
                        <div className="w-6 h-6 bg-coral rounded-full"></div>
                      </div>
                      <CardTitle className="text-lg font-semibold tracking-tight text-charcoal">
                        {model.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {model.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ───────────────────────────────────────────────────────────────────
            FAQ
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
                Questions we hear often
              </h2>
              <p className="text-lg text-gray-600">Short answers in plain English.</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-3xl bg-white rounded-2xl shadow-soft p-6 md:p-8"
            >
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, idx) => (
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
              <p className="text-gray-600 mb-4">Still have questions?</p>
              <Link href="/contact">
                <Button variant="outline" className="border-2 border-coral text-coral hover:bg-coral hover:text-white">
                  Contact Our Team
                  <MessageSquare className="ml-2 w-4 h-4" />
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
                Ready to evaluate an opportunity with Co-ventures?
              </h2>
              <p className="text-lg md:text-xl text-white/90 mb-10 max-w-2xl mx-auto">
                Share your goals and preferred horizon. We'll guide you through a clear, capital-first
                evaluation process.
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
