import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': 'https://nutrinova-backend.onrender.com',
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Separates third-party libraries into a vendor bundle
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
      },
    },
  },
})