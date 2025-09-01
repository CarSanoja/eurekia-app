import { defineConfig, splitVendorChunkPlugin } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [
    react(),
    splitVendorChunkPlugin(),
    visualizer({
      open: false,
      filename: 'dist/stats.html',
      gzipSize: true,
      brotliSize: true,
    })
  ],
  server: {
    host: '0.0.0.0',
    port: 5173,
    watch: {
      usePolling: true,
    },
    proxy: {
      '/api': {
        target: 'http://backend:8000',
        changeOrigin: true,
      },
      '/ws': {
        target: 'ws://backend:8000',
        ws: true,
      },
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React libraries
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // UI libraries
          'ui-vendor': ['framer-motion', 'lucide-react', '@headlessui/react'],
          // Data management
          'data-vendor': ['@tanstack/react-query', 'axios', 'dexie'],
          // Charts and visualization
          'charts': ['recharts'],
          // Admin components (lazy loaded)
          'admin': [
            './src/pages/AdminDashboard.jsx',
            './src/pages/AdminUsersPage.jsx',
            './src/pages/AdminCoursesPage.jsx',
            './src/pages/AIUsagePage.jsx'
          ],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
    sourcemap: true,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
  },
})