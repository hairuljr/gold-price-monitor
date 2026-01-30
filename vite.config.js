import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
  },
  build: {
    // Enable production optimizations
    minify: 'terser',
    sourcemap: false, // Disable for smaller bundle size
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true,
      },
    },
    // Chunk splitting strategy for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          pusher: ['pusher-js'],
        },
      },
    },
    // Compression
    reportCompressedSize: true,
    chunkSizeWarningLimit: 1000,
  },
})
