"use client"

import { useState, useEffect } from 'react'
import { getSupabaseClient } from '@/lib/supabase/client'
import { DataTable } from '@/components/admin/data-table'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, MoreHorizontal, Pencil, Trash2, Shield, User, Crown } from 'lucide-react'
import { ColumnDef } from '@tanstack/react-table'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'

interface User {
  id: string
  email: string
  full_name: string
  role: 'user' | 'admin' | 'super_admin'
  phone: string | null
  avatar_url: string | null
  created_at: string
  last_login: string | null
}

const roleConfig = {
  user: { color: 'bg-gray-100 text-gray-800 border-gray-200', icon: User, label: 'User' },
  admin: { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: Shield, label: 'Admin' },
  super_admin: { color: 'bg-purple-100 text-purple-800 border-purple-200', icon: Crown, label: 'Super Admin' },
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ total: 0, admins: 0, users: 0 })
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    fetchUsers()

    // Set up realtime subscription for user changes
    const supabase = getSupabaseClient()
    const channel = supabase
      .channel('admin_users_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          toast.success('New user registered!')
        } else if (payload.eventType === 'UPDATE') {
          toast.info('User updated')
        }
        fetchUsers()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  async function fetchUsers() {
    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      setUsers(data || [])

      const total = data?.length || 0
      // @ts-ignore
      const admins = data?.filter(u => u.role === 'admin' || u.role === 'super_admin').length || 0
      // @ts-ignore
      const regularUsers = data?.filter(u => u.role === 'user').length || 0
      setStats({ total, admins, users: regularUsers })
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  async function handleUpdateRole(userId: string, newRole: string) {
    try {
      const supabase = getSupabaseClient()
      const { error } = await supabase
        .from('users')
        // @ts-ignore
        .update({ role: newRole })
        .eq('id', userId)

      if (error) throw error

      toast.success('User role updated successfully')
      fetchUsers()
    } catch (error) {
      console.error('Error updating role:', error)
      toast.error('Failed to update user role')
    }
  }

  async function handleDelete(userId: string) {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return

    try {
      const supabase = getSupabaseClient()
      const { error } = await supabase.from('users').delete().eq('id', userId)

      if (error) throw error

      toast.success('User deleted successfully')
      fetchUsers()
    } catch (error) {
      console.error('Error deleting user:', error)
      toast.error('Failed to delete user')
    }
  }

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: 'full_name',
      header: 'User',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-coral-400 to-coral-600 flex items-center justify-center text-white font-semibold">
            {row.original.full_name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <p className="font-medium text-gray-900">{row.original.full_name || 'No name'}</p>
            <p className="text-sm text-gray-500">{row.original.email}</p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'phone',
      header: 'Phone',
      cell: ({ row }) => (
        <p className="text-sm text-gray-600">{row.original.phone || '—'}</p>
      ),
    },
    {
      accessorKey: 'role',
      header: 'Role',
      cell: ({ row }) => {
        const config = roleConfig[row.original.role]
        const Icon = config.icon
        return (
          <Badge variant="outline" className={config.color}>
            <Icon className="mr-1 h-3 w-3" />
            {config.label}
          </Badge>
        )
      },
    },
    {
      accessorKey: 'created_at',
      header: 'Joined',
      cell: ({ row }) => (
        <p className="text-sm text-gray-600">
          {formatDistanceToNow(new Date(row.original.created_at), { addSuffix: true })}
        </p>
      ),
    },
    {
      accessorKey: 'last_login',
      header: 'Last Login',
      cell: ({ row }) => (
        <p className="text-sm text-gray-600">
          {row.original.last_login
            ? formatDistanceToNow(new Date(row.original.last_login), { addSuffix: true })
            : 'Never'}
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
            <DropdownMenuLabel>Change Role</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => handleUpdateRole(row.original.id, 'user')}>
              <User className="mr-2 h-4 w-4" />
              Make User
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleUpdateRole(row.original.id, 'admin')}>
              <Shield className="mr-2 h-4 w-4" />
              Make Admin
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleUpdateRole(row.original.id, 'super_admin')}>
              <Crown className="mr-2 h-4 w-4" />
              Make Super Admin
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
        <h1 className="text-3xl font-bold text-gray-900">Users</h1>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-coral-600"></div>
        </div>
      </div>
    )
  }

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    role: 'user'
  })

  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault()

    // Basic client-side validation
    if (!formData.email || !formData.password || !formData.full_name) {
      toast.error('Please fill in all required fields')
      return
    }

    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }

    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create user')
      }

      toast.success('User created successfully')
      setIsDialogOpen(false)
      setFormData({ email: '', password: '', full_name: '', role: 'user' }) // Reset form
      fetchUsers()
    } catch (error: any) {
      console.error('Error creating user:', error)
      toast.error(error.message)
    }
  }

  return (
    <div className="space-y-6 px-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Users</h1>
          <p className="mt-1 text-sm text-gray-500">Manage user accounts and permissions</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>
                Create a new user account with a specific role.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="John Doe"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="john@example.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => setFormData({ ...formData, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="super_admin">Super Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button type="submit">Create User</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-blue-100 p-3">
              <User className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-purple-100 p-3">
              <Shield className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Admins</p>
              <p className="text-2xl font-bold text-gray-900">{stats.admins}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-gray-100 p-3">
              <User className="h-6 w-6 text-gray-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Regular Users</p>
              <p className="text-2xl font-bold text-gray-900">{stats.users}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="rounded-xl border bg-white shadow-sm">
        <DataTable
          columns={columns}
          data={users}
          searchKey="full_name"
          searchPlaceholder="Search users..."
        />
      </div>
    </div>
  )
}
