import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
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
})
