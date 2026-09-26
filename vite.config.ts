/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import pkg from './package.json' with { type: 'json' }

// base: './' — чтобы сборка открывалась из файловой системы внутри Capacitor WebView.
// Режим single (npm run build:single) собирает всё в один HTML-файл: удобно показать игру по ссылке
// или открыть файлом, без сервера и без папки assets.
export default defineConfig(({ mode }) => {
  const single = mode === 'single'
  return {
    base: './',
    plugins: [react(), tailwindcss()],
    define: {
      __APP_VERSION__: JSON.stringify(pkg.version),
    },
    server: { host: true },
    build: single
      ? {
          outDir: 'dist-single',
          assetsInlineLimit: Number.MAX_SAFE_INTEGER,
          cssCodeSplit: false,
          modulePreload: false,
          chunkSizeWarningLimit: 2000,
          rolldownOptions: { output: { codeSplitting: false } },
        }
      : {
          // Всё приложение едет внутри бинарника, поэтому один бандл — нормально.
          chunkSizeWarningLimit: 1200,
        },
    test: {
      environment: 'node',
    },
  }
})
