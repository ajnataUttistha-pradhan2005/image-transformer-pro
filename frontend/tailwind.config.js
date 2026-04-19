/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'electric-cyan': '#00D1FF',
        'vivid-violet': '#7000FF',
        'neon-magenta': '#BD00FF',
        'deep-space': '#080A0F',
        'surface-1': '#181b25',
        'surface-2': '#2f3446',
        'sidebar-bg': '#141720',
        'panel-bg': '#222532',
        'text-primary': '#FFFFFF',
        'text-secondary': '#8b949e',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'sans-serif'],
      },
      backgroundImage: {
        'neon-gradient': 'linear-gradient(to right, #00D1FF, #7000FF)',
        'cyber-grid': 'linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px)',
      },
      boxShadow: {
        'neon': '0 0 10px rgba(0, 209, 255, 0.4), 0 0 20px rgba(112, 0, 255, 0.2)',
        'neon-hover': '0 0 15px rgba(0, 209, 255, 0.6), 0 0 30px rgba(112, 0, 255, 0.4)',
      }
    },
  },
  plugins: [],
}
