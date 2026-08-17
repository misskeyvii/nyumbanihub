import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  root: path.resolve(__dirname, 'srcpos'),
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'srcpos'),
    },
  },
  build: {
    outDir: path.resolve(__dirname, 'dist-pos'),
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
  },
})