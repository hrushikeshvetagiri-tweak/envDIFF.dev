import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  server: {
    proxy: {
      // Run `npx wrangler dev --port 8787` alongside `npm run dev` so /api
      // routes hit the real Worker while everything else keeps Vite's HMR.
      '/api': 'http://localhost:8787',
    },
  },
})
