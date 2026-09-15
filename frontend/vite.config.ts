import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  appType: 'spa',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 3001,
    // 本地开发（不走 Docker/Nginx）时，把 /api 转发到本机 Spring Boot。
    // 目标地址可用 VITE_API_TARGET 覆盖；Docker 构建走 Nginx，不受影响。
    proxy: {
      '/api': {
        target: process.env.VITE_API_TARGET || 'http://127.0.0.1:8080',
        changeOrigin: true,
      },
    },
  }
})
