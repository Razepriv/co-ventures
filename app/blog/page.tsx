'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Button } from '@/components/ui/Button'
import { PageBanner } from '@/components/ui/PageBanner'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Search, Calendar, User, ArrowRight, Clock } from 'lucide-react'
import { getSupabaseClient } from '@/lib/supabase/client'
import { formatDistanceToNow } from 'date-fns'

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  featured_image: string
  published_at: string
  read_time: number
  views_count: number
  author_id: string
  users: {
    full_name: string
  }
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [featuredPost, setFeaturedPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchPosts()
  }, [])

  async function fetchPosts() {
    try {
      setLoading(true)
      const supabase = getSupabaseClient()

      const { data, error } = await supabase
        .from('blog_posts')
        .select('*, users(full_name)')
        .eq('status', 'published')
        .not('published_at', 'is', null)
        .order('published_at', { ascending: false })

      if (error) throw error

      if (data && data.length > 0) {
        setFeaturedPost(data[0])
        setPosts(data.slice(1))
      }
    } catch (error) {
      console.error('Error fetching posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.excerpt?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const categories = [
    'All',
    'Co-Housing Tips',
    'Market Insights',
    'Investment Guide',
    'Legal Advice',
    'Success Stories'
  ]

  return (
    <>
      <Header />
      <main className="pt-20">
        {/* Banner */}
        <PageBanner
          title="Blog & Insights"
          subtitle="Expert advice, market trends, and success stories from the world of co-housing"
          imageSrc="https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=1920&q=80"
        />

        {/* Search Bar */}
        <section className="py-8 bg-white border-b">
          <div className="container mx-auto px-6 md:px-10 lg:px-20 max-w-[1440px]">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="max-w-2xl mx-auto"
            >
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-14 text-base bg-white"
                />
              </div>
            </motion.div>
          </div>
        </section>

        {/* Categories */}
        <section className="py-8 bg-white border-b">
          <div className="container mx-auto px-6 md:px-10 lg:px-20 max-w-[1440px]">
            <div className="flex gap-3 overflow-x-auto pb-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant="outline"
                  className="whitespace-nowrap hover:bg-coral hover:text-white hover:border-coral"
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </section>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coral"></div>
          </div>
        ) : (
          <>
            {/* Featured Post */}
            {featuredPost && (
              <section className="py-16 bg-gray-50">
                <div className="container mx-auto px-6 md:px-10 lg:px-20 max-w-[1440px]">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                  >
                    <Link href={`/blog/${featuredPost.slug}`}>
                      <div className="grid lg:grid-cols-2 gap-8 bg-white rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-shadow">
                        <div className="relative h-[400px] lg:h-auto">
                          <Image
                            src={featuredPost.featured_image || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80'}
                            alt={featuredPost.title}
                            fill
                            className="object-cover"
                          />
                          <div className="absolute top-6 left-6">
                            <Badge className="bg-amber-500 text-white text-sm px-4 py-2">
                              Featured
                            </Badge>
                          </div>
                        </div>
                        <div className="p-8 lg:p-12 flex flex-col justify-center">
                          <h2 className="text-3xl md:text-4xl font-bold text-charcoal mb-4 hover:text-coral transition-colors">
                            {featuredPost.title}
                          </h2>
                          <p className="text-gray-600 text-lg leading-relaxed mb-6 line-clamp-3">
                            {featuredPost.excerpt}
                          </p>
                          <div className="flex items-center gap-6 text-gray-500 mb-6">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4" />
                              <span className="text-sm">{featuredPost.users?.full_name || 'Admin'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              <span className="text-sm">
                                {formatDistanceToNow(new Date(featuredPost.published_at), { addSuffix: true })}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              <span className="text-sm">{featuredPost.read_time || 5} min read</span>
                            </div>
                          </div>
                          <Button className="w-fit group">
                            Read More
                            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </Button>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                </div>
              </section>
            )}

            {/* Blog Grid */}
            <section className="py-16 bg-white">
              <div className="container mx-auto px-6 md:px-10 lg:px-20 max-w-[1440px]">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="mb-12"
                >
                  <h2 className="text-3xl font-bold text-charcoal mb-2">Latest Articles</h2>
                  <p className="text-gray-600">
                    Showing {filteredPosts.length} article{filteredPosts.length !== 1 ? 's' : ''}
                  </p>
                </motion.div>

                {filteredPosts.length === 0 ? (
                  <div className="text-center py-16">
                    <p className="text-xl text-gray-600 mb-4">
                      {searchQuery ? 'No articles found matching your search' : 'No articles published yet'}
                    </p>
                    {searchQuery && (
                      <Button onClick={() => setSearchQuery('')}>Clear Search</Button>
                    )}
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredPosts.map((post, index) => (
                      <motion.div
                        key={post.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Link href={`/blog/${post.slug}`}>
                          <article className="group bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 h-full flex flex-col">
                            {/* Image */}
                            <div className="relative h-56 overflow-hidden">
                              <Image
                                src={post.featured_image || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80'}
                                alt={post.title}
                                fill
                                className="object-cover group-hover:scale-110 transition-transform duration-500"
                              />
                            </div>

                            {/* Content */}
                            <div className="p-6 flex-1 flex flex-col">
                              <h3 className="text-xl font-bold text-charcoal mb-3 group-hover:text-coral transition-colors line-clamp-2">
                                {post.title}
                              </h3>

                              <p className="text-gray-600 mb-4 line-clamp-3 flex-1">
                                {post.excerpt}
                              </p>

                              <div className="flex items-center justify-between pt-4 border-t">
                                <div className="flex items-center gap-2 text-gray-500 text-sm">
                                  <User className="w-4 h-4" />
                                  <span>{post.users?.full_name || 'Admin'}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-500 text-sm">
                                  <Clock className="w-4 h-4" />
                                  <span>{post.read_time || 5} min</span>
                                </div>
                              </div>

                              <div className="mt-4 text-sm text-gray-400">
                                {formatDistanceToNow(new Date(post.published_at), { addSuffix: true })}
                              </div>
                            </div>
                          </article>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Load More */}
                {filteredPosts.length > 0 && filteredPosts.length % 9 === 0 && (
                  <div className="text-center mt-12">
                    <Button size="lg" variant="outline">
                      Load More Articles
                    </Button>
                  </div>
                )}
              </div>
            </section>
          </>
        )}

        {/* Newsletter Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-6 md:px-10 lg:px-20 max-w-[1440px]">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-coral to-coral-dark rounded-2xl p-12 text-center text-white"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Subscribe to Our Newsletter
              </h2>
              <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
                Get the latest articles, market insights, and co-housing tips delivered to your inbox
              </p>
              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 h-12 bg-white text-charcoal"
                />
                <Button
                  size="lg"
                  variant="secondary"
                  className="bg-white text-coral hover:bg-gray-100 whitespace-nowrap"
                >
                  Subscribe
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Topics Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-6 md:px-10 lg:px-20 max-w-[1440px]">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold text-charcoal mb-4">Popular Topics</h2>
              <p className="text-gray-600">Explore articles by category</p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: 'Co-Housing Tips',
                  count: 24,
                  color: 'bg-blue-100 text-blue-600'
                },
                {
                  title: 'Market Insights',
                  count: 18,
                  color: 'bg-green-100 text-green-600'
                },
                {
                  title: 'Investment Guide',
                  count: 15,
                  color: 'bg-purple-100 text-purple-600'
                },
                {
                  title: 'Legal Advice',
                  count: 12,
                  color: 'bg-amber-100 text-amber-600'
                },
                {
                  title: 'Success Stories',
                  count: 20,
                  color: 'bg-coral-light text-coral'
                },
                {
                  title: 'Property Reviews',
                  count: 16,
                  color: 'bg-indigo-100 text-indigo-600'
                }
              ].map((topic, index) => (
                <motion.div
                  key={topic.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-shadow cursor-pointer"
                >
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${topic.color} mb-4`}>
                    <span className="text-2xl font-bold">{topic.count}</span>
                  </div>
                  <h3 className="text-xl font-bold text-charcoal mb-2">{topic.title}</h3>
                  <p className="text-gray-600">{topic.count} articles</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-6 md:px-10 lg:px-20 max-w-[1440px]">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-charcoal mb-4">
                Ready to Start Your Co-Housing Journey?
              </h2>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                Explore our properties or get in touch with our experts
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/properties">
                  <Button size="lg">
                    Browse Properties
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button size="lg" variant="outline">
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
