'use client'

import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Button } from '@/components/ui/Button'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { 
  Search, 
  FileText, 
  Users, 
  Shield, 
  TrendingUp, 
  Home, 
  Calculator,
  UserCheck,
  Building2,
  MessageSquare,
  CheckCircle,
  ArrowRight
} from 'lucide-react'

export default function ServicesPage() {
  const mainServices = [
    {
      icon: Search,
      title: 'Property Search & Matching',
      description: 'We help you find the perfect property that matches your budget, location preferences, and lifestyle needs.',
      features: [
        'Personalized property recommendations',
        'Access to exclusive listings',
        'Virtual and in-person property tours',
        'Detailed property analysis'
      ],
      image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80'
    },
    {
      icon: Users,
      title: 'Co-Owner Matching',
      description: 'Our intelligent matching system connects you with compatible co-owners who share similar investment goals.',
      features: [
        'Background verification of co-owners',
        'Compatibility assessment',
        'Group formation facilitation',
        'Community building support'
      ],
      image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&q=80'
    },
    {
      icon: FileText,
      title: 'Legal Documentation',
      description: 'Complete legal support for co-ownership agreements, property verification, and documentation.',
      features: [
        'Co-ownership agreement drafting',
        'Property title verification',
        'Registration assistance',
        'Legal compliance guidance'
      ],
      image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=80'
    },
    {
      icon: Calculator,
      title: 'Financial Planning',
      description: 'Expert financial advice to help you understand investment implications and payment structures.',
      features: [
        'Investment analysis',
        'Loan assistance',
        'Tax benefit guidance',
        'Payment plan structuring'
      ],
      image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&q=80'
    },
    {
      icon: Building2,
      title: 'Property Management',
      description: 'Ongoing property management services to ensure smooth co-ownership operations.',
      features: [
        'Maintenance coordination',
        'Expense management',
        'Tenant management (if applicable)',
        'Property upkeep oversight'
      ],
      image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80'
    },
    {
      icon: MessageSquare,
      title: 'Mediation & Support',
      description: 'Continuous support and mediation services to resolve any co-ownership concerns.',
      features: [
        '24/7 customer support',
        'Conflict resolution',
        'Exit strategy assistance',
        'Buy-out facilitation'
      ],
      image: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800&q=80'
    }
  ]

  const process = [
    {
      step: '01',
      title: 'Initial Consultation',
      description: 'Schedule a free consultation to discuss your housing requirements and budget',
      icon: MessageSquare
    },
    {
      step: '02',
      title: 'Property Selection',
      description: 'Browse curated properties and shortlist ones that match your criteria',
      icon: Search
    },
    {
      step: '03',
      title: 'Partner Matching',
      description: 'Get matched with verified co-owners who share similar goals',
      icon: Users
    },
    {
      step: '04',
      title: 'Legal Processing',
      description: 'Complete legal documentation with our expert legal team',
      icon: FileText
    },
    {
      step: '05',
      title: 'Ownership Transfer',
      description: 'Finalize the purchase and get your property registered',
      icon: Home
    },
    {
      step: '06',
      title: 'Ongoing Support',
      description: 'Receive continuous support for property management and maintenance',
      icon: Shield
    }
  ]

  const benefits = [
    {
      icon: TrendingUp,
      title: 'Affordable Investment',
      description: 'Access premium properties at a fraction of the cost through shared ownership'
    },
    {
      icon: Shield,
      title: 'Legal Security',
      description: 'Robust legal framework protecting all co-owners\' interests'
    },
    {
      icon: Users,
      title: 'Verified Partners',
      description: 'Thorough background checks ensure trustworthy co-owners'
    },
    {
      icon: UserCheck,
      title: 'Transparent Process',
      description: 'Complete transparency in pricing, terms, and conditions'
    },
    {
      icon: Home,
      title: 'Quality Properties',
      description: 'Carefully vetted properties in prime locations'
    },
    {
      icon: CheckCircle,
      title: 'Proven Track Record',
      description: 'Over 1,200 successful co-housing arrangements'
    }
  ]

  return (
    <>
      <Header />
      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative h-[60vh] min-h-[400px] flex items-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <Image
              src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1920&q=80"
              alt="Our Services"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/50" />
          </div>

          <div className="container mx-auto px-6 md:px-10 lg:px-20 max-w-[1440px] relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-3xl"
            >
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 drop-shadow-2xl">
                Our Services
              </h1>
              <p className="text-xl text-white/90 leading-relaxed mb-8">
                Comprehensive co-housing solutions designed to make your homeownership journey seamless and secure
              </p>
              <Link href="/contact">
                <Button size="lg">
                  Get Started
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Main Services */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-6 md:px-10 lg:px-20 max-w-[1440px]">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-charcoal mb-4">
                What We Offer
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                End-to-end services to ensure a smooth and secure co-housing experience
              </p>
            </motion.div>

            <div className="space-y-20">
              {mainServices.map((service, index) => (
                <motion.div
                  key={service.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className={`grid lg:grid-cols-2 gap-12 items-center ${
                    index % 2 === 1 ? 'lg:flex-row-reverse' : ''
                  }`}
                >
                  <div className={index % 2 === 1 ? 'lg:order-2' : ''}>
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-16 h-16 bg-coral-light rounded-xl flex items-center justify-center flex-shrink-0">
                        <service.icon className="w-8 h-8 text-coral" />
                      </div>
                      <h3 className="text-3xl font-bold text-charcoal">{service.title}</h3>
                    </div>
                    <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                      {service.description}
                    </p>
                    <ul className="space-y-3">
                      {service.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className={`relative h-[400px] rounded-2xl overflow-hidden shadow-2xl ${
                    index % 2 === 1 ? 'lg:order-1' : ''
                  }`}>
                    <Image
                      src={service.image}
                      alt={service.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Process Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-6 md:px-10 lg:px-20 max-w-[1440px]">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-charcoal mb-4">
                How It Works
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Our streamlined 6-step process makes co-housing simple and hassle-free
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {process.map((item, index) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="relative bg-gray-50 rounded-xl p-8 hover:shadow-xl transition-shadow"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="text-5xl font-bold text-coral-light">{item.step}</div>
                    <div className="w-12 h-12 bg-coral-light rounded-lg flex items-center justify-center flex-shrink-0 mt-2">
                      <item.icon className="w-6 h-6 text-coral" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-charcoal mb-3">{item.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{item.description}</p>
                  {index < process.length - 1 && (
                    <div className="hidden lg:block absolute -right-4 top-1/2 -translate-y-1/2">
                      <ArrowRight className="w-8 h-8 text-coral-light" />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20 bg-gradient-to-br from-coral to-coral-dark text-white">
          <div className="container mx-auto px-6 md:px-10 lg:px-20 max-w-[1440px]">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Why Choose Us
              </h2>
              <p className="text-xl text-white/90 max-w-3xl mx-auto">
                Experience the Co Housing Ventures advantage
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-colors"
                >
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-4">
                    <benefit.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{benefit.title}</h3>
                  <p className="text-white/80 leading-relaxed">{benefit.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-6 md:px-10 lg:px-20 max-w-[1440px]">
            <div className="grid md:grid-cols-4 gap-8 text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <div className="text-5xl font-bold text-coral mb-2">500+</div>
                <div className="text-gray-600 text-lg">Properties Listed</div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
              >
                <div className="text-5xl font-bold text-coral mb-2">1,200+</div>
                <div className="text-gray-600 text-lg">Happy Families</div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                <div className="text-5xl font-bold text-coral mb-2">98%</div>
                <div className="text-gray-600 text-lg">Success Rate</div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
              >
                <div className="text-5xl font-bold text-coral mb-2">10+</div>
                <div className="text-gray-600 text-lg">Years Experience</div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-6 md:px-10 lg:px-20 max-w-[1440px]">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-coral to-coral-dark rounded-2xl p-12 text-center text-white"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Get Started?
              </h2>
              <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
                Let's discuss how we can help you achieve your homeownership goals
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/contact">
                  <Button
                    size="lg"
                    variant="secondary"
                    className="bg-white text-coral hover:bg-gray-100"
                  >
                    Schedule Consultation
                  </Button>
                </Link>
                <Link href="/properties">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-2 border-white text-white hover:bg-white hover:text-coral"
                  >
                    Browse Properties
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
