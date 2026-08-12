import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Brauzer CORS muammosini chetlab o'tish: /api → arabosfera.onrender.com
export default defineConfig({
  plugins: [react()],
  appType: 'spa', // /admin va boshqa pathlar index.html ga tushadi
  server: {
    port: 5173,
    open: true,
    host: true,
    proxy: {
      '/api': {
        target: 'https://arabosfera.onrender.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      // Post / kontent rasmlari
      '/images': {
        target: 'https://arabosfera.onrender.com',
        changeOrigin: true,
        secure: true,
      },
    },
  },
  preview: {
    port: 5173,
  },
})
