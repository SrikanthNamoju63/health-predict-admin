import { defineConfig } from 'vite';

export default defineConfig({
    build: {
      outDir: 'dist',
      emptyOutDir: true
    },
    publicDir: 'public',
    server: {
      port: 3000,
      open: true
    },
    resolve: {
      alias: {
        '@': '/src',
        '@assets': '/src/assets'
      }
    }
  });