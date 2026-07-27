import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
        '@inducore/core-domain': path.resolve(__dirname, 'packages/core-domain/src/index.ts'),
        '@inducore/application': path.resolve(__dirname, 'packages/application/src/index.ts'),
        '@inducore/infrastructure': path.resolve(__dirname, 'packages/infrastructure/src/index.ts'),
        '@inducore/ui-kit': path.resolve(__dirname, 'packages/ui-kit/src/index.ts'),
        '@inducore/logger': path.resolve(__dirname, 'packages/logger/src/index.ts'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
