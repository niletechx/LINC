import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Explicit base for Render static hosting (serves from root)
  base: '/',
  build: {
    outDir: 'dist',
    sourcemap: false,
    // Raise warning limit — large CSS bundle is from App.css design tokens
    chunkSizeWarningLimit: 1000,
  },
})
