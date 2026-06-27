import { defineConfig } from 'vite'
import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],

  build: {
    // Enable source maps for production debugging
    sourcemap: false,
    // Optimize CSS
    cssMinify: true,
    // Target modern browsers
    target: 'esnext',
    // Reduce bundle size
    // Limit chunk size warnings
    chunkSizeWarningLimit: 500,
  },

  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router',
      'react-router-dom',
      '@mui/material',
      '@radix-ui/react-dialog',
      'lucide-react',
    ],
  },

  server: {
    // Enable CORS for development
    cors: true,
    // Open browser on start
    open: false,
  },
})
