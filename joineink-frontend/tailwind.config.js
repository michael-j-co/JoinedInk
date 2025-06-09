/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#faf9f7',
          100: '#f4f2ee', 
          200: '#e8e3db',
          300: '#d6ccc0',
          400: '#c0b19f',
          500: '#a89784', // Main brand color - warm taupe
          600: '#8f7e6b',
          700: '#766656',
          800: '#615349',
          900: '#52453e',
        },
        accent: {
          sage: '#9cac95', // Muted sage green
          rose: '#d4a5a5', // Dusty rose
          gold: '#d4b896', // Soft gold
          terracotta: '#c89882', // Warm terracotta
        },
        neutral: {
          cream: '#fdfcfa',
          ivory: '#f9f7f4',
          pearl: '#f2f0ed',
          stone: '#e6e2dd',
          warm: '#d9d4cd',
          cool: '#c5bfb8',
        },
        text: {
          primary: '#3d3834', // Warm dark brown
          secondary: '#6b6158', // Medium warm brown
          tertiary: '#8a7f75', // Light warm brown
          muted: '#a6998d', // Very light warm brown
        },
        surface: {
          paper: '#fefdfb',
          card: '#fbfaf7',
          overlay: '#f7f5f2',
          border: '#ede9e4',
        },
        // Seasonal color extensions
        green: {
          25: '#f7fff7', // Ultra light green for seasonal themes
        },
        pink: {
          25: '#fff5f8', // Ultra light pink for seasonal themes
        },
        orange: {
          25: '#fef7f0', // Ultra light orange for seasonal themes
        },
        mint: {
          50: '#f0fdf4', // Mint green for gradients
        }
      },
      fontFamily: {
        'script': ['Dancing Script', 'cursive'],
        'serif': ['Crimson Text', 'serif'],
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'pulse-soft': 'pulseSoft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(61, 56, 52, 0.06), 0 10px 20px -2px rgba(61, 56, 52, 0.04)',
        'soft-lg': '0 10px 15px -3px rgba(61, 56, 52, 0.08), 0 4px 6px -2px rgba(61, 56, 52, 0.05)',
        'warm': '0 4px 6px -1px rgba(200, 152, 130, 0.1), 0 2px 4px -1px rgba(200, 152, 130, 0.06)',
      }
    },
  },
  plugins: [],
} 