'use client'

import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { motion } from 'framer-motion'
import Link from 'next/link'

// ─────────────────────────────────────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────────────────────────────────────

const meta = {
  title: 'Terms & Conditions | Co-ventures',
  description:
    'Terms governing your use of the Co-ventures website and related communications.',
  lastUpdated: 'January 8, 2026',
}

const hero = {
  h1: 'Terms & Conditions',
  subhead:
    'These Terms govern your access to and use of the Co-ventures website and any communications you have with us through this site.',
  note: 'If you do not agree to these Terms, please do not use the website.',
}

const callouts = {
  title: 'Important note',
  items: [
    'Informational only. Nothing on this website constitutes investment, legal, tax, or financial advice.',
    'No offer or solicitation. Any investment opportunity, if any, will be made only through appropriate documentation and applicable legal processes.',
    'Investing involves risk. Outcomes are not guaranteed.',
  ],
}

const sections = [
  {
    title: '1) Definitions',
    body: [
      '"Co-ventures" ("we", "us", "our") refers to the entity operating this website.',
      '"Website" refers to all pages, content, and functionality available at our domain and related subpages.',
      '"You" refers to any visitor, user, or person accessing the Website.',
    ],
  },
  {
    title: '2) Eligibility and permitted use',
    body: [
      'You may use the Website only if you are legally capable of entering into a binding agreement under applicable law.',
      'You agree to use the Website for lawful purposes and in accordance with these Terms.',
      'You must not misuse the Website, attempt unauthorized access, disrupt operations, or use automated scraping in a manner that harms the Website.',
    ],
  },
  {
    title: '3) Informational purpose; no advice',
    body: [
      'All information on this Website is provided for general informational purposes only.',
      'Nothing on the Website constitutes investment, legal, tax, or financial advice, and you should consult your own advisors before making decisions.',
      'Any examples, frameworks, or commentary are illustrative and may not be suitable for your specific circumstances.',
    ],
  },
  {
    title: '4) No offer or solicitation',
    body: [
      'Under no circumstances should any material on this Website be used or considered as an offer to sell or a solicitation of an offer to buy any interest in an investment.',
      'Any offer or solicitation, if made, will be made only through appropriate documentation and in accordance with applicable laws.',
      'Access to certain information (if any) may be restricted based on eligibility criteria and legal requirements.',
    ],
  },
  {
    title: '5) Risk disclosure',
    body: [
      'Real estate and related investments involve risks, including but not limited to: market cycles, execution delays, cost overruns, documentation issues, liquidity constraints, regulatory changes, and demand shifts.',
      'Past performance (if referenced) is not indicative of future results.',
      'You acknowledge that you are solely responsible for any decisions you make based on information obtained from the Website.',
    ],
  },
  {
    title: '6) Inquiries and communications',
    body: [
      'If you submit a form, message, or inquiry through the Website, you represent that the information you provide is accurate to the best of your knowledge.',
      'We may contact you using the information you provide to respond to your request, schedule calls, or share requested materials.',
      'You can opt out of non-essential communications at any time by contacting us at: support@co-ventures.in',
    ],
  },
  {
    title: '7) Payments, refunds, and cancellations',
    body: [
      'If Co-ventures offers any paid services, the applicable pricing, scope, and terms will be communicated before payment is collected.',
      'Refunds (if applicable) are governed by our {{refund-policy}}.',
      'We reserve the right to refuse or cancel service in cases of suspected fraud, misuse, or legal/compliance concerns, subject to applicable law.',
    ],
  },
  {
    title: '8) Intellectual property',
    body: [
      'The Website and all content (including text, design, graphics, logos, and layouts) are owned by or licensed to Co-ventures and protected by applicable intellectual property laws.',
      'You may not copy, reproduce, modify, distribute, or create derivative works from the Website content without our written permission, except as allowed by law.',
      'All trademarks, service marks, and trade names displayed on the Website are the property of their respective owners.',
    ],
  },
  {
    title: '9) Third-party links',
    body: [
      'The Website may contain links to third-party websites for convenience or reference.',
      'We do not control and are not responsible for third-party content, policies, or practices. Your use of third-party websites is at your own risk.',
    ],
  },
  {
    title: '10) Disclaimers',
    body: [
      'The Website is provided on an "as is" and "as available" basis.',
      'We do not warrant that the Website will be uninterrupted, error-free, or free from harmful components.',
      'We make no warranties regarding completeness, accuracy, or reliability of Website content, except where required by law.',
    ],
  },
  {
    title: '11) Limitation of liability',
    body: [
      'To the maximum extent permitted by law, Co-ventures shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or related to your use of the Website.',
      'To the extent permitted by law, our total liability for any claim related to the Website shall be limited to the amount (if any) you paid to us for the specific service giving rise to the claim.',
      'Some jurisdictions do not allow certain limitations; in such cases, liability will be limited to the extent permitted by applicable law.',
    ],
  },
  {
    title: '12) Indemnity',
    body: [
      'You agree to indemnify and hold harmless Co-ventures from and against claims, damages, liabilities, and expenses arising from your misuse of the Website, violation of these Terms, or infringement of any rights of a third party.',
    ],
  },
  {
    title: '13) Privacy',
    body: [
      'Your use of the Website is also governed by our {{privacy-policy}}.',
      'We handle personal information in accordance with applicable law, and we take reasonable steps to protect it.',
    ],
  },
  {
    title: '14) Changes to the Website or Terms',
    body: [
      'We may update the Website, modify features, or change these Terms from time to time.',
      'We will update the "Last Updated" date at the top of this page when changes are made.',
      'Your continued use of the Website after changes means you accept the revised Terms.',
    ],
  },
  {
    title: '15) Governing law and dispute resolution',
    body: [
      'These Terms shall be governed by and construed in accordance with the laws of India, without regard to conflict of law principles.',
      'Courts at [Insert City/State jurisdiction] shall have exclusive jurisdiction, subject to applicable law.',
      'Before initiating formal proceedings, we encourage you to contact us so we can try to resolve issues in good faith.',
    ],
  },
  {
    title: '16) Contact',
    body: [
      'For questions about these Terms, contact:',
      'Email: legal@co-ventures.in',
      'Address: [Add official business address]',
    ],
  },
]

