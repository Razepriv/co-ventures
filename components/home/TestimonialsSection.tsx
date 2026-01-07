'use client';

import React from 'react';
import Image from 'next/image';
import { Quote, Star } from 'lucide-react';
import { Section } from '../ui/Section';
import { Card } from '../ui/Card';
import { mockTestimonials } from '@/lib/mockData';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

export const TestimonialsSection: React.FC = () => {
  return (
    <Section className="py-24 lg:py-32">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-charcoal">
          What Our Customers Say
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
        {mockTestimonials.map((testimonial) => (
          <SwiperSlide key={testimonial.id}>
            <Card className="p-8 h-full">
              <Quote className="w-12 h-12 text-coral/20 mb-6" />
              
              <p className="text-gray-600 italic leading-relaxed mb-6 line-clamp-6">
                "{testimonial.reviewText}"
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
                <div className="w-12 h-12 bg-coral/10 rounded-full flex items-center justify-center">
                  <span className="text-coral font-bold text-lg">
                    {testimonial.customerName.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-charcoal">
                    {testimonial.customerName}
                  </p>
                  <p className="text-sm text-gray-500">
                    {testimonial.propertyType} Owner, {testimonial.location}
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
