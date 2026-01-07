import { SearchCriteria } from '@/types';

// Simulated API calls - Replace with actual API endpoints

export const searchProperties = async (criteria: SearchCriteria) => {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true });
    }, 1000);
  });
};

export const saveProperty = async (propertyId: string, userId: string) => {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, propertyId });
    }, 500);
  });
};

export const subscribeNewsletter = async (email: string) => {
  // Validate email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { success: false, error: 'Invalid email address' };
  }

  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, email });
    }, 1000);
  });
};

export const submitContactForm = async (data: {
  name: string;
  email: string;
  phone: string;
  message: string;
}) => {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, data });
    }, 1000);
  });
};

export const getFeaturedProperties = async () => {
  // In production, this would fetch from your API
  // For now, it returns mock data
  const { mockProperties } = await import('./mockData');
  return mockProperties.filter(p => p.featured);
};

export const getTestimonials = async () => {
  const { mockTestimonials } = await import('./mockData');
  return mockTestimonials.filter(t => t.approved);
};

export const getBlogPosts = async (featured?: boolean) => {
  const { mockBlogPosts } = await import('./mockData');
  if (featured) {
    return mockBlogPosts.filter(p => p.featured && p.published);
  }
  return mockBlogPosts.filter(p => p.published);
};
