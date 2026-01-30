import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['gold-icon.svg', 'robots.txt', 'notification-sound.mp3'],
      manifest: {
        name: 'Gold Price Monitor',
        short_name: 'GoldMonitor',
        description: 'Monitor harga emas Treasury.id secara real-time dengan notifikasi otomatis',
        start_url: '/',
        display: 'standalone',
        background_color: '#0f0f1a',
        theme_color: '#1a1a2e',
        orientation: 'portrait-primary',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ],
        categories: ['finance', 'business'],
        screenshots: [
          {
            src: '/screenshot-mobile.png',
            sizes: '1170x2532',
            type: 'image/png',
            form_factor: 'narrow',
            label: 'Gold Price Monitor Mobile'
          },
          {
            src: '/screenshot-desktop.png',
            sizes: '1920x1080',
            type: 'image/png',
            form_factor: 'wide',
            label: 'Gold Price Monitor Desktop'
          }
        ],
        lang: 'id',
        dir: 'ltr'
      },
      workbox: {
        // Define runtime caching for API if needed, 
        // but default is usually fine for App Shell
      }
    })
  ],
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
