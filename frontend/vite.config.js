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
      '/api': 'http://localhost:8000',
      '/vendors': 'http://localhost:8000',
      '/cart': 'http://localhost:8000',
      '/checkout': 'http://localhost:8000',
      '/ws': {
        target: 'http://localhost:8000',
        ws: true,
      },
    },
  },
})
