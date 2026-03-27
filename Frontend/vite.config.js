import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  const rootDir = path.dirname(fileURLToPath(import.meta.url));
  // Allow either VITE_API_PROXY_TARGET (preferred) or VITE_BACKEND_ORIGIN to drive the proxy
  const apiProxyTarget =
    env.VITE_API_PROXY_TARGET || env.VITE_BACKEND_ORIGIN || 'http://127.0.0.1:8000';

  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
server: {
  proxy: {
    '/api': {
      target: apiProxyTarget,
      changeOrigin: true,
      secure: false,
    },
  },
}
  };
});
