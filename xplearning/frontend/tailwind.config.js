/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        xporange: '#FF7A18',
        xpnavy: '#0B1F3A',
        xpwhite: '#F9FAFB',
        xpcyan: '#67E8F9'
      },
      boxShadow: {
        neon: '0 0 0.5rem rgba(103,232,249,0.7), 0 0 1.4rem rgba(255,122,24,0.3)'
      },
      backgroundImage: {
        hud: 'linear-gradient(135deg, rgba(255,122,24,0.15), rgba(14,29,56,0.85))'
      }
    },
  },
  plugins: [],
};
