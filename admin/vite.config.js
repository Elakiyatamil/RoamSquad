import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
<<<<<<<< HEAD:admin/vite.config.js
  plugins: [
    react(),
    tailwindcss(),
  ],
========
  plugins: [react()],
  server: {
    port: 5174,
    host: true
  }
>>>>>>>> origin/main:client/vite.config.js
})
