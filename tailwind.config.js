/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./front/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: '#faf7f0',
        paper: '#fffcf7',
        ink: '#372e25',
        muted: '#766b5d',
        gold: {
          DEFAULT: '#a67c3f',
          light: '#c99d5d',
          dark: '#87622f',
        },
        wine: {
          DEFAULT: '#672d35',
          dark: '#4e1e25',
          light: '#843b45',
        },
        line: '#e6dac6',
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        '2xs': '0 1px 2px 0 rgba(55, 46, 37, 0.04)',
        xs: '0 1px 3px 0 rgba(55, 46, 37, 0.06), 0 1px 2px -1px rgba(55, 46, 37, 0.06)',
        soft: '0 4px 20px -2px rgba(55, 46, 37, 0.08)',
        modal: '0 -4px 30px rgba(55, 46, 37, 0.18)',
      },
      backdropBlur: {
        xs: '2px',
      },
      scale: {
        102: '1.02',
      },
      spacing: {
        5.5: '1.375rem',
      },
    },
  },
  plugins: [],
};
