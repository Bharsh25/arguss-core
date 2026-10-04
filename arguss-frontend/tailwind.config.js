/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        page: '#07090E',        // Deep obsidian canvas
        nav: '#0B0F17',         // Navigation rail
        card: '#0F1623',        // Card container
        'card-hover': '#141E30',
        modal: '#111827',       // Modal surface
        subtle: '#090D15',      // Inset well surface
        border: {
          DEFAULT: '#1E293B',   // Clean hairline divider
          subtle: '#151D2A',
          strong: '#334155',    // Highlighted border
          glow: '#38BDF8',
        },
        ink: '#F8FAFC',
        muted: '#94A3B8',
        faint: '#64748B',
        accent: {
          DEFAULT: '#F59E0B',   // Warm cyber amber
          hover: '#D97706',
          light: '#FBBF24',
          glow: 'rgba(245, 158, 11, 0.25)',
        },
        cyan: {
          DEFAULT: '#06B6D4',
          light: '#22D3EE',
          glow: 'rgba(6, 182, 212, 0.25)',
        },
        success: '#10B981',
        error: '#EF4444',
        warning: '#F59E0B',
      },
      fontFamily: {
        display: ['Space Grotesk', '-apple-system', 'sans-serif'],
        sans: ['Plus Jakarta Sans', 'Inter', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        card: '12px',
        panel: '16px',
      },
      boxShadow: {
        card: '0 4px 20px -2px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)',
        'card-hover': '0 10px 30px -4px rgba(0, 0, 0, 0.7), 0 0 20px rgba(56, 189, 248, 0.12)',
        raised: '0 20px 50px -10px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.08)',
        'glow-amber': '0 0 25px -4px rgba(245, 158, 11, 0.4)',
        'glow-cyan': '0 0 25px -4px rgba(6, 182, 212, 0.4)',
        'glow-green': '0 0 25px -4px rgba(16, 185, 129, 0.4)',
      },
      letterSpacing: {
        widest2: '0.15em',
        widest3: '0.22em',
      },
      animation: {
        'scan': 'scan 2.4s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ping-slow': 'ping 2.5s cubic-bezier(0, 0, 0.2, 1) infinite',
        'spin-slow': 'spin 8s linear infinite',
      },
      keyframes: {
        scan: {
          '0%, 100%': { transform: 'translateY(0%)', opacity: '0.9' },
          '50%': { transform: 'translateY(420%)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}