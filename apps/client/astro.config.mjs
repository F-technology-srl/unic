import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import { fileURLToPath } from 'node:url';
import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
  outDir: '../../dist/apps/client',
  output: 'server',
  adapter: node({
    mode: 'standalone',
  }),
  integrations: [
    react(),
    tailwind({
      configFile: fileURLToPath(
        new URL('./tailwind.config.js', import.meta.url),
      ),
    }),
  ],
  vite: {
    server: {
      //https://vitejs.dev/config/server-options.html#server-proxy
      //reverse proxy for backend ONLY in development
      proxy: {
        '/api': {
          target: 'http://127.0.0.1:3000',
          changeOrigin: true,
          secure: false,
          timeout: 3 * 60 * 60 * 1000, // upload-zip timeout - 3 hours
        },
      },
    },
  },
});
