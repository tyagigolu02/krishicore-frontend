/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        krishi: {
          950: '#061a11',
          900: '#071f15',
          800: '#1B5E20', // Stitch Primary Forest Green
          700: '#144617', // Active pressed state
          600: '#2E7D32', // Fresh Shoot Green
          100: '#E8F5E9', // Soft Leaf Tint
          200: '#A5D6A7',
        },
        harvest: {
          500: '#D97706',
          400: '#F59E0B', // Stitch Harvest Amber
          300: '#fbbf24',
          100: '#FEF3C7',
        },
        surface: {
          bg: '#F8FAF5',     // Outdoor Sunlight Chalk Base
          card: '#FFFFFF',   // Pure White Elevation
          border: '#E2E8D8', // Structural Micro-Border
          dark: '#1E293B',   // Rich Soil Charcoal
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', '"Noto Sans Devanagari"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}