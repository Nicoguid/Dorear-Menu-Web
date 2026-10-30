import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { dorearRealtimeSyncPlugin } from './back/apiMiddleware';

export default defineConfig({
  plugins: [react(), dorearRealtimeSyncPlugin()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          icons: ['lucide-react'],
        },
      },
    },
  },
  server: {
    port: 3000,
    host: true,
    allowedHosts: ['dorear-carta.loca.lt', '.loca.lt', '.trycloudflare.com'],
  },
  preview: {
    port: 3000,
    host: true,
    allowedHosts: ['dorear-carta.loca.lt', '.loca.lt', '.trycloudflare.com'],
  },
});
