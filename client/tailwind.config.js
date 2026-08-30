/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#0a0e1a',
        'bg-secondary': '#111827',
        'bg-card': '#1a1f35',
        'bg-card-hover': '#232945',
        'bg-glass': 'rgba(26, 31, 53, 0.75)',
        
        'accent-primary': '#06d6a0',
        'accent-secondary': '#00b4d8',
        'accent-warm': '#f77f00',
        'accent-danger': '#ef476f',
        'accent-purple': '#8338ec',
        
        'text-primary': '#f1f5f9',
        'text-secondary': '#94a3b8',
        'text-muted': '#64748b',
        
        'border-custom': '#2a3050',
        'border-glow': 'rgba(6, 214, 160, 0.3)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'glow-primary': '0 0 25px rgba(6, 214, 160, 0.2)',
        'glow-purple': '0 0 25px rgba(131, 56, 236, 0.2)',
        'card-hover': '0 12px 35px rgba(0, 0, 0, 0.35)',
      },
    },
  },
  plugins: [],
}
