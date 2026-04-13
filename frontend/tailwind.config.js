/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'chain-dark': '#0a0f1a',
        'chain-navy': '#0d1b2e',
        'chain-panel': '#111827',
        'chain-border': '#1e3a5f',
        'chain-blue': '#1d6fa4',
        'chain-cyan': '#00d4ff',
        'chain-gold': '#f59e0b',
        'chain-green': '#10b981',
        'chain-red': '#ef4444',
        'chain-text': '#e2e8f0',
        'chain-muted': '#64748b',
      },
      fontFamily: {
        'orbitron': ['Orbitron', 'monospace'],
        'space-mono': ['Space Mono', 'monospace'],
        'dm-sans': ['DM Sans', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
