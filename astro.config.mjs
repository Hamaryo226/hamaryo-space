import { defineConfig } from 'astro/config';

import mdx from '@astrojs/mdx';

export default defineConfig({
  vite: {
    css: {
      devSourcemap: true,
    },
  },

  integrations: [mdx()],
});