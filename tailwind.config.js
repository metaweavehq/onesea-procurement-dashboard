/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'one-magenta': '#EC008C',
        'one-magenta-dark': '#C70076',
        'one-magenta-light': '#FF4DB8',
      }
    },
  },
  plugins: [],
}
