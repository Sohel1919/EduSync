import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/',
  plugins: [react()],
  css: {
    postcss: './postcss.config.js',
  },
  build: {
    // Add this to ensure CSS is processed
    cssMinify: true,
  },
})