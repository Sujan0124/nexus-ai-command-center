/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        nexus: {
          base: 'var(--color-bg-base)',
          surface: 'var(--color-bg-surface)',
          elevated: 'var(--color-bg-elevated)',
          overlay: 'var(--color-bg-overlay)',
          border: 'var(--color-border)',
          'border-subtle': 'var(--color-border-subtle)',
          'border-bright': 'var(--color-border-bright)',
          text: 'var(--color-text-main)',
          'text-muted': 'var(--color-text-muted)',
          'text-dim': 'var(--color-text-dim)',
          accent: {
            DEFAULT: '#6366F1',
            hover: '#4F46E5',
            glow: 'rgba(99, 102, 241, 0.25)',
          },
          cyan: {
            DEFAULT: '#06B6D4',
            hover: '#0891B2',
            glow: 'rgba(6, 182, 212, 0.25)',
          },
          emerald: '#10B981',
          amber: '#F59E0B',
          rose: '#EF4444',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'nexus-card': '0 4px 20px -2px rgba(0, 0, 0, 0.5), 0 0 0 1px var(--color-border)',
        'nexus-elevated': '0 10px 30px -4px rgba(0, 0, 0, 0.6), 0 0 0 1px var(--color-border-bright)',
        'nexus-glow': '0 0 25px -5px rgba(99, 102, 241, 0.3)',
        'nexus-cyan-glow': '0 0 25px -5px rgba(6, 182, 212, 0.3)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
