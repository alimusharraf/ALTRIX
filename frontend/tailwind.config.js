/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fdf4ff',
          100: '#fae8ff',
          200: '#f5d0fe',
          300: '#f0abfc',
          400: '#e879f9',
          500: '#ec4899',  // Pink
          600: '#d946ef',
          700: '#c026d3',
          800: '#a855f7',  // Purple
          900: '#7e22ce',
        },
        dark: {
          50: '#f5f5f5',
          100: '#e5e5e5',
          200: '#d4d4d4',
          300: '#a3a3a3',
          400: '#737373',
          500: '#525252',
          600: '#404040',
          700: '#2a2a2a',
          800: '#1a1a1a',  // Charcoal base
          900: '#0a0a0a',
        },
      },
      backgroundImage: {
        'gradient-pink-purple': 'linear-gradient(135deg, #ec4899 0%, #a855f7 100%)',
        'gradient-dark': 'linear-gradient(180deg, #1a1a1a 0%, #0a0a0a 100%)',
      },
    },
  },
  plugins: [],
}
