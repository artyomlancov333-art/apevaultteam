/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#10b981',
          dark: '#059669',
        },
        slot: '#10b981',
        dayoff: '#fbbf24',
        vacation: '#f97316',
        sick: '#a855f7',
      },
    },
  },
  plugins: [],
}

