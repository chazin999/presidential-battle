/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        void: {
          950: '#05060B',
          900: '#0A0E1A',
          800: '#0F1526',
          700: '#161E36'
        },
        alpha: { DEFAULT: '#00E5FF', dim: '#0891A8' },
        beta: { DEFAULT: '#FF2E93', dim: '#A8135C' },
        gamma: { DEFAULT: '#FFC93C', dim: '#B8890A' }
      },
      fontFamily: {
        display: ['"Orbitron"', 'sans-serif'],
        body: ['"Rajdhani"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace']
      },
      boxShadow: {
        'glow-alpha': '0 0 40px rgba(0,229,255,0.55), 0 0 120px rgba(0,229,255,0.15)',
        'glow-beta': '0 0 40px rgba(255,46,147,0.55), 0 0 120px rgba(255,46,147,0.15)',
        'glow-gamma': '0 0 40px rgba(255,201,60,0.55), 0 0 120px rgba(255,201,60,0.15)'
      },
      keyframes: {
        floatUp: {
          '0%': { transform: 'translateY(0) scale(0.6)', opacity: '0' },
          '15%': { transform: 'translateY(-10px) scale(1.05)', opacity: '1' },
          '80%': { opacity: '1' },
          '100%': { transform: 'translateY(-90px) scale(0.9)', opacity: '0' }
        },
        pulseGlow: {
          '0%,100%': { filter: 'brightness(1)' },
          '50%': { filter: 'brightness(1.35)' }
        },
        scanline: {
          '0%': { backgroundPosition: '0 0' },
          '100%': { backgroundPosition: '0 40px' }
        }
      },
      animation: {
        floatUp: 'floatUp 2.4s ease-out forwards',
        pulseGlow: 'pulseGlow 1.6s ease-in-out infinite',
        scanline: 'scanline 1s linear infinite'
      }
    }
  },
  plugins: []
}
