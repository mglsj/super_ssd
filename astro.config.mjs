// @ts-check
import { defineConfig } from 'astro/config';

import mdx from '@astrojs/mdx';
import svelte from '@astrojs/svelte';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://mglsj.eu.org',
  base: '/super_ssd/',
  integrations: [mdx(), svelte()],
  markdown: {
    shikiConfig: {
      // both themes are emitted; CSS picks one for light / dark
      themes: { light: 'gruvbox-light-medium', dark: 'gruvbox-dark-medium' },
      defaultColor: false,
    },
  },
  vite: { plugins: [tailwindcss()] },
});
