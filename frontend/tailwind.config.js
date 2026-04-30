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
          50:  '#e6f5ee',
          100: '#b3e0cc',
          200: '#80ccaa',
          300: '#4db788',
          400: '#26a66d',
          500: '#009850',
          600: '#007a40',
          700: '#005c30',
          800: '#003d20',
          900: '#001f10',
          DEFAULT: '#009850',
        },
        caritas: {
          green:   '#009850',
          lima:    '#91D723',
          cian:    '#00C8B4',
          naranja: '#FF823C',
          amarillo:'#FFC300',
          dark:    '#333333',
          light:   '#F5F5F5',
          accent:  '#007a40',
        },
      },
      fontFamily: {
        sans: ['Asap', 'Nunito', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
