/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'custom-light-blue': '#e8f0fe',
      },
      fontSize: {
        'xxs': '0.7rem', // Adding a size smaller than 'xs'
      },
    },
  },
  plugins: [],
}

