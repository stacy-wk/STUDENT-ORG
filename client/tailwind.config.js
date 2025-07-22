/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
      },
      colors: {
        'student-os-white': '#F8F8F8',
        'student-os-light-gray': '#EAEAEA',
        'student-os-dark-gray': '#333333',
        'student-os-accent': '#6B46C1',
        'student-os-success': '#4CAF50',
        'student-os-error': '#F44336',
      },
      boxShadow: {
        'custom-light': '0 4px 12px rgba(0, 0, 0, 0.05)',
        'custom-medium': '0 8px 24px rgba(0, 0, 0, 0.1)',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '2rem',
        '3xl': '3rem',
      }
    },
  },
  plugins: [],
}
