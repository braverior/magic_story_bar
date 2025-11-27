import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
    proxy: {
      // 火山引擎API代理
      '/volc-api': {
        target: 'https://ark.cn-beijing.volces.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/volc-api/, '/api/v3'),
        headers: {
          'Origin': 'https://ark.cn-beijing.volces.com'
        }
      },
      // NewAPI代理（备用）
      '/newapi': {
        target: 'https://api.newapi.pro',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/newapi/, '/v1')
      },
      // imgbb代理
      '/imgbb-api': {
        target: 'https://api.imgbb.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/imgbb-api/, '/1')
      },
      // 火山引擎TTS API代理 (V3单向流式)
      '/volc-tts': {
        target: 'https://openspeech.bytedance.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/volc-tts/, '/api/v3/tts'),
        headers: {
          'Origin': 'https://openspeech.bytedance.com'
        }
      }
    }
  }
})
