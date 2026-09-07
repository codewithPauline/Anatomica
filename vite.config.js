import { defineConfig } from 'vite';

export default defineConfig({
  base: '/Anatomica/',
  build: {
    sourcemap: false,
    chunkSizeWarningLimit: 700,
  },
});
