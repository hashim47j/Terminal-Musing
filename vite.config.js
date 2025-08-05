import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/',
  plugins: [react()],
  root: './frontend',              // ← Point to where React code actually is
  build: { 
    outDir: '../dist',             // ← Output to Terminal-Musing/dist (one level up)
    emptyOutDir: true 
  },
  server: {
    proxy: {
      '/api': { 
        target: 'http://localhost:5000', 
        changeOrigin: true 
      }
    }
  }
})
