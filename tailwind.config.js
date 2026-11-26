/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./front/**/*.{js,ts,jsx,tsx}",
    "./back/seoPlugin.ts",
  ],
  theme: {
    extend: {
      colors: {
        cream: '#faf7f0',
        paper: '#fffcf7',
        ink: '#372e25',
        muted: '#685d50',
        gold: {
          DEFAULT: '#a67c3f',
          dark: '#87622f',
        },
        wine: {
          DEFAULT: '#672d35',
          dark: '#4e1e25',
        },
        line: '#e6dac6',
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['"DM Sans Variable"', '"DM Sans"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        '2xs': '0 1px 2px 0 rgba(55, 46, 37, 0.04)',
        xs: '0 1px 3px 0 rgba(55, 46, 37, 0.06), 0 1px 2px -1px rgba(55, 46, 37, 0.06)',
        soft: '0 4px 20px -2px rgba(55, 46, 37, 0.08)',
        modal: '0 -4px 30px rgba(55, 46, 37, 0.18)',
      },
      keyframes: {
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        'sheet-up': {
          from: { transform: 'translateY(24px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
      },
      animation: {
        'fade-in': 'fade-in 180ms ease-out both',
        'sheet-up': 'sheet-up 260ms cubic-bezier(0.22, 1, 0.36, 1) both',
      },
      backdropBlur: {
        xs: '2px',
      },
      spacing: {
        5.5: '1.375rem',
      },
    },
  },
  plugins: [],
};
