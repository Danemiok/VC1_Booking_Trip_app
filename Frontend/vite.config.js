import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  const apiProxyTarget =
    env.VITE_API_PROXY_TARGET ||
    env.VITE_BACKEND_ORIGIN ||
    'http://127.0.0.1:8000';

  const srcRoot = fileURLToPath(new URL('./src', import.meta.url));

  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: [
        // Backward compatible with existing imports like "@/src/utils/utils"
        { find: /^@\/src\//, replacement: `${srcRoot}${path.sep}` },
        // Recommended form: "@/utils/utils" (points to src/)
        { find: /^@\//, replacement: `${srcRoot}${path.sep}` },
      ],
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      proxy: {
        '/api': {
          target: apiProxyTarget,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});

