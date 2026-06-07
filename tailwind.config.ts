import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        steam: {
          900: '#050b12',
          800: '#07131e',
          700: '#0c1d2a',
        },
      },
      boxShadow: {
        glass: '0 20px 80px rgba(10, 15, 30, 0.45)',
      },
    },
  },
  plugins: [],
} satisfies Config;
