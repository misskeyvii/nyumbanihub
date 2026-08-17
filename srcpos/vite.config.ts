import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  root: path.resolve(__dirname, '.'),
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  build: {
    outDir: path.resolve(__dirname, 'dist'),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) return 'vendor-react';
            if (id.includes('@supabase'))  return 'vendor-supabase';
            if (id.includes('i18next'))    return 'vendor-i18n';
            return 'vendor';
          }
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
  server: {
    port: 3001,
    host: true,
    fs: {
      allow: [
        // Allow serving files from one level up to the project root
        '..',
        // Allow serving node_modules
        '../node_modules',
      ],
    },
  },
})