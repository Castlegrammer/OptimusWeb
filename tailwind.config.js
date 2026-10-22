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
          50: '#eef6ff',
          100: '#d9eaff',
          200: '#bcd9ff',
          300: '#8ec1fe',
          400: '#589cfb',
          500: '#3277f6',
          600: '#1d57eb',
          700: '#1742d8',
          800: '#1936af',
          900: '#19308a',
          950: '#142055',
        },
        emeraldBrand: {
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
        },
        amberBrand: {
          400: '#fbbf24',
          500: '#f59e0b',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'glow': '0 0 50px -12px rgba(29, 87, 235, 0.35)',
        'glow-emerald': '0 0 50px -12px rgba(16, 185, 129, 0.35)',
        'phone': '0 25px 60px -15px rgba(15, 23, 42, 0.4)',
      },
      animation: {
        'float-slow': 'float 6s ease-in-out infinite',
        'pulse-subtle': 'subtlePulse 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        subtlePulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.85' },
        }
      }
    },
  },
  plugins: [],
}