const footerDisclaimer =
  'Informational only. Investing involves risk. Not an offer or solicitation.'

// ─────────────────────────────────────────────────────────────────────────────
// HELPER: Parse and render text with internal links
// ─────────────────────────────────────────────────────────────────────────────

function renderTextWithLinks(text: string) {
  // Replace {{privacy-policy}} with link
  if (text.includes('{{privacy-policy}}')) {
    const parts = text.split('{{privacy-policy}}')
    return (
      <>
        {parts[0]}
        <Link
          href="/privacy-policy"
          className="text-coral hover:text-coral-dark underline"
        >
          Privacy Policy
        </Link>
        {parts[1]}
      </>
    )
  }

  // Replace {{refund-policy}} with link
  if (text.includes('{{refund-policy}}')) {
    const parts = text.split('{{refund-policy}}')
    return (
      <>
        {parts[0]}
        <Link
          href="/refund-policy"
          className="text-coral hover:text-coral-dark underline"
        >
          Refund Policy
        </Link>
        {parts[1]}
      </>
    )
  }

  return text
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────────

export default function TermsAndConditionsPage() {
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
              className="max-w-3xl mx-auto"
            >
              <p className="text-sm text-gray-500 tracking-wide mb-4">
                Last Updated: {meta.lastUpdated}
              </p>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-charcoal mb-6">
                {hero.h1}
              </h1>
              <p className="text-lg md:text-xl text-gray-600 leading-relaxed mb-8">
                {hero.subhead}
              </p>
              <p className="text-sm text-gray-600 leading-relaxed">
                {hero.note}
              </p>
            </motion.div>
          </div>
        </section>

        {/* ───────────────────────────────────────────────────────────────────
            IMPORTANT NOTE CALLOUT
        ─────────────────────────────────────────────────────────────────── */}
        <section className="py-12 bg-peach-light">
          <div className="max-w-6xl mx-auto px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-3xl mx-auto"
            >
              <div className="bg-white border-2 border-coral rounded-lg p-6 md:p-8 shadow-sm">
                <h2 className="text-xl md:text-2xl font-bold tracking-tight text-charcoal mb-4">
                  {callouts.title}
                </h2>
                <ul className="space-y-3">
                  {callouts.items.map((item, index) => (
                    <li
                      key={index}
                      className="text-base text-gray-700 leading-relaxed flex items-start"
                    >
                      <span className="text-coral font-bold mr-3 mt-1">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ───────────────────────────────────────────────────────────────────
            TERMS SECTIONS
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
                          {renderTextWithLinks(paragraph)}
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

