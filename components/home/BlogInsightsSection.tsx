'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Clock } from 'lucide-react';
import { Section } from '../ui/Section';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { getSupabaseClient } from '@/lib/supabase/client';
import { formatDate } from '@/lib/utils';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  featured_image: string;
  published_at: string;
  read_time: number;
  users: { full_name?: string };
}

export const BlogInsightsSection: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts() {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*, users(full_name)')
        .eq('status', 'published')
        .not('published_at', 'is', null)
        .order('published_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <Section background="peach" className="py-24 lg:py-32">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coral"></div>
        </div>
      </Section>
    );
  }

  if (posts.length === 0) return null;

  const featuredPost = posts[0];
  const otherPosts = posts.slice(1, 3);

  return (
    <Section background="peach" className="py-24 lg:py-32">
      <div className="flex justify-between items-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-charcoal">
          Insights & Research
        </h2>
        <Link
          href="/blog"
          className="text-coral hover:text-coral-dark font-medium inline-flex items-center gap-2 group"
        >
          View All Articles
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        {/* Featured Post - Large */}
        {featuredPost && (
          <div className="lg:col-span-3">
            <Card hover className="overflow-hidden h-full">
              <Link href={`/blog/${featuredPost.slug}`}>
                <div className="relative h-80 overflow-hidden">
                  <Image
                    src={featuredPost.featured_image || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80'}
                    alt={featuredPost.title}
                    fill
                    className="object-cover transition-transform duration-500 hover:scale-110"
                  />
                </div>

                <div className="p-6">
                  <Badge variant="peach">Featured</Badge>
                  
                  <h3 className="text-2xl font-bold text-charcoal mt-4 mb-3 hover:text-coral transition-colors">
                    {featuredPost.title}
                  </h3>

                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {featuredPost.excerpt}
                  </p>

                  <div className="flex items-center gap-3 text-sm text-gray-400 mb-4">
                    <span>By {featuredPost.users?.full_name || 'Admin'}</span>
                    <span>•</span>
                    <span>{formatDate(featuredPost.published_at)}</span>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{featuredPost.read_time || 5} min read</span>
                    </div>
                  </div>

                  <span className="text-coral text-sm font-medium inline-flex items-center gap-1">
                    Read Article
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </Link>
            </Card>
          </div>
        )}

        {/* Other Posts - Smaller */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          {otherPosts.map((post) => (
            <Card key={post.id} hover className="overflow-hidden">
              <Link href={`/blog/${post.slug}`}>
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={post.featured_image || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80'}
                    alt={post.title}
                    fill
                    className="object-cover transition-transform duration-500 hover:scale-110"
                  />
                </div>

                <div className="p-6">
                  <Badge variant="peach">Insights</Badge>
                  
                  <h3 className="text-lg font-bold text-charcoal mt-3 mb-2 line-clamp-2 hover:text-coral transition-colors">
                    {post.title}
                  </h3>

                  <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
                    <span>{formatDate(post.published_at)}</span>
                    <span>•</span>
                    <span>{post.read_time || 5} min read</span>
                  </div>

                  <span className="text-coral text-sm font-medium inline-flex items-center gap-1">
                    Read Article
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </Link>
            </Card>
          ))}
        </div>
      </div>
    </Section>
  );
};
