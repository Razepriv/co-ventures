/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['images.unsplash.com', 'placehold.co'],
    formats: ['image/webp', 'image/avif'],
  },
  reactStrictMode: true,
}

module.exports = nextConfig
