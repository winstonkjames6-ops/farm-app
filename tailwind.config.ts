import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Dark background
        'dark-bg': '#1a1a1a',
        'dark-secondary': '#2a2a2a',
        'dark-tertiary': '#4a4a4a',

        // Teal accent
        'orange-primary': '#00BCC8',
        'orange-hover': '#00a8b3',
        'orange-light': 'rgba(0, 188, 200, 0.1)',

        // White/grays
        'text-primary': '#ffffff',
        'text-secondary': '#e0e0e0',
        'text-tertiary': '#a0a0a0',

        // Light-theme parent-facing tokens (mirrors lib/theme.ts) — used by
        // the marketing landing page components in components/landing/
        farm: {
          bg: '#F8F8F6',
          card: '#FFFFFF',
          surface2: '#F0EFEB',
          cyan: '#00BCC8',
          'cyan-dim': 'rgba(0,188,200,0.06)',
          'cyan-light': 'rgba(0,188,200,0.08)',
          'cyan-border': 'rgba(0,188,200,0.25)',
          ink: '#111827',
          ink2: '#6B7280',
          // Text-on-cyan (buttons/badges) — matches the near-black --accent-ink
          // token already used across the app's cyan CTAs for max contrast.
          'on-cyan': '#09090B',
          border: 'rgba(0,0,0,0.08)',
          danger: '#EF4444',
        },
      },
      fontFamily: {
        heading: ["'Barlow Condensed'", 'sans-serif'],
        body: ["'Hanken Grotesk'", 'sans-serif'],
      },
      spacing: {
        '128': '32rem',
      },
      fontSize: {
        'hero': '3.5rem', // 56px
        'h1': '2.5rem',   // 40px
        'h2': '2rem',     // 32px
        'h3': '1.5rem',   // 24px
        'body': '1rem',   // 16px
        'small': '0.875rem', // 14px
      },
      lineHeight: {
        'tight': '1.2',
        'normal': '1.6',
        'relaxed': '1.8',
      },
    },
  },
  plugins: [],
}
export default config
