import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(...inputs);
}

// Format price in Indian number system
export function formatPrice(price: number, currency: string = '₹'): string {
  if (price >= 10000000) {
    return `${currency}${(price / 10000000).toFixed(1)}Cr`;
  } else if (price >= 100000) {
    return `${currency}${(price / 100000).toFixed(1)}L`;
  }
  return `${currency}${price.toLocaleString('en-IN')}`;
}

// Format date
export function formatDate(date: string): string {
  const d = new Date(date);
  const options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  };
  return d.toLocaleDateString('en-US', options);
}

// Scroll to element smoothly
export function scrollToElement(elementId: string): void {
  const element = document.getElementById(elementId);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' });
  }
}

// Truncate text
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

// Check if element is in viewport
export function isInViewport(element: Element): boolean {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}
