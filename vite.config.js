import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'logo.png'],
      manifest: {
        name: '魔法绘本屋',
        short_name: '魔法绘本',
        description: 'AI绘本生成器 - 为孩子们创造神奇的故事',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: 'logo.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'logo.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.href.includes('volces.com') || url.href.includes('imgbb.com'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'story-images',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 缓存30天
              },
              cacheableResponse: {
                statuses: [0, 200] // 0 允许缓存跨域的不透明响应
              }
            }
          }
        ]
      }
    })
  ],
  server: {
    host: true, // 允许局域网访问
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
