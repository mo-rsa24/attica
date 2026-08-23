import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 5175: Attica's frontend owns 5173 and the realtime-overlay scene owns 5174.
export default defineConfig({
  plugins: [react()],
  // WSL2 runs out of inotify watchers with several node_modules trees in
  // play, so watch by polling. Attica's own frontend/vite.config.js does the
  // same thing for the same reason.
  server: { watch: { usePolling: true }, port: 5175 },
})
