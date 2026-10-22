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
          black: '#0A0A0A',
          charcoal: '#171717',
          surface: '#171717',
          card: '#171717',
          border: '#2A2A2A',
          white: '#FFFFFF',
          gold: '#D4AF37',
          'gold-dark': '#B89628',
          'gold-light': '#E5C158',
          'gold-hover': '#E5C158',
          muted: '#A3A3A3',
          'gray-50': '#171717',
          'gray-100': '#1F1F1F',
          'gray-200': '#2A2A2A',
          'gray-400': '#737373',
          'gray-600': '#A3A3A3',
          'gray-800': '#171717',
          'gray-900': '#0A0A0A',
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
        'gold-sm': '0 2px 8px rgba(212, 175, 55, 0.15)',
        'gold-md': '0 4px 16px rgba(212, 175, 55, 0.25)',
        'gold-lg': '0 8px 32px rgba(212, 175, 55, 0.3)',
        'premium': '0 4px 24px rgba(0, 0, 0, 0.4)',
        'premium-lg': '0 8px 48px rgba(0, 0, 0, 0.6)',
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
