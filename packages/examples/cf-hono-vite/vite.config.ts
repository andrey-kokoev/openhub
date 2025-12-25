import { defineConfig } from 'vite'

export default defineConfig({
  root: './client',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8787',
        changeOrigin: true,
      },
      '/__openhub2': {
        target: 'http://localhost:8787',
        changeOrigin: true,
      },
    },
  },
})
