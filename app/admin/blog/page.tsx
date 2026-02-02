"use client"

import { useState, useEffect } from 'react'
import { getSupabaseClient } from '@/lib/supabase/client'
import { DataTable } from '@/components/admin/data-table'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Plus, MoreHorizontal, Pencil, Trash2, Eye, FileText, Calendar } from 'lucide-react'
import { ColumnDef } from '@tanstack/react-table'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  featured_image: string | null
  author_id: string
  users: { full_name: string }
  status: 'draft' | 'published'
  published_at: string | null
  views_count: number
  created_at: string
}

const statusConfig = {
  draft: { color: 'bg-gray-100 text-gray-800 border-gray-200', label: 'Draft' },
  published: { color: 'bg-green-100 text-green-800 border-green-200', label: 'Published' },
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ total: 0, published: 0, drafts: 0, totalViews: 0 })

  useEffect(() => {
    fetchPosts()
  }, [])

  async function fetchPosts() {
    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('blog_posts')
        .select(`
          *,
          users (full_name)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      setPosts(data || [])
      
      const total = data?.length || 0
      // @ts-ignore
      const published = data?.filter(p => p.status === 'published').length || 0
      // @ts-ignore
      const drafts = data?.filter(p => p.status === 'draft').length || 0
      // @ts-ignore
      const totalViews = data?.reduce((sum, p) => sum + (p.views_count || 0), 0) || 0
      setStats({ total, published, drafts, totalViews })
    } catch (error) {
      console.error('Error fetching posts:', error)
      toast.error('Failed to load blog posts')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this blog post?')) return

    try {
      const supabase = getSupabaseClient()
      const { error } = await supabase.from('blog_posts').delete().eq('id', id)

      if (error) throw error

      toast.success('Blog post deleted successfully')
      fetchPosts()
    } catch (error) {
      console.error('Error deleting post:', error)
      toast.error('Failed to delete blog post')
    }
  }

  async function toggleStatus(id: string, currentStatus: string) {
    const newStatus = currentStatus === 'published' ? 'draft' : 'published'
    
    try {
      const supabase = getSupabaseClient()
      const updateData: any = { status: newStatus }
      
      if (newStatus === 'published' && !posts.find(p => p.id === id)?.published_at) {
        updateData.published_at = new Date().toISOString()
      }

      const { error } = await supabase
        .from('blog_posts')
        // @ts-ignore
        .update(updateData)
        .eq('id', id)

      if (error) throw error

      toast.success(`Post ${newStatus === 'published' ? 'published' : 'unpublished'} successfully`)
      fetchPosts()
    } catch (error) {
      console.error('Error updating post:', error)
      toast.error('Failed to update post status')
    }
  }

  const columns: ColumnDef<BlogPost>[] = [
    {
      id: 'image',
      header: 'Image',
      cell: ({ row }) => (
        <div className="relative h-16 w-24 rounded-lg overflow-hidden bg-gray-100">
          {row.original.featured_image ? (
            <img
              src={row.original.featured_image}
              alt={row.original.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center">
              <FileText className="h-6 w-6 text-gray-400" />
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'title',
      header: 'Post',
      cell: ({ row }) => (
        <div className="space-y-1 max-w-md">
          <p className="font-medium text-gray-900">{row.original.title}</p>
          <p className="text-sm text-gray-500 line-clamp-2">{row.original.excerpt}</p>
        </div>
      ),
    },
    {
      accessorKey: 'author',
      header: 'Author',
      cell: ({ row }) => (
        <p className="text-sm text-gray-600">{row.original.users?.full_name || 'Unknown'}</p>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const config = statusConfig[row.original.status]
        return (
          <Badge variant="outline" className={config.color}>
            {config.label}
          </Badge>
        )
      },
    },
    {
      accessorKey: 'views_count',
      header: 'Views',
      cell: ({ row }) => (
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <Eye className="h-4 w-4" />
          {row.original.views_count || 0}
        </div>
      ),
    },
    {
      accessorKey: 'published_at',
      header: 'Published',
      cell: ({ row }) => (
        <p className="text-sm text-gray-600">
          {row.original.published_at 
            ? formatDistanceToNow(new Date(row.original.published_at), { addSuffix: true })
            : '—'}
        </p>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => window.open(`/blog/${row.original.slug}`, '_blank')}>
              <Eye className="mr-2 h-4 w-4" />
              View Post
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => toggleStatus(row.original.id, row.original.status)}>
              <Calendar className="mr-2 h-4 w-4" />
              {row.original.status === 'published' ? 'Unpublish' : 'Publish'}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-red-600"
              onClick={() => handleDelete(row.original.id)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Blog</h1>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-coral-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 px-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Blog</h1>
          <p className="mt-1 text-sm text-gray-500">Create and manage blog posts</p>
        </div>
        <Link href="/admin/blog/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Post
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-blue-100 p-3">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Posts</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-green-100 p-3">
              <Calendar className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Published</p>
              <p className="text-2xl font-bold text-gray-900">{stats.published}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-gray-100 p-3">
              <Pencil className="h-6 w-6 text-gray-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Drafts</p>
              <p className="text-2xl font-bold text-gray-900">{stats.drafts}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-purple-100 p-3">
              <Eye className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Views</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalViews}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="rounded-xl border bg-white shadow-sm">
        <DataTable
          columns={columns}
          data={posts}
          searchKey="title"
          searchPlaceholder="Search posts..."
        />
      </div>
    </div>
  )
}
