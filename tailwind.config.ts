import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          black: '#000000',
          white: '#FFFFFF',
          gold: '#FFD700',
          'gold-dark': '#E6C200',
          'gold-light': '#FFE44D',
          'gray-50': '#FAFAFA',
          'gray-100': '#F5F5F5',
          'gray-200': '#E5E5E5',
          'gray-400': '#9CA3AF',
          'gray-600': '#4B5563',
          'gray-800': '#1F2937',
          'gray-900': '#111827',
        },
      },
      fontFamily: {
        sans: ['var(--font-plein)', 'Plein', '_Plein_Variable', 'Plein Variable', 'Inter', 'system-ui', 'sans-serif'],
        display: ["'Regular-Light'", 'Regular-Light', 'var(--font-heading)', 'Georgia', 'serif'],
        heading: ["'Regular-Light'", 'Regular-Light', 'var(--font-heading)', 'Georgia', 'serif'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '1rem' }],
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
        '4xl': '2.5rem',
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '30': '7.5rem',
      },
      maxWidth: {
        '8xl': '88rem',
        '9xl': '100rem',
      },
      boxShadow: {
        'gold-sm': '0 2px 8px rgba(255, 215, 0, 0.15)',
        'gold-md': '0 4px 16px rgba(255, 215, 0, 0.2)',
        'gold-lg': '0 8px 32px rgba(255, 215, 0, 0.25)',
        'premium': '0 4px 24px rgba(0, 0, 0, 0.12)',
        'premium-lg': '0 8px 48px rgba(0, 0, 0, 0.16)',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in-up': {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.5s ease-out',
        'fade-in-up': 'fade-in-up 0.6s ease-out',
        shimmer: 'shimmer 1.5s infinite linear',
      },
    },
  },
  plugins: [],
}

export default config
