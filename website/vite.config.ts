import path from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const baseCdnUrl = env.BASE_CDN_URL?.trim()
  const normalizedBaseCdnUrl =
    baseCdnUrl && !baseCdnUrl.endsWith('/') ? `${baseCdnUrl}/` : baseCdnUrl

  return {
    base: command === 'build' ? normalizedBaseCdnUrl ?? './' : './',
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      host: '0.0.0.0',
      port: 3000,
      strictPort: true,
      allowedHosts: true,
    },
  }
})
