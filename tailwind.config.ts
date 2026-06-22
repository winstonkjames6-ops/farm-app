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
        
        // Orange accent
        'orange-primary': '#ff8c42',
        'orange-hover': '#ff7a22',
        'orange-light': 'rgba(255, 140, 66, 0.1)',
        
        // White/grays
        'text-primary': '#ffffff',
        'text-secondary': '#e0e0e0',
        'text-tertiary': '#a0a0a0',
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
