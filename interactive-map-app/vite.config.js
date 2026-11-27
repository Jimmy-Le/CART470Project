import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tailwindcss from "@tailwindcss/vite"

const realMapLink = {
  name: 'real-map-startup-link',
  configureServer(server) {
    const printUrls = server.printUrls.bind(server)
    server.printUrls = () => {
      const urls = server.resolvedUrls
      if (!urls?.local.length) return printUrls()

      const original = urls.local
      const realMap = new URL('real-map', original[0]).href
      urls.local = [original[0], realMap, ...original.slice(1)]
      try {
        printUrls()
      } finally {
        urls.local = original
      }
    }
  },
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), realMapLink],
  server: {
    proxy: {
      "/api": {
          target: "http://localhost:3001",
          changeOrigin: true,
        }
    },
  },
})
