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
    'bg-amber-500',
    'bg-orange-50',
    'text-green-500',
    'text-yellow-500',
    'text-red-500',
    'text-orange-500',
    'text-blue-500',
    'text-amber-500',
    'text-orange-50',
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

