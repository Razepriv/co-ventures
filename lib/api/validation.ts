import { z } from 'zod'

// Auth schemas
export const signUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  phone: z.string().optional(),
})

export const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const resetPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
})

export const updatePasswordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export const updateProfileSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters').optional(),
  phone: z.string().optional(),
  avatarUrl: z.string().url('Invalid URL').optional(),
})

// Property schemas
export const createPropertySchema = z.object({
  categoryId: z.string().uuid('Invalid category ID'),
  title: z.string().min(10, 'Title must be at least 10 characters'),
  description: z.string().min(50, 'Description must be at least 50 characters'),
  location: z.string().min(3, 'Location is required'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  price: z.number().positive('Price must be positive'),
  bedrooms: z.number().int().min(0),
  bathrooms: z.number().min(0),
  areaSqft: z.number().positive('Area must be positive'),
  featuredImage: z.string().url('Invalid image URL'),
  propertyType: z.string().min(2, 'Property type is required'),
  amenities: z.array(z.string()).optional(),
  status: z.enum(['available', 'pending', 'sold', 'draft']).optional(),
})

export const updatePropertySchema = createPropertySchema.partial()

export const propertySearchSchema = z.object({
  query: z.string().optional(),
  categoryId: z.string().uuid().optional(),
  location: z.string().optional(),
  minPrice: z.number().positive().optional(),
  maxPrice: z.number().positive().optional(),
  bedrooms: z.number().int().min(0).optional(),
  propertyType: z.string().optional(),
  status: z.enum(['available', 'pending', 'sold', 'draft']).optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().max(100).optional(),
})

// Enquiry schemas
export const createEnquirySchema = z.object({
  propertyId: z.string().min(1, 'Property ID is required'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  message: z.string().optional(),
  investmentAmount: z.union([z.string(), z.number()]).optional(),
})

export const updateEnquiryStatusSchema = z.object({
  status: z.enum(['new', 'in_progress', 'closed']),
})

// Newsletter schemas
export const subscribeNewsletterSchema = z.object({
  email: z.string().email('Invalid email address'),
})

// Contact schemas
export const contactMessageSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  message: z.string().min(20, 'Message must be at least 20 characters'),
})

// Co-housing schemas
export const cohousingInterestSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  locationPreference: z.string().min(2, 'Location preference is required'),
  budgetRange: z.string().min(2, 'Budget range is required'),
  moveInTimeline: z.string().min(2, 'Move-in timeline is required'),
  householdSize: z.number().int().positive('Household size must be positive'),
  message: z.string().optional(),
})

// Blog schemas
export const createBlogPostSchema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters'),
  slug: z.string().min(5, 'Slug must be at least 5 characters'),
  excerpt: z.string().min(20, 'Excerpt must be at least 20 characters'),
  content: z.string().min(100, 'Content must be at least 100 characters'),
  featuredImage: z.string().url('Invalid image URL'),
  category: z.string().min(2, 'Category is required'),
  tags: z.array(z.string()).optional(),
  published: z.boolean().optional(),
})

export const updateBlogPostSchema = createBlogPostSchema.partial()

// Testimonial schemas
export const createTestimonialSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  role: z.string().optional(),
  company: z.string().optional(),
  content: z.string().min(20, 'Content must be at least 20 characters'),
  rating: z.number().int().min(1).max(5, 'Rating must be between 1 and 5'),
  avatarUrl: z.string().url('Invalid URL').optional(),
})

export const updateTestimonialSchema = z.object({
  featured: z.boolean().optional(),
  approved: z.boolean().optional(),
})

// Type exports
export type SignUpInput = z.infer<typeof signUpSchema>
export type SignInInput = z.infer<typeof signInSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
export type CreatePropertyInput = z.infer<typeof createPropertySchema>
export type UpdatePropertyInput = z.infer<typeof updatePropertySchema>
export type PropertySearchInput = z.infer<typeof propertySearchSchema>
export type CreateEnquiryInput = z.infer<typeof createEnquirySchema>
export type UpdateEnquiryStatusInput = z.infer<typeof updateEnquiryStatusSchema>
export type SubscribeNewsletterInput = z.infer<typeof subscribeNewsletterSchema>
export type ContactMessageInput = z.infer<typeof contactMessageSchema>
export type CohousingInterestInput = z.infer<typeof cohousingInterestSchema>
export type CreateBlogPostInput = z.infer<typeof createBlogPostSchema>
export type UpdateBlogPostInput = z.infer<typeof updateBlogPostSchema>
export type CreateTestimonialInput = z.infer<typeof createTestimonialSchema>
export type UpdateTestimonialInput = z.infer<typeof updateTestimonialSchema>
