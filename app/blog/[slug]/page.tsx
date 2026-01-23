'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Calendar, User, Clock, ArrowLeft, Share2, Facebook, Twitter, Linkedin, Copy, Check } from 'lucide-react'
import { getSupabaseClient } from '@/lib/supabase/client'
import { formatDistanceToNow, format } from 'date-fns'
import { toast } from 'sonner'

interface BlogPost {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string
  featured_image: string
  published_at: string
  read_time: number
  views_count: number
  meta_title: string
  meta_description: string
  users: {
    full_name?: string
    avatar_url?: string
  }
}

interface RelatedPost {
  id: string
  title: string
  slug: string
  excerpt: string
  featured_image: string
  published_at: string
  read_time: number
}

export default function BlogDetailPage({ params }: { params: { slug: string } }) {
  const [post, setPost] = useState<BlogPost | null>(null)
  const [relatedPosts, setRelatedPosts] = useState<RelatedPost[]>([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetchPost()
  }, [params.slug])

  async function fetchPost() {
    try {
      setLoading(true)
      const supabase = getSupabaseClient()

      // Fetch the post
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*, users(full_name, avatar_url)')
        .eq('slug', params.slug)
        .eq('status', 'published')
        .single()

      if (error) throw error

      const postData = data as BlogPost
      setPost(postData)

      // Increment views
      if (postData) {
        const postId = postData.id
        const viewsCount = postData.views_count || 0
        
        await supabase
          .from('blog_posts')
          // @ts-expect-error - Supabase type inference
          .update({ views_count: viewsCount + 1 })
          .eq('id', postId)

        // Fetch related posts
        const { data: related } = await supabase
          .from('blog_posts')
          .select('id, title, slug, excerpt, featured_image, published_at, read_time')
          .eq('status', 'published')
          .neq('id', postId)
          .not('published_at', 'is', null)
          .order('published_at', { ascending: false })
          .limit(3)

        setRelatedPosts(related || [])
      }
    } catch (error) {
      console.error('Error fetching post:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleShare = async (platform: string) => {
    const url = window.location.href
    const title = post?.title || ''

    switch (platform) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank')
        break
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`, '_blank')
        break
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank')
        break
      case 'copy':
        await navigator.clipboard.writeText(url)
        setCopied(true)
        toast.success('Link copied to clipboard!')
        setTimeout(() => setCopied(false), 2000)
        break
    }
  }

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coral"></div>
        </div>
      </>
    )
  }

  if (!post) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-charcoal mb-4">Article Not Found</h1>
            <p className="text-gray-600 mb-6">The article you're looking for doesn't exist or has been removed.</p>
            <Link href="/blog">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Blog
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative h-[60vh] min-h-[400px] flex items-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <Image
              src={post.featured_image || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1920&q=80'}
              alt={post.title}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30" />
          </div>
          
          <div className="container mx-auto px-6 md:px-10 lg:px-20 max-w-[1440px] relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Link href="/blog" className="inline-flex items-center text-white/80 hover:text-white mb-6 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Blog
              </Link>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 max-w-4xl leading-tight">
                {post.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-6 text-white/80">
                <div className="flex items-center gap-3">
                  {post.users?.full_name ? (
                    <>
                      {post.users?.avatar_url ? (
                        <Image
                          src={post.users.avatar_url}
                          alt={post.users.full_name}
                          width={40}
                          height={40}
                          className="rounded-full"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-coral flex items-center justify-center text-white font-semibold">
                          {post.users?.full_name?.[0] || 'A'}
                        </div>
                      )}
                      <span className="font-medium">{post.users.full_name}</span>
                    </>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-coral flex items-center justify-center text-white font-semibold">
                      A
                    </div>
                  )}
                </div>
                                
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{format(new Date(post.published_at), 'MMM d, yyyy')}</span>
                </div>
                                
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{post.read_time || 5} min read</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-6 md:px-10 lg:px-20 max-w-[1440px]">
            <div className="grid lg:grid-cols-4 gap-12">
              {/* Main Content */}
              <motion.article
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="lg:col-span-3"
              >
                {/* Excerpt */}
                {post.excerpt && (
                  <p className="text-xl text-gray-600 leading-relaxed mb-8 border-l-4 border-coral pl-6">
                    {post.excerpt}
                  </p>
                )}

                {/* Blog Content */}
                <div 
                  className="prose prose-lg max-w-none prose-headings:text-charcoal prose-p:text-gray-600 prose-a:text-coral prose-strong:text-charcoal prose-img:rounded-xl"
                  dangerouslySetInnerHTML={{ __html: post.content || '' }}
                />

                {/* Share Section */}
                <div className="mt-12 pt-8 border-t">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <h4 className="font-semibold text-charcoal mb-2">Share this article</h4>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleShare('facebook')}
                          className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-colors"
                        >
                          <Facebook className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleShare('twitter')}
                          className="w-10 h-10 rounded-full bg-sky-500 text-white flex items-center justify-center hover:bg-sky-600 transition-colors"
                        >
                          <Twitter className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleShare('linkedin')}
                          className="w-10 h-10 rounded-full bg-blue-700 text-white flex items-center justify-center hover:bg-blue-800 transition-colors"
                        >
                          <Linkedin className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleShare('copy')}
                          className="w-10 h-10 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center hover:bg-gray-300 transition-colors"
                        >
                          {copied ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                    
                    <Link href="/blog">
                      <Button variant="outline">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to All Articles
                      </Button>
                    </Link>
                  </div>
                </div>
              </motion.article>

              {/* Sidebar */}
              <motion.aside
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="lg:col-span-1"
              >
                <div className="sticky top-24 space-y-8">
                  {/* Author Card */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h4 className="font-semibold text-charcoal mb-4">About the Author</h4>
                    <div className="flex items-center gap-3">
                      {post.users?.full_name ? (
                        <>
                          {post.users?.avatar_url ? (
                            <Image
                              src={post.users.avatar_url}
                              alt={post.users.full_name}
                              width={48}
                              height={48}
                              className="rounded-full"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-coral flex items-center justify-center text-white font-bold text-lg">
                              {post.users?.full_name?.[0] || 'A'}
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-charcoal">{post.users.full_name || 'Admin'}</p>
                            <p className="text-sm text-gray-500">Content Writer</p>
                          </div>
                        </>
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-coral flex items-center justify-center text-white font-bold text-lg">
                          A
                        </div>
                      )}
                    </div>
                  </div>

                  {/* CTA Card */}
                  <div className="bg-gradient-to-br from-coral to-coral-dark rounded-xl p-6 text-white">
                    <h4 className="font-bold text-lg mb-2">Ready to Invest?</h4>
                    <p className="text-white/90 text-sm mb-4">
                      Explore our curated co-housing properties and start your investment journey today.
                    </p>
                    <Link href="/properties">
                      <Button className="w-full bg-white text-coral hover:bg-gray-100">
                        Browse Properties
                      </Button>
                    </Link>
                  </div>
                </div>
              </motion.aside>
            </div>
          </div>
        </section>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="py-16 bg-gray-50">
            <div className="container mx-auto px-6 md:px-10 lg:px-20 max-w-[1440px]">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl font-bold text-charcoal mb-8">Related Articles</h2>
                
                <div className="grid md:grid-cols-3 gap-8">
                  {relatedPosts.map((relatedPost, index) => (
                    <motion.div
                      key={relatedPost.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link href={`/blog/${relatedPost.slug}`}>
                        <article className="group bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 h-full flex flex-col">
                          <div className="relative h-48 overflow-hidden">
                            <Image
                              src={relatedPost.featured_image || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80'}
                              alt={relatedPost.title}
                              fill
                              className="object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                          </div>
                          <div className="p-6 flex-1 flex flex-col">
                            <h3 className="text-lg font-bold text-charcoal mb-2 group-hover:text-coral transition-colors line-clamp-2">
                              {relatedPost.title}
                            </h3>
                            <p className="text-gray-600 text-sm line-clamp-2 flex-1">
                              {relatedPost.excerpt}
                            </p>
                            <div className="flex items-center gap-2 text-gray-400 text-xs mt-4">
                              <Clock className="w-3 h-3" />
                              <span>{relatedPost.read_time || 5} min read</span>
                            </div>
                          </div>
                        </article>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  )
}
