/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  safelist: [
    'bg-green-500',
    'bg-yellow-500',
    'bg-red-500',
    'bg-orange-500',
    'bg-blue-500',
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

