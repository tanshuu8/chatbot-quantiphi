/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // brand palette — used for subtle UI accents (available as bg-brand-*, text-brand-*)
        brand: {
          50: '#f5f7fb',
          100: '#ebf0f8',
          200: '#dbe4f3',
          500: '#2563eb',
          600: '#1d4ed8',
          700: '#1e40af',
        }
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'sans-serif',
        ],
      },
      animation: {
        'pulse-subtle': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'blink': 'blink 1s infinite',
      },
      keyframes: {
        blink: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0 },
        }
      }
    },
  },
  plugins: [],
}
