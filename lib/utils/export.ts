/**
 * Export utilities for converting data to CSV/Excel format
 */

export function exportToCSV(data: any[], filename: string) {
  if (!data || data.length === 0) {
    alert('No data to export')
    return
  }

  // Get headers from first object
  const headers = Object.keys(data[0])
  
  // Create CSV content
  const csvContent = [
    // Headers
    headers.join(','),
    // Data rows
    ...data.map(row =>
      headers.map(header => {
        const value = row[header]
        // Handle values with commas, quotes, or newlines
        if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
          return `"${value.replace(/"/g, '""')}"`
        }
        return value ?? ''
      }).join(',')
    )
  ].join('\n')

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', `${filename}-${new Date().toISOString().split('T')[0]}.csv`)
  link.style.visibility = 'hidden'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export function exportToExcel(data: any[], filename: string) {
  // For now, use CSV format (can be opened in Excel)
  // In future, can integrate xlsx library for true Excel format
  exportToCSV(data, filename)
}

/**
 * Format property data for export
 */
export function formatPropertiesForExport(properties: any[]) {
  return properties.map(prop => ({
    ID: prop.id,
    Title: prop.title,
    Location: prop.location,
    City: prop.city,
    State: prop.state,
    'BHK Type': prop.bhk_type,
    'Property Type': prop.property_type,
    Price: prop.price,
    'Area (sqft)': prop.area_sqft,
    Bedrooms: prop.bedrooms,
    Bathrooms: prop.bathrooms,
    Status: prop.status,
    Featured: prop.is_featured ? 'Yes' : 'No',
    Views: prop.views || 0,
    'Created At': new Date(prop.created_at).toLocaleDateString()
  }))
}

/**
 * Format enquiries data for export
 */
export function formatEnquiriesForExport(enquiries: any[]) {
  return enquiries.map(enq => ({
    ID: enq.id,
    'Full Name': enq.full_name,
    Email: enq.email,
    Phone: enq.phone,
    Message: enq.message,
    Status: enq.status,
    'Property': enq.properties?.title || 'N/A',
    'Created At': new Date(enq.created_at).toLocaleDateString(),
    'Updated At': new Date(enq.updated_at).toLocaleDateString()
  }))
}

/**
 * Format users data for export
 */
export function formatUsersForExport(users: any[]) {
  return users.map(user => ({
    ID: user.id,
    'Full Name': user.full_name,
    Email: user.email,
    Phone: user.phone || 'N/A',
    Role: user.role,
    'Email Verified': user.email_verified ? 'Yes' : 'No',
    'Phone Verified': user.phone_verified ? 'Yes' : 'No',
    'Active': user.is_active ? 'Yes' : 'No',
    'Created At': new Date(user.created_at).toLocaleDateString()
  }))
}

/**
 * Format blog posts data for export
 */
export function formatBlogPostsForExport(posts: any[]) {
  return posts.map(post => ({
    ID: post.id,
    Title: post.title,
    Author: post.users?.full_name || 'Unknown',
    Category: post.category,
    Status: post.status,
    Views: post.views_count || 0,
    'Published At': post.published_at ? new Date(post.published_at).toLocaleDateString() : 'Not Published',
    'Created At': new Date(post.created_at).toLocaleDateString()
  }))
}

/**
 * Format testimonials data for export
 */
export function formatTestimonialsForExport(testimonials: any[]) {
  return testimonials.map(test => ({
    ID: test.id,
    'Client Name': test.client_name,
    'Designation': test.client_designation || 'N/A',
    Rating: test.rating,
    'Testimonial': test.testimonial_text,
    'Property': test.properties?.title || 'N/A',
    Approved: test.is_approved ? 'Yes' : 'No',
    Featured: test.is_featured ? 'Yes' : 'No',
    'Created At': new Date(test.created_at).toLocaleDateString()
  }))
}
