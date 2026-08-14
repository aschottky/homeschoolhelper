import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Normal local dev uses `vercel dev` (SPA + /api on one origin).
// For plain `vite` dev against a separately running API, set
// API_PROXY=http://localhost:<port> to forward /api requests there.
export default defineConfig({
  plugins: [react()],
  server: process.env.API_PROXY
    ? { proxy: { '/api': { target: process.env.API_PROXY, changeOrigin: false } } }
    : undefined,
})
