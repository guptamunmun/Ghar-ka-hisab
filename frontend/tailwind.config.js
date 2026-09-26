/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        household: {
          bg: '#FBF6EF',
          card: '#FFFFFF',
          primary: '#2F8F5B',
          primaryDark: '#236E45',
          accent: '#F3A93C',
          danger: '#E1604B',
          text: '#3A3A3A',
          muted: '#8A8578',
        },
      },
      fontFamily: {
        sans: ['"Nunito"', '"Segoe UI"', 'sans-serif'],
      },
      borderRadius: {
        xl2: '1.25rem',
      },
    },
  },
  plugins: [],
};
