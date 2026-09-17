/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        dark: {
          50:  '#f6f7f9',
          100: '#eceef2',
          200: '#d5dae2',
          300: '#b0b9c8',
          400: '#8392a8',
          500: '#62728c',
          600: '#4b5971',
          700: '#3c475c',
          800: '#1e2638',
          900: '#0f172a',
          950: '#070b14',
        },
        accent: {
          green:  '#22c55e',
          sky:    '#38bdf8',
          amber:  '#fbbf24',
          rose:   '#fb7185',
          violet: '#a78bfa',
          teal:   '#2dd4bf',
        }
      },
      fontFamily: {
        sans:    ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-mesh':   'radial-gradient(ellipse 80% 60% at 15% 10%, rgba(34,197,94,0.18), transparent), radial-gradient(ellipse 60% 50% at 85% 80%, rgba(14,165,233,0.18), transparent)',
        'gradient-mesh-dark': 'radial-gradient(ellipse 80% 60% at 15% 10%, rgba(34,197,94,0.12), transparent), radial-gradient(ellipse 60% 50% at 85% 80%, rgba(56,189,248,0.10), transparent)',
      },
      boxShadow: {
        'glass':          '0 8px 32px 0 rgba(0, 0, 0, 0.10)',
        'glass-dark':     '0 8px 32px 0 rgba(0, 0, 0, 0.45)',
        'glow':           '0 0 20px rgba(34, 197, 94, 0.35)',
        'glow-sm':        '0 0 10px rgba(34, 197, 94, 0.25)',
        'glow-sky':       '0 0 20px rgba(56, 189, 248, 0.35)',
        'glow-violet':    '0 0 20px rgba(167, 139, 250, 0.35)',
        'glow-amber':     '0 0 20px rgba(251, 191, 36, 0.35)',
        'card':           '0 4px 16px -2px rgba(15,23,42,0.08), 0 2px 6px -2px rgba(15,23,42,0.05)',
        'card-lg':        '0 12px 36px -4px rgba(15,23,42,0.12), 0 4px 10px -4px rgba(15,23,42,0.06)',
        'card-dark':      '0 4px 16px -2px rgba(0,0,0,0.4), 0 2px 6px -2px rgba(0,0,0,0.2)',
        'card-dark-lg':   '0 12px 36px -4px rgba(0,0,0,0.5), 0 4px 10px -4px rgba(0,0,0,0.3)',
        'inner-glow':     'inset 0 0 20px rgba(34, 197, 94, 0.06)',
      },
      animation: {
        'fade-in':        'fadeIn 0.3s ease-in-out',
        'slide-up':       'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'pulse-slow':     'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'gradient-shift': 'gradient-shift 12s ease infinite',
        'float':          'float 6s ease-in-out infinite',
        'glow-pulse':     'glow-pulse 3s ease-in-out infinite',
        'page-in':        'page-enter 0.4s cubic-bezier(0.16, 1, 0.3, 1) both',
        'shimmer':        'shimmer 1.5s infinite',
        'bounce-soft':    'bounce-soft 2s ease-in-out infinite',
        'spin-slow':      'spin 8s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(15px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'gradient-shift': {
          '0%':   { backgroundPosition: '0% 50%' },
          '50%':  { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-12px)' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 8px rgba(34, 197, 94, 0.2)' },
          '50%':      { boxShadow: '0 0 24px rgba(34, 197, 94, 0.5)' },
        },
        'page-enter': {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'bounce-soft': {
          '0%, 100%': { transform: 'translateY(-3px)', animationTimingFunction: 'cubic-bezier(0.8, 0, 1, 1)' },
          '50%':      { transform: 'translateY(0)', animationTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)' },
        },
      },
      borderRadius: {
        '2xl':  '1rem',
        '3xl':  '1.5rem',
        '4xl':  '2rem',
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
}
