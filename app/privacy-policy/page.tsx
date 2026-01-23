'use client'

import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { motion } from 'framer-motion'
import Image from 'next/image'

// ─────────────────────────────────────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────────────────────────────────────

const meta = {
  title: 'Privacy Policy | Co-ventures',
  description:
    'Learn how Co-ventures collects, uses, shares, and protects personal information on our website.',
  lastUpdated: 'January 8, 2026',
}

const hero = {
  h1: 'Privacy Policy',
  subhead:
    'This Privacy Policy explains how Co-ventures collects, uses, shares, and protects your information when you visit our website or contact us.',
  note: 'If you have questions, contact us at: privacy@co-ventures.in',
}

const sections = [
  {
    title: '1) Who we are',
    body: [
      '"Co-ventures" ("we", "us", "our") operates this website to share information about our services and investment evaluation approach.',
      'Controller/Entity: Co-ventures',
      'Contact: privacy@co-ventures.in',
      'Address: [Add official business address]',
    ],
  },
  {
    title: '2) Scope',
    body: [
      'This policy applies to information collected through our website, forms, and communications related to our services.',
      'It does not cover third-party websites you may access through links on our website.',
    ],
  },
  {
    title: '3) Information we collect',
    body: [
      'Information you provide to us:',
      '• Contact details (name, email, phone number).',
      '• Message content and any details you include in inquiry forms or emails.',
      '• Investor preferences you choose to share (e.g., target cities, ticket size, horizon).',
      '',
      'Information collected automatically:',
      '• Basic usage data (pages viewed, time spent, referring page).',
      '• Device and browser information (device type, browser type, IP address).',
      '',
      'Cookies and similar technologies:',
      '• We may use cookies to keep our website secure, functional, and to understand usage patterns.',
    ],
  },
  {
    title: '4) How we use your information',
    body: [
      'We use your information to:',
      '• Respond to inquiries and schedule calls.',
      '• Share requested information about our services and process.',
      '• Improve our website experience and understand what content is useful.',
      '• Maintain website security and prevent abuse.',
      '• Comply with legal obligations where applicable.',
    ],
  },
  {
    title: '5) Legal basis / consent',
    body: [
      'Where required, we process personal data based on your consent (for example, when you submit a form or request updates).',
      'In other cases, we may process data to respond to your request, operate our website, or comply with legal obligations.',
      'You may withdraw consent where applicable by contacting us at privacy@co-ventures.in.',
    ],
  },
  {
    title: '6) Sharing of information',
    body: [
      'We do not sell your personal information.',
      'We may share information with service providers who help us operate the website and communications (e.g., hosting, analytics, email delivery), only as needed to provide those services.',
      'We may disclose information if required by law, to protect our rights, or to prevent fraud and security incidents.',
    ],
  },
  {
    title: '7) International transfers',
    body: [
      'Your information may be processed in countries other than where you live (for example, where our service providers host systems).',
      'When we do this, we take reasonable steps to ensure appropriate safeguards are in place.',
    ],
  },
  {
    title: '8) Data retention',
    body: [
      'We retain personal information only for as long as needed for the purposes described in this policy, unless a longer retention period is required or permitted by law.',
      'Typical retention depends on the type of request and our legal/compliance obligations.',
      'Retention guideline: [Insert your internal retention window, e.g., 12–24 months for inquiry records]',
    ],
  },
  {
    title: '9) Security',
    body: [
      'We use reasonable administrative, technical, and organizational measures to protect personal information.',
      'However, no method of transmission or storage is completely secure, and we cannot guarantee absolute security.',
    ],
  },
  {
    title: '10) Your rights',
    body: [
      'Depending on your location and applicable law, you may have rights such as:',
      '• Access to your personal information.',
      '• Correction or updating of inaccurate information.',
      '• Deletion/erasure in certain circumstances.',
      '• Withdrawal of consent (where processing is based on consent).',
      '• Requesting information about how your data is used.',
      '',
      'To exercise rights, contact privacy@co-ventures.in. We may need to verify your identity before processing requests.',
    ],
  },
  {
    title: "11) Children's privacy",
    body: [
      'Our website is not intended for children. We do not knowingly collect personal information from children.',
      'If you believe a child has provided personal information, contact us and we will take appropriate steps.',
    ],
  },
  {
    title: '12) Third-party links',
    body: [
      'Our website may include links to third-party websites. We are not responsible for their privacy practices.',
      'We encourage you to review the privacy policies of any third-party sites you visit.',
    ],
  },
  {
    title: '13) Changes to this policy',
    body: [
      'We may update this policy from time to time. We will update the "Last Updated" date at the top of this page.',
      'Your continued use of the website after updates means you accept the revised policy.',
    ],
  },
  {
    title: '14) Contact / grievance',
    body: [
      'For questions, requests, or concerns, contact:',
      'Email: privacy@co-ventures.in',
      'Address: [Add official business address]',
      '',
      'If you are not satisfied with our response, you may have the right to raise concerns with the relevant data protection authority in your jurisdiction.',
    ],
  },
]

const footerDisclaimer =
  'Informational only. Investing involves risk. Not an offer or solicitation.'

// ─────────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────────

export default function PrivacyPolicyPage() {
  return (
    <>
      <Header />
      <main className="pt-20">
        {/* ───────────────────────────────────────────────────────────────────
            HERO
        ─────────────────────────────────────────────────────────────────── */}
        <section className="relative h-[50vh] min-h-[350px] flex items-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <Image
              src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1920&q=80"
              alt="Privacy Policy"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-black/65" />
          </div>

          <div className="max-w-6xl mx-auto px-4 md:px-6 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl mx-auto text-center"
            >
              <p className="text-sm text-white/70 tracking-wide mb-4">
                Last Updated: {meta.lastUpdated}
              </p>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-6 drop-shadow-2xl">
                {hero.h1}
              </h1>
              <p className="text-lg md:text-xl text-white/90 leading-relaxed mb-8">
                {hero.subhead}
              </p>
              <p className="text-sm text-white/70 leading-relaxed">
                {hero.note}
              </p>
            </motion.div>
          </div>
        </section>

        {/* ───────────────────────────────────────────────────────────────────
            POLICY SECTIONS
        ─────────────────────────────────────────────────────────────────── */}
        <section className="py-16 md:py-20 bg-peach-light">
          <div className="max-w-6xl mx-auto px-4 md:px-6">
            <div className="max-w-3xl mx-auto">
              {sections.map((section, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="mb-12">
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-charcoal mb-4">
                      {section.title}
                    </h2>
                    <div className="space-y-4">
                      {section.body.map((paragraph, idx) => (
                        <p
                          key={idx}
                          className={`text-base text-gray-700 leading-relaxed ${
                            paragraph === '' ? 'h-2' : ''
                          }`}
                        >
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </div>
                  {index < sections.length - 1 && (
                    <div className="mb-12">
                      <div className="w-full h-px bg-gray-300"></div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ───────────────────────────────────────────────────────────────────
            FOOTER DISCLAIMER
        ─────────────────────────────────────────────────────────────────── */}
        <section className="py-12 bg-white">
          <div className="max-w-6xl mx-auto px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-3xl mx-auto text-center"
            >
              <p className="text-sm text-gray-500">{footerDisclaimer}</p>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

