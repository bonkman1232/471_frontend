import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000', // Points to your backend
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules')) {
            if (id.includes('react')) return 'vendor_react';
            if (id.includes('react-router-dom')) return 'vendor_router';
            if (id.includes('lucide-react')) return 'vendor_icons';
            if (id.includes('recharts')) return 'vendor_recharts';
            if (id.includes('embla-carousel-react')) return 'vendor_carousel';
            return 'vendor_misc';
          }
        },
      },
    },
    chunkSizeWarningLimit: 700,
  },
})
