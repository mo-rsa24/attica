import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    hmr: {
      host: 'localhost',
      protocol: 'ws', // or 'wss' for secure dev servers
    },
    watch: {
      usePolling: true,  // Try this for WSL2 or Docker environments
    },
    proxy: {
      '/api': 'http://localhost:8000',  // Proxy all /api requests to Django
      '/vendors': 'http://localhost:8000',   // Vendor related endpoints
      '/cart': 'http://localhost:8000',      // Cart endpoints
      '/checkout': 'http://localhost:8000',
    },
  },
})
