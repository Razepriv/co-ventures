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
import Image from 'next/image'

// DATA
const services = [
  {
    icon: Search,
    title: 'Opportunity Sourcing & Screening',
    description:
      'We curate opportunities aligned with real demand - growth corridors, micro-market strength, and execution readiness - so you start with higher-quality options.',
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
      'We validate the narrative with reality: comps, absorption, affordability bands, and demand drivers - so decisions are grounded on the ground truth.',
    bullets: [
      'Comparable pricing and positioning benchmarks',
      'Absorption rates and time-to-exit indicators',
      'Affordability analysis and pricing elasticity',
      'Demand drivers: jobs, migration, infra, credit access',
      'Micro-market scorecard and context mapping',
      'Risk flags and supply-demand mismatches',
    ],
  },
  {
    icon: Calculator,
    title: 'Underwriting & Scenario Modeling',
    description:
      'We build conservative base and downside scenarios, highlight return drivers, and stress-test risks - so tradeoffs are visible before you commit.',
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
      'We help you navigate documentation, readiness checks, and closing workflows with clarity - so execution stays clean and predictable.',
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
      'We coordinate practical verification - site reality, project readiness, and delivery risk - using structured checklists and clear reporting.',
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
      'A consistent update cadence and milestone clarity - so you always know what changed, why it matters, and what happens next.',
    bullets: [
      'Milestone updates: what happened / what changed / impact',
      'Decision-point alerts when action is required',
      'Issue tracking and resolution notes',
      'Documentation status visibility',
      'Portfolio-level summaries (if applicable)',
      'Plain-English communication - no jargon, no fluff',
    ],
  },
]

const deliverables = [
  {
    title: 'Deal Snapshot (1-page)',
    description: 'Thesis, location context, demand drivers, and key risks - at a glance.',
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

// PAGE
export default function ServicesPage() {
  return (
    <>
      <Header />
      <main className="pt-20">
        {/* HERO */}
        <section className="relative h-[60vh] min-h-[400px] flex items-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <Image
              src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1920&q=80"
              alt="Our Services"
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
                Services built for disciplined real estate investing
              </h1>
              <p className="text-lg md:text-xl text-white/90 leading-relaxed mb-8 max-w-2xl">
                From screening and underwriting to documentation support and investor
                updates - Co-ventures helps you make decisions with clarity and control.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link href="/contact">
                  <Button size="lg" className="shadow-lg hover:shadow-xl">
                    Start a Conversation
                  </Button>
                </Link>
                <Link href="/properties">
                  <Button variant="outline" size="lg" className="bg-white/10 backdrop-blur-md border-2 border-white text-white hover:bg-white hover:text-coral">
                    Explore Opportunities
                  </Button>
                </Link>
              </div>
              <p className="text-sm text-white/70">
                For informational purposes only. Not an offer or solicitation.
              </p>
            </motion.div>
          </div>
        </section>

        {/* CORE SERVICES */}
        <section className="py-16 md:py-20 bg-peach-light">
          <div className="max-w-6xl mx-auto px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-charcoal mb-4">
                Core Services
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                A structured approach to sourcing, evaluating, and executing real estate
                opportunities with discipline and clarity.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((service, index) => {
                const IconComponent = service.icon
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                      <CardHeader>
                        <div className="w-12 h-12 bg-coral/10 rounded-lg flex items-center justify-center mb-4">
                          <IconComponent className="w-6 h-6 text-coral" />
                        </div>
                        <CardTitle className="text-xl mb-2">{service.title}</CardTitle>
                        <p className="text-gray-600 text-sm">{service.description}</p>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {service.bullets.map((bullet, bulletIndex) => (
                            <li key={bulletIndex} className="flex items-start gap-2 text-sm">
                              <CheckCircle2 className="w-4 h-4 text-coral mt-0.5 flex-shrink-0" />
                              <span className="text-gray-700">{bullet}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </section>

        {/* DELIVERABLES */}
        <section className="py-16 md:py-20 bg-white">
          <div className="max-w-6xl mx-auto px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-charcoal mb-4">
                What You Get
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Clear, actionable outputs at every stage so you can make decisions with
                confidence.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {deliverables.map((deliverable, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                    <CardHeader>
                      <CardTitle className="text-lg mb-2">{deliverable.title}</CardTitle>
                      <p className="text-gray-600 text-sm">{deliverable.description}</p>
                    </CardHeader>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="py-16 md:py-20 bg-peach-light">
          <div className="max-w-6xl mx-auto px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-charcoal mb-4">
                How It Works
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                A disciplined, step-by-step process from discovery to decision.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {steps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="relative"
                >
                  <div className="bg-white rounded-lg p-6 h-full shadow-md hover:shadow-lg transition-shadow duration-300">
                    <div className="w-10 h-10 bg-coral text-white rounded-full flex items-center justify-center font-bold mb-4">
                      {index + 1}
                    </div>
                    <h3 className="text-xl font-semibold text-charcoal mb-2">
                      {step.title}
                    </h3>
                    <p className="text-gray-600">{step.description}</p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                      <ArrowRight className="w-6 h-6 text-coral" />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ENGAGEMENT MODELS */}
        <section className="py-16 md:py-20 bg-white">
          <div className="max-w-6xl mx-auto px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-charcoal mb-4">
                Engagement Models
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Flexible support that adapts to where you are in your investment journey.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {engagementModels.map((model, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                    <CardHeader>
                      <CardTitle className="text-xl mb-2">{model.title}</CardTitle>
                      <p className="text-gray-600">{model.description}</p>
                    </CardHeader>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 md:py-20 bg-peach-light">
          <div className="max-w-4xl mx-auto px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-charcoal mb-4">
                Frequently Asked Questions
              </h2>
            </motion.div>

            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left text-charcoal font-medium">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* FINAL CTA + DISCLAIMER */}
        <section className="py-20 md:py-24 bg-gradient-to-r from-coral to-coral-light">
          <div className="max-w-6xl mx-auto px-4 md:px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Ready to invest with clarity?
              </h2>
              <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
                Let&apos;s explore how Co-ventures can support your real estate investment journey.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
                <Link href="/contact">
                  <Button
                    size="lg"
                    variant="outline"
                    className="bg-white text-coral border-white hover:bg-white/90 hover:text-coral"
                  >
                    Start a Conversation
                  </Button>
                </Link>
                <Link href="/properties">
                  <Button
                    size="lg"
                    variant="outline"
                    className="bg-transparent text-white border-white hover:bg-white/10"
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

