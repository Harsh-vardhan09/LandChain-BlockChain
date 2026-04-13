import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',  // backend is on 3000
        changeOrigin: true,
        secure: false
        // Do NOT rewrite — backend routes already start with /api
      }
    }
  }
})
