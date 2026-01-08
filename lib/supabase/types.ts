/**
 * Database type definitions for Supabase
 * These will be auto-generated once you run: npx supabase gen types typescript
 * For now, we define the structure manually based on the PRD
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          phone: string | null
          role: 'user' | 'admin' | 'super_admin'
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          phone?: string | null
          role?: 'user' | 'admin' | 'super_admin'
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          phone?: string | null
          role?: 'user' | 'admin' | 'super_admin'
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          icon: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          icon?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          icon?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      properties: {
        Row: {
          id: string
          user_id: string
          category_id: string
          title: string
          description: string
          location: string
          latitude: number
          longitude: number
          price: number
          bedrooms: number
          bathrooms: number
          area_sqft: number
          featured_image: string
          status: 'available' | 'pending' | 'sold' | 'draft'
          is_featured: boolean
          property_type: string
          amenities: string[]
          views: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          category_id: string
          title: string
          description: string
          location: string
          latitude: number
          longitude: number
          price: number
          bedrooms: number
          bathrooms: number
          area_sqft: number
          featured_image: string
          status?: 'available' | 'pending' | 'sold' | 'draft'
          is_featured?: boolean
          property_type: string
          amenities?: string[]
          views?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          category_id?: string
          title?: string
          description?: string
          location?: string
          latitude?: number
          longitude?: number
          price?: number
          bedrooms?: number
          bathrooms?: number
          area_sqft?: number
          featured_image?: string
          status?: 'available' | 'pending' | 'sold' | 'draft'
          is_featured?: boolean
          property_type?: string
          amenities?: string[]
          views?: number
          created_at?: string
          updated_at?: string
        }
      }
      property_images: {
        Row: {
          id: string
          property_id: string
          url: string
          alt_text: string | null
          order_index: number
          created_at: string
        }
        Insert: {
          id?: string
          property_id: string
          url: string
          alt_text?: string | null
          order_index?: number
          created_at?: string
        }
        Update: {
          id?: string
          property_id?: string
          url?: string
          alt_text?: string | null
          order_index?: number
          created_at?: string
        }
      }
      enquiries: {
        Row: {
          id: string
          property_id: string
          user_id: string | null
          name: string
          email: string
          phone: string
          message: string
          status: 'new' | 'in_progress' | 'closed'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          property_id: string
          user_id?: string | null
          name: string
          email: string
          phone: string
          message: string
          status?: 'new' | 'in_progress' | 'closed'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          property_id?: string
          user_id?: string | null
          name?: string
          email?: string
          phone?: string
          message?: string
          status?: 'new' | 'in_progress' | 'closed'
          created_at?: string
          updated_at?: string
        }
      }
      saved_properties: {
        Row: {
          id: string
          user_id: string
          property_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          property_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          property_id?: string
          created_at?: string
        }
      }
      newsletter_subscribers: {
        Row: {
          id: string
          email: string
          subscribed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          subscribed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          subscribed?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      blog_posts: {
        Row: {
          id: string
          author_id: string
          title: string
          slug: string
          excerpt: string
          content: string
          featured_image: string
          category: string
          tags: string[]
          published: boolean
          status: 'draft' | 'published'
          views: number
          views_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          author_id: string
          title: string
          slug: string
          excerpt: string
          content: string
          featured_image: string
          category: string
          tags?: string[]
          published?: boolean
          status?: 'draft' | 'published'
          views?: number
          views_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          author_id?: string
          title?: string
          slug?: string
          excerpt?: string
          content?: string
          featured_image?: string
          category?: string
          tags?: string[]
          published?: boolean
          status?: 'draft' | 'published'
          views?: number
          views_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      testimonials: {
        Row: {
          id: string
          user_id: string | null
          name: string
          role: string | null
          company: string | null
          content: string
          rating: number
          avatar_url: string | null
          featured: boolean
          approved: boolean
          is_featured: boolean
          is_approved: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          name: string
          role?: string | null
          company?: string | null
          content: string
          rating: number
          avatar_url?: string | null
          featured?: boolean
          approved?: boolean
          is_featured?: boolean
          is_approved?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          name?: string
          role?: string | null
          company?: string | null
          content?: string
          rating?: number
          avatar_url?: string | null
          featured?: boolean
          approved?: boolean
          is_featured?: boolean
          is_approved?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      contact_messages: {
        Row: {
          id: string
          name: string
          full_name: string
          email: string
          phone: string | null
          subject: string
          message: string
          inquiry_type: string
          status: 'new' | 'in_progress' | 'resolved'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name?: string
          full_name?: string
          email: string
          phone?: string | null
          subject?: string
          message: string
          inquiry_type?: string
          status?: 'new' | 'in_progress' | 'resolved'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          full_name?: string
          email?: string
          phone?: string | null
          subject?: string
          message?: string
          inquiry_type?: string
          status?: 'new' | 'in_progress' | 'resolved'
          created_at?: string
          updated_at?: string
        }
      }
      cohousing_interests: {
        Row: {
          id: string
          user_id: string | null
          name: string
          email: string
          phone: string
          location_preference: string
          budget_range: string
          move_in_timeline: string
          household_size: number
          message: string | null
          status: 'new' | 'contacted' | 'qualified' | 'converted'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          name: string
          email: string
          phone: string
          location_preference: string
          budget_range: string
          move_in_timeline: string
          household_size: number
          message?: string | null
          status?: 'new' | 'contacted' | 'qualified' | 'converted'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          name?: string
          email?: string
          phone?: string
          location_preference?: string
          budget_range?: string
          move_in_timeline?: string
          household_size?: number
          message?: string | null
          status?: 'new' | 'contacted' | 'qualified' | 'converted'
          created_at?: string
          updated_at?: string
        }
      }
      site_settings: {
        Row: {
          id: string
          key: string
          setting_key: string
          value: Json
          setting_value: string
          setting_type: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          key?: string
          setting_key?: string
          value?: Json
          setting_value?: string
          setting_type?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          key?: string
          setting_key?: string
          value?: Json
          setting_value?: string
          setting_type?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      media_files: {
        Row: {
          id: string
          file_name: string
          file_type: string
          file_size: number
          file_url: string
          uploaded_by: string
          created_at: string
        }
        Insert: {
          id?: string
          file_name: string
          file_type: string
          file_size: number
          file_url: string
          uploaded_by: string
          created_at?: string
        }
        Update: {
          id?: string
          file_name?: string
          file_type?: string
          file_size?: number
          file_url?: string
          uploaded_by?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_property_views: {
        Args: {
          property_id: string
        }
        Returns: void
      }
    }
    Enums: {
      user_role: 'user' | 'admin' | 'super_admin'
      property_status: 'available' | 'pending' | 'sold' | 'draft'
      enquiry_status: 'new' | 'in_progress' | 'closed'
      message_status: 'new' | 'in_progress' | 'resolved'
      cohousing_status: 'new' | 'contacted' | 'qualified' | 'converted'
    }
  }
}
