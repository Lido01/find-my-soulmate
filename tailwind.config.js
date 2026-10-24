/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Manrope', 'Segoe UI', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"DM Mono"', 'Cascadia Mono', 'Consolas', 'monospace'],
        heading: ['"Space Grotesk"', '"Plus Jakarta Sans"', 'sans-serif'],
        brand: ['"Space Grotesk"', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-emerald': 'glowEmerald 2s ease-in-out infinite alternate',
        'glow-cyan': 'glowCyan 2s ease-in-out infinite alternate',
        'glow-fuchsia': 'glowFuchsia 2s ease-in-out infinite alternate',
        'glow-red': 'glowRed 2s ease-in-out infinite alternate',
        'glow-amber': 'glowAmber 2s ease-in-out infinite alternate',
        'typing': 'typing 1.4s steps(1) infinite',
        'blink': 'blink 1s step-start infinite',
        'flicker': 'flicker 0.15s infinite',
        'slide-up': 'slideUp 0.3s ease-out',
        'fade-in': 'fadeIn 0.4s ease-out',
        'bounce-in': 'bounceIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'scanline': 'scanline 8s linear infinite',
      },
      keyframes: {
        glowEmerald: {
          '0%': { boxShadow: '0 0 5px #10b981, 0 0 10px #10b981' },
          '100%': { boxShadow: '0 0 15px #10b981, 0 0 30px #10b981, 0 0 45px #10b981' },
        },
        glowCyan: {
          '0%': { boxShadow: '0 0 5px #22d3ee, 0 0 10px #22d3ee' },
          '100%': { boxShadow: '0 0 15px #22d3ee, 0 0 30px #22d3ee, 0 0 45px #22d3ee' },
        },
        glowFuchsia: {
          '0%': { boxShadow: '0 0 5px #d946ef, 0 0 10px #d946ef' },
          '100%': { boxShadow: '0 0 15px #d946ef, 0 0 30px #d946ef, 0 0 45px #d946ef' },
        },
        glowRed: {
          '0%': { boxShadow: '0 0 5px #ef4444, 0 0 10px #ef4444' },
          '100%': { boxShadow: '0 0 15px #ef4444, 0 0 30px #ef4444, 0 0 45px #ef4444' },
        },
        glowAmber: {
          '0%': { boxShadow: '0 0 5px #f59e0b, 0 0 10px #f59e0b' },
          '100%': { boxShadow: '0 0 15px #f59e0b, 0 0 30px #f59e0b, 0 0 45px #f59e0b' },
        },
        typing: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0 },
        },
        blink: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0 },
        },
        flicker: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.92 },
        },
        slideUp: {
          '0%': { transform: 'translateY(16px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        bounceIn: {
          '0%': { transform: 'scale(0.3)', opacity: 0 },
          '50%': { transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)', opacity: 1 },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
      },
    },
  },
  plugins: [],
}
