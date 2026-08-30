/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        base: {
          950: '#0A0D10',
          900: '#0F1317',
          800: '#141A20',
          700: '#1B232B',
          600: '#232D36',
          500: '#2F3B45',
        },
        line: '#232B33',
        ink: {
          100: '#EDF1F4',
          300: '#B7C2CB',
          500: '#7E8C97',
          700: '#4E5A64',
        },
        ochre: {
          400: '#E8B85C',
          500: '#D9A441',
          600: '#B9832A',
        },
        risk: {
          low: '#3ED598',
          med: '#F0A93A',
          high: '#FF5A4E',
          crit: '#FF2E4D',
        },
      },
      fontFamily: {
        display: ['"Chakra Petch"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        panel: '0 1px 0 0 rgba(255,255,255,0.04) inset, 0 8px 24px -12px rgba(0,0,0,0.6)',
        glow: '0 0 0 1px rgba(217,164,65,0.25), 0 0 24px -4px rgba(217,164,65,0.35)',
      },
      backgroundImage: {
        topo: "radial-gradient(circle at 20% 20%, rgba(217,164,65,0.06), transparent 40%), radial-gradient(circle at 80% 60%, rgba(62,213,152,0.05), transparent 45%)",
      },
      keyframes: {
        pulseRing: {
          '0%': { transform: 'scale(0.9)', opacity: '0.8' },
          '80%': { transform: 'scale(1.8)', opacity: '0' },
          '100%': { transform: 'scale(1.8)', opacity: '0' },
        },
        scanline: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        pulseRing: 'pulseRing 2.2s cubic-bezier(0.2,0.6,0.4,1) infinite',
        scanline: 'scanline 3.5s linear infinite',
      },
    },
  },
  plugins: [],
};
