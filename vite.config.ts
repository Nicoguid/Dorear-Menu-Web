import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { dorearSeoPlugin } from './back/seoPlugin';

export default defineConfig({
  plugins: [react(), dorearSeoPlugin()],
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
  },
  preview: {
    port: 3000,
    host: true,
  },
});
