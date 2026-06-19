import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// HANS dev server. /api/* is proxied to the Express backend (port 3001) so the
// browser can call the Gemini-powered tutor without CORS or exposing the key.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
})
