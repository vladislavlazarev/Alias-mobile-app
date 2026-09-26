/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import pkg from './package.json' with { type: 'json' }

// base: './' — чтобы сборка открывалась из файловой системы внутри Capacitor WebView.
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  server: { host: true },
  build: {
    // Всё приложение едет внутри бинарника, поэтому один бандл — нормально.
    chunkSizeWarningLimit: 1200,
  },
  test: {
    environment: 'node',
  },
})
