import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Port 5174 deliberately: Attica's own frontend owns 5173, and the scene is
// meant to be runnable beside the real app.
export default defineConfig({
  plugins: [react()],
  // WSL2 runs out of inotify watchers with several node_modules trees in
  // play, so watch by polling. Attica's own frontend/vite.config.js does the
  // same thing for the same reason.
  server: { watch: { usePolling: true }, port: 5174 },
})
