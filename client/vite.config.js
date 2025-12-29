import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()], // Removed cssInjectPlugin for testing
  base: '/',
  build: {
    // Vite handles assets automatically; let's use defaults first
    outDir: 'dist',
  }
})