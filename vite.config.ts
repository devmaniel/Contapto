import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { TanStackRouterVite } from "@tanstack/router-vite-plugin"
import * as path from 'path'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    TanStackRouterVite()
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), 
    },
  },
})