/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: '1rem',
    },
    extend: {
      colors: {
        ink: {
          50: '#f8f8f8',
          100: '#f0f0f0',
          200: '#e0e0e0',
          300: '#c0c0c0',
          400: '#9a9a9a',
          500: '#6b6b6b',
          600: '#525252',
          700: '#3d3d3d',
          800: '#2a2a2a',
          900: '#1a1a1a',
          950: '#0d0d0d',
        },
        linen: {
          DEFAULT: '#4a6fa5',
          light: '#6b8fc5',
          dark: '#365380',
        },
        gold: {
          DEFAULT: '#b8860b',
          light: '#d4a017',
          dark: '#8b6508',
          50: '#fdf8e7',
          100: '#faf0c8',
        },
        cinnabar: {
          DEFAULT: '#c23a2b',
          light: '#d65a4b',
        },
        jade: {
          DEFAULT: '#2d7a5e',
          light: '#3d9a78',
        },
      },
      fontFamily: {
        song: ['"Noto Serif SC"', '"Source Han Serif SC"', '"SimSun"', 'serif'],
        hei: ['"Noto Sans SC"', '"Source Han Sans SC"', '"Microsoft YaHei"', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.06)',
        'gold': '0 2px 8px rgba(184, 134, 11, 0.15)',
      },
      backgroundImage: {
        'cloud-pattern': "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.02'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
    },
  },
  plugins: [],
};
