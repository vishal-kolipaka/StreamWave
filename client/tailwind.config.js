/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0095f6', // Instagram blue
        secondary: '#dbdbdb',
        dark: '#121212',
        'dark-secondary': '#262626'
      }
    },
  },
  plugins: [],
}
