import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { viteStaticCopy } from 'vite-plugin-static-copy'

// https://vitejs.dev/config/
export default defineConfig({
  base: '',
  plugins: [
    svelte(),
    viteStaticCopy({
      targets: [
        {
          src: 'loader.html',
          dest: ''
        }
      ]
    })
  ],
  server: {
    host: '0.0.0.0',
  },
  build: {
    outDir: '../cache/client',
    emptyOutDir: true,
  },
});
