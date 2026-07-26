import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    host: true,
    watch: {
      // Exclude the nested frontend project & large JSON data files from being watched.
      // This prevents the EBUSY (resource busy/locked) crash on Windows.
      ignored: [
        '**/frontend/**',
        '**/dist/**',
        '**/public/data/**',
        '**/*.json',
      ],
    },
  },
});
