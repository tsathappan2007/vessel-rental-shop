/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#1e3a5f',
        secondary: '#2563eb',
        accent: '#f59e0b',
      },
    },
  },
  plugins: [],
};
