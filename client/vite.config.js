import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import cssInjectPlugin from './vite-plugin-css-inject.js'

export default defineConfig({
  plugins: [
    react(),
    cssInjectPlugin()
  ],
  base: '/',
  build: {
    rollupOptions: {
      input: './index.html',
      output: {
        assetFileNames: (assetInfo) => {
          if (assetInfo.name.endsWith('.css')) {
            return 'assets/[name]-[hash].css'
          }
          return 'assets/[name]-[hash][extname]'
        }
      }
    }
  }
})