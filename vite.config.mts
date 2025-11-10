import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
<<<<<<< HEAD
  build: {
    outDir: 'dist',
    rollupOptions: {
      // Exclude server files from frontend bundle
      external: ['fs', 'path']
    }
  },
  define: {
    'process.env': process.env
  }
=======
>>>>>>> 7e87fcf (Fix: install @vercel/node)
});
