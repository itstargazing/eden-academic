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
        'background-light': '#121212',
        
        // Primary UI colors for cards, containers, etc.
        primary: '#0a0a0a',
        'primary-light': '#1a1a1a',
        'primary-dark': '#050505',
        
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