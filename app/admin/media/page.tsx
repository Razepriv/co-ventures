"use client"

import { useState, useEffect, useRef } from 'react'
import { getSupabaseClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/auth/AuthProvider'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Upload, Image as ImageIcon, FileText, File, Video, Music, MoreHorizontal, Trash2, Download, Eye, Search, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'

interface MediaFile {
  id: string
  name: string
  url: string
  mime_type: string
  file_size: number
  uploaded_by: string
  users: { full_name: string } | null
  created_at: string
}

export default function MediaPage() {
  const { user } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [files, setFiles] = useState<MediaFile[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [stats, setStats] = useState({ total: 0, images: 0, documents: 0, totalSize: 0 })

  useEffect(() => {
    fetchFiles()

    // Set up realtime subscription for media file changes
    const supabase = getSupabaseClient()
    const channel = supabase
      .channel('admin_media_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'media_files' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          toast.success('New file uploaded!')
        } else if (payload.eventType === 'DELETE') {
          toast.info('File deleted')
        }
        fetchFiles()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  async function fetchFiles() {
    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('media_files')
        .select(`
          id,
          name,
          url,
          mime_type,
          file_size,
          uploaded_by,
          created_at,
          users (full_name)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      // @ts-ignore
      setFiles(data || [])
      
      const total = data?.length || 0
      // @ts-ignore
      const images = data?.filter(f => f.mime_type.startsWith('image')).length || 0
      // @ts-ignore
      const documents = data?.filter(f => f.mime_type.includes('pdf') || f.mime_type.includes('document')).length || 0
      // @ts-ignore
      const totalSize = data?.reduce((sum, f) => sum + f.file_size, 0) || 0
      setStats({ total, images, documents, totalSize })
    } catch (error) {
      console.error('Error fetching files:', error)
      toast.error('Failed to load media files')
    } finally {
      setLoading(false)
    }
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(e.target.files || [])
    if (selectedFiles.length === 0) return

    if (!user) {
      toast.error('You must be logged in to upload files')
      return
    }

    setUploading(true)
    const supabase = getSupabaseClient()
    let successCount = 0
    let failCount = 0

    try {
      for (const file of selectedFiles) {
        // Create unique filename
        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
        const filePath = `library/${fileName}`

        // 1. Upload to storage
        const { error: uploadError } = await supabase.storage
          .from('coventures')
          .upload(filePath, file)

        if (uploadError) {
          console.error(`Upload error for ${file.name}:`, uploadError)
          failCount++
          continue
        }

        // 2. Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('coventures')
          .getPublicUrl(filePath)

        // 3. Save record to database
        const { error: dbError } = await supabase
          .from('media_files')
          // @ts-ignore
          .insert({
            name: file.name,
            url: publicUrl,
            mime_type: file.type,
            file_size: file.size,
            uploaded_by: user.id,
            folder: 'library'
          })

        if (dbError) {
          console.error(`Database error for ${file.name}:`, dbError)
          failCount++
          continue
        }

        successCount++
      }

      if (successCount > 0) {
        toast.success(`Successfully uploaded ${successCount} file(s)`)
        fetchFiles()
      }
      if (failCount > 0) {
        toast.error(`Failed to upload ${failCount} file(s)`)
      }
    } catch (error) {
      console.error('Unexpected upload error:', error)
      toast.error('An unexpected error occurred during upload')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  async function handleDelete(id: string, fileUrl: string) {
    if (!confirm('Are you sure you want to delete this file?')) return

    try {
      const supabase = getSupabaseClient()
      
      // Delete from storage
      // The file path in storage is the part after 'coventures/'
      // For library files, it's 'library/filename'
      const urlParts = fileUrl.split('/')
      const fileName = urlParts[urlParts.length - 1]
      const folderName = urlParts[urlParts.length - 2]
      
      if (fileName && folderName) {
        const filePath = `${folderName}/${fileName}`
        await supabase.storage.from('coventures').remove([filePath])
      }

      // Delete from database
      const { error } = await supabase.from('media_files').delete().eq('id', id)

      if (error) throw error

      toast.success('File deleted successfully')
      fetchFiles()
    } catch (error) {
      console.error('Error deleting file:', error)
      toast.error('Failed to delete file')
    }
  }

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image')) return ImageIcon
    if (mimeType.startsWith('video')) return Video
    if (mimeType.startsWith('audio')) return Music
    if (mimeType.includes('pdf') || mimeType.includes('document')) return FileText
    return File
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const filteredFiles = files
    .filter(file => {
      if (searchQuery && !file.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false
      }
      if (filterType !== 'all') {
        if (filterType === 'images' && !file.mime_type.startsWith('image')) return false
        if (filterType === 'documents' && !file.mime_type.includes('pdf') && !file.mime_type.includes('document')) return false
        if (filterType === 'videos' && !file.mime_type.startsWith('video')) return false
      }
      return true
    })

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Media Library</h1>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-coral-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 px-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Media Library</h1>
          <p className="mt-1 text-sm text-gray-500">Upload and manage media files</p>
        </div>
        <div className="flex gap-2">
          <input
            type="file"
            multiple
            className="hidden"
            ref={fileInputRef}
            onChange={handleUpload}
          />
          <Button 
            className="gap-2" 
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            {uploading ? 'Uploading...' : 'Upload Files'}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-blue-100 p-3">
              <File className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Files</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-purple-100 p-3">
              <ImageIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Images</p>
              <p className="text-2xl font-bold text-gray-900">{stats.images}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-green-100 p-3">
              <FileText className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Documents</p>
              <p className="text-2xl font-bold text-gray-900">{stats.documents}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-amber-100 p-3">
              <Upload className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Storage</p>
              <p className="text-2xl font-bold text-gray-900">{formatFileSize(stats.totalSize)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button 
            variant={filterType === 'all' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilterType('all')}
          >
            All
          </Button>
          <Button 
            variant={filterType === 'images' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilterType('images')}
          >
            Images
          </Button>
          <Button 
            variant={filterType === 'documents' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilterType('documents')}
          >
            Documents
          </Button>
          <Button 
            variant={filterType === 'videos' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilterType('videos')}
          >
            Videos
          </Button>
        </div>
      </div>

      {/* Files Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {filteredFiles.map((file) => {
          const Icon = getFileIcon(file.mime_type)
          const isImage = file.mime_type.startsWith('image')

          return (
            <div
              key={file.id}
              className="group relative rounded-xl border bg-white p-4 hover:shadow-md transition-all"
            >
              {/* File Preview */}
              <div className="aspect-square rounded-lg bg-gray-100 mb-3 overflow-hidden flex items-center justify-center">
                {isImage ? (
                  <img
                    src={file.url}
                    alt={file.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Icon className="h-12 w-12 text-gray-400" />
                )}
              </div>

              {/* File Info */}
              <div className="space-y-1">
                <p className="font-medium text-sm text-gray-900 truncate">{file.name}</p>
                <p className="text-xs text-gray-500">{formatFileSize(file.file_size)}</p>
                <p className="text-xs text-gray-400">
                  {formatDistanceToNow(new Date(file.created_at), { addSuffix: true })}
                </p>
              </div>

              {/* Actions Menu */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 bg-white shadow-sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => window.open(file.url, '_blank')}>
                      <Eye className="mr-2 h-4 w-4" />
                      View
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => window.open(file.url, '_blank')}>
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="text-red-600"
                      onClick={() => handleDelete(file.id, file.url)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          )
        })}
      </div>

      {filteredFiles.length === 0 && (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <ImageIcon className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No files found</h3>
          <p className="text-sm text-gray-500 mb-4">
            {searchQuery || filterType !== 'all' 
              ? 'Try adjusting your search or filters'
              : 'Upload your first file to get started'}
          </p>
          {!searchQuery && filterType === 'all' && (
            <Button 
              className="gap-2"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              {uploading ? 'Uploading...' : 'Upload Files'}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
