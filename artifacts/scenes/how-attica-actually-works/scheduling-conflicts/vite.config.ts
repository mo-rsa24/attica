import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 5176: 5173 is Attica's frontend, 5174 and 5175 are the other two scenes.
export default defineConfig({
  plugins: [react()],
  // WSL2 runs out of inotify watchers with several node_modules trees in
  // play, so watch by polling. Attica's own frontend/vite.config.js does the
  // same thing for the same reason.
  server: { watch: { usePolling: true }, port: 5176 },
})
