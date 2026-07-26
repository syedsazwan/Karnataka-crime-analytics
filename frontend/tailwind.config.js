/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0F172A',
        card: '#1E293B',
        'card-border': '#334155',
        primary: '#2563EB',
        accent: '#F59E0B',
        danger: '#DC2626',
        success: '#10B981',
        'text-secondary': '#94A3B8',
        'text-muted': '#64748B',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
