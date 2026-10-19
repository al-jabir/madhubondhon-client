import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const target = process.env.DEV_API_TARGET || env.DEV_API_TARGET || 'http://127.0.0.1:5000';
  return {
    plugins: [react(), tailwindcss()],
    server: {
      host: '127.0.0.1',
      port: Number(process.env.DEV_CLIENT_PORT || 5173),
      proxy: { '/api': { target, changeOrigin: true }, '/health': { target, changeOrigin: true } },
    },
    build: {
      rolldownOptions: {
        output: {
          // Route-level code splitting: every page lazy-loads from App.tsx,
          // so the initial bundle stays small.
          codeSplitting: true,
        },
      },
    },
  };
});
