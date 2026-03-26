import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  // TODO: デプロイ先のURLに変更してください
  site: 'https://hamaryo.dev',

  vite: {
    css: {
      devSourcemap: true,
    },
  },

  integrations: [mdx(), react(), tailwind()],
});