import { defineConfig, loadEnv } from 'vite';
import * as path from 'path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  const API_URL = `${env.VITE_API_URL ?? 'http://localhost:3000'}`;
  return {
    plugins: [react(), tailwindcss()],
    server: {
      cors: {
        allowedHeaders: '*',
        exposedHeaders: '*',
        methods: '',
        origin: 'http://localhost:5173',
      },
      proxy: {
        '/api': {
          target: API_URL,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
    resolve: {
      alias: [{ find: '@', replacement: path.resolve(__dirname, 'src') }],
    },
  };
});
