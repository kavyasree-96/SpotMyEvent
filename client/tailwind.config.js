/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#facc15',
        accent: '#fef9c3',
        'text-deep': '#422006',
        'bg-beige': '#f5f5dc',
      },
    },
  },
  plugins: [],
}
