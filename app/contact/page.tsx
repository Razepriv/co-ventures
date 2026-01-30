'use client'

import { useState } from 'react'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { MapPin, Phone, Mail, Clock, Send, MessageSquare } from 'lucide-react'
import { getSupabaseClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export default function ContactPage() {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    inquiry_type: 'general'
  })

  function handleChange(field: string, value: string) {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!formData.full_name || !formData.email || !formData.message) {
      toast.error('Please fill in all required fields')
      return
    }

    setLoading(true)
    try {
      const supabase = getSupabaseClient()

      const { error } = await supabase
        .from('contact_messages')
        // @ts-ignore - Supabase types don't match actual schema
        .insert({
          full_name: formData.full_name,
          email: formData.email,
          phone: formData.phone || null,
          subject: formData.subject || 'General Inquiry',
          message: formData.message,
          status: 'new'
        })

      if (error) throw error

      toast.success('Message sent successfully! We\'ll get back to you soon.')
      setFormData({
        full_name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        inquiry_type: 'general'
      })
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Failed to send message. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const contactInfo = [
    {
      icon: MapPin,
      title: 'Visit Us',
      details: ['Cohousy, Grand Road', 'Eon Free Zone, Kharadi Gaon', 'Pune 411014, India'],
      color: 'bg-blue-100 text-blue-600'
    },
    {
      icon: Phone,
      title: 'Call Us',
      details: ['+91 9876543210', '+91 9876543211', 'Mon-Sat: 9 AM - 6 PM'],
      color: 'bg-green-100 text-green-600'
    },
    {
      icon: Mail,
      title: 'Email Us',
      details: ['info@coventure.in', 'support@coventure.in', 'We reply within 24 hours'],
      color: 'bg-coral-light text-coral'
    },
    {
      icon: Clock,
      title: 'Working Hours',
      details: ['Monday - Friday: 9 AM - 7 PM', 'Saturday: 10 AM - 5 PM', 'Sunday: Closed'],
      color: 'bg-purple-100 text-purple-600'
    }
  ]



  return (
    <>
      <Header />
      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative h-[50vh] min-h-[300px] flex items-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <Image
              src="https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=1920&q=80"
              alt="Contact Us"
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
                Get in Touch
              </h1>
              <p className="text-xl text-white/90 leading-relaxed">
                We&apos;re here to help you find your dream home through co-housing. Let&apos;s start a conversation.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Contact Info Cards */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-6 md:px-10 lg:px-20 max-w-[1440px]">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {contactInfo.map((info, index) => (
                <motion.div
                  key={info.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-shadow"
                >
                  <div className={`w-14 h-14 rounded-lg ${info.color} flex items-center justify-center mb-4`}>
                    <info.icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold text-charcoal mb-3">{info.title}</h3>
                  {info.details.map((detail, idx) => (
                    <p key={idx} className="text-gray-600 text-sm mb-1">{detail}</p>
                  ))}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Form & Map */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-6 md:px-10 lg:px-20 max-w-[1440px]">
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Form */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <div className="bg-white rounded-2xl shadow-xl p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-coral-light rounded-lg flex items-center justify-center">
                      <MessageSquare className="w-6 h-6 text-coral" />
                    </div>
                    <h2 className="text-3xl font-bold text-charcoal">Send us a Message</h2>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="full_name">Full Name *</Label>
                        <Input
                          id="full_name"
                          value={formData.full_name}
                          onChange={(e) => handleChange('full_name', e.target.value)}
                          placeholder="John Doe"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleChange('email', e.target.value)}
                          placeholder="john@example.com"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => handleChange('phone', e.target.value)}
                          placeholder="+91 9876543210"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="inquiry_type">Inquiry Type</Label>
                        <Select value={formData.inquiry_type} onValueChange={(value) => handleChange('inquiry_type', value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="general">General Inquiry</SelectItem>
                            <SelectItem value="property">Property Inquiry</SelectItem>
                            <SelectItem value="partnership">Partnership Inquiry</SelectItem>
                            <SelectItem value="support">Support</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Input
                        id="subject"
                        value={formData.subject}
                        onChange={(e) => handleChange('subject', e.target.value)}
                        placeholder="How can we help you?"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Message *</Label>
                      <Textarea
                        id="message"
                        value={formData.message}
                        onChange={(e) => handleChange('message', e.target.value)}
                        placeholder="Tell us more about your requirements..."
                        rows={6}
                        required
                      />
                    </div>

                    <Button type="submit" size="lg" className="w-full" disabled={loading}>
                      <Send className="mr-2 w-5 h-5" />
                      {loading ? 'Sending...' : 'Send Message'}
                    </Button>
                  </form>
                </div>
              </motion.div>

              {/* Map */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <div className="bg-white rounded-2xl shadow-xl p-8 h-full">
                  <h2 className="text-3xl font-bold text-charcoal mb-6">Visit Our Office</h2>
                  <div className="relative h-[500px] rounded-xl overflow-hidden bg-gray-200">
                    <iframe
                      src="https://www.google.com/maps?q=Cohousy,%20Grand%20Road,%20Eon%20Free%20Zone,%20Kharadi%20Gaon,%20Pune%20411014&output=embed"
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>



        {/* FAQ Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-6 md:px-10 lg:px-20 max-w-[1440px]">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl font-bold text-charcoal mb-4">Frequently Asked Questions</h2>
              <p className="text-xl text-gray-600">Quick answers to common questions</p>
            </motion.div>

            <div className="max-w-3xl mx-auto space-y-6">
              {[
                {
                  q: 'How quickly can I expect a response?',
                  a: 'We typically respond to all inquiries within 24 hours during business days. For urgent matters, please call us directly.'
                },
                {
                  q: 'Can I schedule a property viewing?',
                  a: 'Yes! Use the contact form or call us to schedule a property tour at your convenience.'
                },
                {
                  q: 'Do you offer virtual consultations?',
                  a: 'Absolutely! We offer video calls and virtual property tours for your convenience.'
                },
                {
                  q: 'What information should I include in my inquiry?',
                  a: 'Please include your budget, preferred location, property type, and any specific requirements you have.'
                }
              ].map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl p-6 shadow-md"
                >
                  <h3 className="text-lg font-bold text-charcoal mb-2">{faq.q}</h3>
                  <p className="text-gray-600">{faq.a}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-br from-coral to-coral-dark text-white">
          <div className="container mx-auto px-6 md:px-10 lg:px-20 max-w-[1440px]">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Prefer to Talk?
              </h2>
              <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
                Call us now for immediate assistance from our expert team
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  variant="secondary"
                  className="bg-white text-coral hover:bg-gray-100"
                >
                  <Phone className="mr-2 w-5 h-5" />
                  +91 9876543210
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-white text-white hover:bg-white hover:text-coral"
                >
                  <Mail className="mr-2 w-5 h-5" />
                  info@coventure.in
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
