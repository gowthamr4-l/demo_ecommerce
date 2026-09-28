/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        emeraldBrand: {
          50: '#ecfdf5',
          100: '#d1fae5',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 2px 12px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 12px 28px -4px rgba(0, 0, 0, 0.12)',
        'modal': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
        '3xl': '20px',
      },
      keyframes: {
        'loader-bar': {
          '0%': { transform: 'translateX(-100%) scaleX(0.2)' },
          '50%': { transform: 'translateX(40%) scaleX(0.8)' },
          '100%': { transform: 'translateX(200%) scaleX(0.2)' },
        },
        'logo-pulse': {
          '0%, 100%': { transform: 'scale(1)', filter: 'drop-shadow(0 4px 12px rgba(0, 144, 227, 0.25))' },
          '50%': { transform: 'scale(1.03)', filter: 'drop-shadow(0 8px 24px rgba(0, 144, 227, 0.45))' },
        },
      },
      animation: {
        'loader-bar': 'loader-bar 2.2s cubic-bezier(0.65, 0.815, 0.735, 0.395) infinite',
        'logo-pulse': 'logo-pulse 2.4s ease-in-out infinite',
      }
    },
  },
  plugins: [],
}
