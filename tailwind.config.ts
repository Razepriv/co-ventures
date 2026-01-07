import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        coral: {
          DEFAULT: '#FF6B4A',
          dark: '#FF5A3D',
          light: '#FF8A6D',
        },
        charcoal: {
          DEFAULT: '#2D2D2D',
          dark: '#1A1A1A',
        },
        peach: {
          light: '#FFF5F2',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(0,0,0,0.06)',
        'medium': '0 4px 16px rgba(0,0,0,0.08)',
        'strong': '0 8px 32px rgba(0,0,0,0.12)',
        'hover': '0 12px 32px rgba(0,0,0,0.12)',
      },
      transitionDuration: {
        '400': '400ms',
      },
    },
  },
  plugins: [],
}
export default config
