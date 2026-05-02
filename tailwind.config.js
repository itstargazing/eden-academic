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
        // Aligned with app/globals.css :root (utilities must match — they override @layer components)
        background: '#d9d9d9',
        'background-light': '#cfcfcf',

        primary: '#ebebeb',
        'primary-light': '#cfcfcf',
        'primary-dark': '#b0b0b0',

        accent: '#444444',
        'accent-light': '#888888',

        'text-primary': '#0a0a0a',
        'text-secondary': '#444444',
      },
      fontFamily: {
        sans: ['var(--font-jost)', 'Jost', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        logo: ['var(--font-unbounded)', 'Unbounded', 'sans-serif'],
      },
    },
  },
  plugins: [],
} 