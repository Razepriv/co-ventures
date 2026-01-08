'use client'

import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Button } from '@/components/ui/Button'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { Target, Eye, Award, Users, Home, TrendingUp, Shield, Heart } from 'lucide-react'
import Link from 'next/link'

export default function AboutPage() {
  const stats = [
    { label: 'Properties Listed', value: '500+', icon: Home },
    { label: 'Happy Families', value: '1,200+', icon: Users },
    { label: 'Success Rate', value: '98%', icon: TrendingUp },
    { label: 'Years Experience', value: '10+', icon: Award },
  ]

  const values = [
    {
      icon: Shield,
      title: 'Trust & Transparency',
      description: 'We believe in complete transparency in all our dealings, ensuring trust between all parties involved in co-housing arrangements.',
    },
    {
      icon: Heart,
      title: 'Community First',
      description: 'Building strong communities is at our core. We facilitate connections that last beyond property ownership.',
    },
    {
      icon: Target,
      title: 'Goal-Oriented',
      description: 'We are committed to helping you achieve your dream of homeownership through innovative co-housing solutions.',
    },
    {
      icon: Award,
      title: 'Excellence',
      description: 'We maintain the highest standards in property selection, legal processes, and customer service.',
    },
  ]

  const team = [
    {
      name: 'Rajesh Kumar',
      role: 'Founder & CEO',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
      bio: '15+ years in real estate and co-housing ventures',
    },
    {
      name: 'Priya Sharma',
      role: 'Head of Operations',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80',
      bio: 'Expert in property management and client relations',
    },
    {
      name: 'Amit Patel',
      role: 'Legal Advisor',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80',
      bio: 'Specializes in co-ownership legal frameworks',
    },
    {
      name: 'Sneha Reddy',
      role: 'Customer Success',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80',
      bio: 'Dedicated to ensuring seamless client experiences',
    },
  ]

  return (
    <>
      <Header />
      <main>
        {/* Hero Section */}
        <section className="relative h-[60vh] min-h-[400px] flex items-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <Image
              src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920&q=80"
              alt="About Co Housing Ventures"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-black/60" />
          </div>

          <div className="container mx-auto px-6 md:px-10 lg:px-20 max-w-[1440px] relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-3xl"
            >
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 drop-shadow-2xl">
                About Co Housing Ventures
              </h1>
              <p className="text-xl text-white/90 leading-relaxed">
                Pioneering the future of affordable homeownership through innovative co-housing solutions since 2014.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-6 md:px-10 lg:px-20 max-w-[1440px]">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-coral-light rounded-full mb-4">
                    <stat.icon className="w-8 h-8 text-coral" />
                  </div>
                  <div className="text-4xl font-bold text-charcoal mb-2">{stat.value}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-6 md:px-10 lg:px-20 max-w-[1440px]">
            <div className="grid md:grid-cols-2 gap-12">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl p-8 shadow-lg"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-coral-light rounded-lg flex items-center justify-center">
                    <Target className="w-6 h-6 text-coral" />
                  </div>
                  <h2 className="text-3xl font-bold text-charcoal">Our Mission</h2>
                </div>
                <p className="text-gray-700 leading-relaxed text-lg">
                  To democratize homeownership by making premium properties accessible through co-housing. 
                  We aim to create sustainable communities where people can share the dream of owning quality homes 
                  without the burden of unaffordable prices.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl p-8 shadow-lg"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-coral-light rounded-lg flex items-center justify-center">
                    <Eye className="w-6 h-6 text-coral" />
                  </div>
                  <h2 className="text-3xl font-bold text-charcoal">Our Vision</h2>
                </div>
                <p className="text-gray-700 leading-relaxed text-lg">
                  To be India's most trusted co-housing platform, revolutionizing real estate by building 
                  thriving communities and making homeownership a reality for millions. We envision a future 
                  where quality housing is accessible to all through collaborative ownership.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Our Values */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-6 md:px-10 lg:px-20 max-w-[1440px]">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-charcoal mb-4">Our Core Values</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                The principles that guide everything we do at Co Housing Ventures
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="w-14 h-14 bg-coral-light rounded-lg flex items-center justify-center mb-4">
                    <value.icon className="w-7 h-7 text-coral" />
                  </div>
                  <h3 className="text-xl font-bold text-charcoal mb-3">{value.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{value.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Our Story */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-6 md:px-10 lg:px-20 max-w-[1440px]">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-4xl font-bold text-charcoal mb-6">Our Story</h2>
                <div className="space-y-4 text-gray-700 leading-relaxed text-lg">
                  <p>
                    Co Housing Ventures was born from a simple observation: premium properties were becoming 
                    increasingly unaffordable for middle-class families, despite their growing aspirations and 
                    financial stability.
                  </p>
                  <p>
                    In 2014, our founder Rajesh Kumar witnessed close friends struggling to buy their dream homes 
                    in prime locations. This sparked an idea - what if people could pool resources and co-own 
                    premium properties, making them accessible to everyone?
                  </p>
                  <p>
                    Starting with just 5 properties and 20 families, we've grown into India's leading co-housing 
                    platform, helping over 1,200 families achieve their homeownership dreams. Our success lies in 
                    our commitment to transparency, legal security, and building genuine communities.
                  </p>
                  <p>
                    Today, we continue to innovate and expand, making quality housing accessible while fostering 
                    connections that transform co-owners into lifelong friends and neighbors.
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="relative h-[500px] rounded-2xl overflow-hidden shadow-2xl"
              >
                <Image
                  src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80"
                  alt="Our Journey"
                  fill
                  className="object-cover"
                />
              </motion.div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-6 md:px-10 lg:px-20 max-w-[1440px]">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-charcoal mb-4">Meet Our Team</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Passionate professionals dedicated to your homeownership journey
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {team.map((member, index) => (
                <motion.div
                  key={member.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="group"
                >
                  <div className="relative h-80 rounded-xl overflow-hidden mb-4 shadow-lg">
                    <Image
                      src={member.image}
                      alt={member.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                      <h3 className="text-xl font-bold mb-1">{member.name}</h3>
                      <p className="text-coral-light font-medium">{member.role}</p>
                    </div>
                  </div>
                  <p className="text-gray-600 text-center">{member.bio}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-br from-coral to-coral-dark text-white">
          <div className="container mx-auto px-6 md:px-10 lg:px-20 max-w-[1440px]">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center max-w-3xl mx-auto"
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Ready to Start Your Homeownership Journey?
              </h2>
              <p className="text-xl mb-8 text-white/90">
                Join thousands of families who have found their dream homes through co-housing
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/properties">
                  <Button
                    size="lg"
                    variant="secondary"
                    className="bg-white text-coral hover:bg-gray-100"
                  >
                    Browse Properties
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-2 border-white text-white hover:bg-white hover:text-coral"
                  >
                    Contact Us
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
