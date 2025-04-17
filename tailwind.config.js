/** @type {import('tailwindcss').Config} */

const config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'primary-blue': '#0D2B54',
        'secondary-blue': '#1E4976',
        'accent-blue': '#3A6EA5',
        'deep-blue': '#051937',
        'cobalt': '#0047AB',
        'azure': '#007FFF',
        'text-light': '#E8F0F9',
        'text-muted': '#B8C7D9',
        'surface': 'rgba(30, 73, 118, 0.15)',
        'custom-green': 'rgb(77, 107, 8)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
export default config

