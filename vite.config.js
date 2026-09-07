import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
// https://vitejs.dev/config/
export default defineConfig({
  base: './',   // 相对路径，便于在 GitHub Pages 等子路径/任意静态托管部署
  plugins: [
    uni(),
  ],
  server: {
    host: true,   // 监听 0.0.0.0，允许同局域网内其他设备(如你的 iPhone)访问
    port: 5173,
  },
})
