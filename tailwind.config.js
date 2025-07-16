/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Main background color - solid black
        background: '#000000',
        'background-light': '#000000',
        
        // Primary UI colors for cards, containers, etc.
        primary: '#000000',
        'primary-light': '#000000',
        'primary-dark': '#000000',
        
        // Accent color - white
        accent: '#ffffff',
        'accent-light': '#f0f0f0',
        
        // Text colors
        'text-primary': '#ffffff',
        'text-secondary': '#aaaaaa',
      },
      fontFamily: {
        sans: ['Jost', 'sans-serif'],
        logo: ['Unbounded', 'sans-serif'],
      },
    },
  },
  plugins: [],
} 