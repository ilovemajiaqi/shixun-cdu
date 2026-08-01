/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'mountain-green': '#2c5af4', // Custom color if needed, or stick to defaults
      }
    },
  },
  plugins: [],
}
