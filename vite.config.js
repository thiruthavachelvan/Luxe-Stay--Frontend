import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react(), tailwindcss()],
    define: {
      // __API_BASE__ is replaced at build time — no import needed in any file
      __API_BASE__: JSON.stringify(env.VITE_API_URL || 'http://localhost:5000'),
    },
  }
})
