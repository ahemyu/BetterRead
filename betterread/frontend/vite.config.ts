import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['react-pdf', 'pdfjs-dist/build/pdf.worker.entry'],
  },
  build: {
    commonjsOptions: {
      include: [/react-pdf/, /pdfjs-dist/],
    },
  },
});