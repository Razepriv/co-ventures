'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Quote, Star } from 'lucide-react';
import { Section } from '../ui/Section';
import { Card } from '../ui/Card';
import { getSupabaseClient } from '@/lib/supabase/client';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

interface Testimonial {
  id: string;
  full_name: string;
  role: string | null;
  company: string | null;
  avatar_url: string | null;
  rating: number;
  content: string;
  is_featured: boolean;
  is_approved: boolean;
}

export const TestimonialsSection: React.FC = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  async function fetchTestimonials() {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .eq('is_approved', true)
        .eq('is_featured', true)
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) throw error;
      setTestimonials(data || []);
    } catch (error) {
      console.error('Error fetching testimonials:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <Section className="py-24 lg:py-32">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coral"></div>
        </div>
      </Section>
    );
  }

  if (testimonials.length === 0) return null;
  return (
    <Section className="py-24 lg:py-32">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-charcoal">
          What Partners Say
        </h2>
      </div>

      <Swiper
        modules={[Autoplay, Pagination]}
        spaceBetween={32}
        slidesPerView={1}
        pagination={{ clickable: true }}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        breakpoints={{
          640: { slidesPerView: 1 },
          768: { slidesPerView: 2 },
          1024: { slidesPerView: 3 },
        }}
        className="!pb-12"
      >
        {testimonials.map((testimonial) => (
          <SwiperSlide key={testimonial.id}>
            <Card className="p-8 h-full">
              <Quote className="w-12 h-12 text-coral/20 mb-6" />
              
              <p className="text-gray-600 italic leading-relaxed mb-6 line-clamp-6">
                &quot;{testimonial.content}&quot;
              </p>

              <div className="flex gap-1 mb-6">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star
                    key={index}
                    className={`w-4 h-4 ${
                      index < testimonial.rating
                        ? 'fill-coral text-coral'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-4">
                {testimonial.avatar_url ? (
                  <Image
                    src={testimonial.avatar_url}
                    alt={testimonial.full_name}
                    width={48}
                    height={48}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 bg-coral/10 rounded-full flex items-center justify-center">
                    <span className="text-coral font-bold text-lg">
                      {testimonial.full_name.charAt(0)}
                    </span>
                  </div>
                )}
                <div>
                  <p className="font-semibold text-charcoal">
                    {testimonial.full_name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {testimonial.role}
                    {testimonial.company && ` • ${testimonial.company}`}
                  </p>
                </div>
              </div>
            </Card>
          </SwiperSlide>
        ))}
      </Swiper>

      <style jsx global>{`
        .swiper-pagination-bullet {
          background: #D9D9D9;
          opacity: 1;
        }
        .swiper-pagination-bullet-active {
          background: #FF6B4A;
        }
      `}</style>
    </Section>
  );
};
