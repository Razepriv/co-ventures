'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Clock } from 'lucide-react';
import { Section } from '../ui/Section';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { mockBlogPosts } from '@/lib/mockData';
import { formatDate } from '@/lib/utils';

export const SuccessStoriesSection: React.FC = () => {
  const stories = mockBlogPosts.filter(post => post.category === 'Success Stories' || post.featured);

  return (
    <Section className="py-24 lg:py-32">
      <div className="text-center mb-16">
        <p className="text-coral text-xs font-semibold tracking-widest uppercase mb-4">
          CUSTOMER SUCCESS STORIES
        </p>
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-charcoal">
          Real Stories, Real Transformations
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {stories.slice(0, 3).map((story) => (
          <Card key={story.id} hover className="overflow-hidden">
            <Link href={`/blog/${story.id}`}>
              {/* Image */}
              <div className="relative h-56 overflow-hidden">
                <Image
                  src={story.featuredImage}
                  alt={story.title}
                  fill
                  className="object-cover transition-transform duration-500 hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 hover:opacity-100 transition-opacity" />
                
                <div className="absolute top-4 left-4">
                  <Badge variant="coral">{story.category}</Badge>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-charcoal mb-3 line-clamp-2 hover:text-coral transition-colors">
                  {story.title}
                </h3>

                <p className="text-gray-600 mb-4 line-clamp-3">
                  {story.excerpt}
                </p>

                <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
                  <span>{formatDate(story.publishDate)}</span>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{story.readTime} min read</span>
                  </div>
                </div>

                <span className="text-coral text-sm font-medium inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                  Read Story
                  <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </Link>
          </Card>
        ))}
      </div>
    </Section>
  );
};
