/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        terminal: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
      colors: {
        cyber: {
          dark: '#0a0e17',
          card: '#111827',
          border: '#1e293b',
          cyan: '#22d3ee',
          green: '#34d399',
          amber: '#fbbf24',
          red: '#ef4444',
        },
      },
    },
  },
  plugins: [],
};
