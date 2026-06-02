// @ts-check
import { defineConfig, envField } from 'astro/config';

import netlify from '@astrojs/netlify';

import alpinejs from '@astrojs/alpinejs';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: netlify(),
  server: {
    host: true,
  },
  integrations: [
    alpinejs({
      entrypoint: './src/lib/app.factory.js',
    }),
  ],

  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      include: ['chart.js', 'chart.js/auto'],
    },

  },
  devToolbar: {
    enabled: false,
  },
  env: {
    schema: {
      APP_PASSWORD: envField.string({
        context: 'server',
        access: 'secret',
      }),
      WRITE_TOKEN: envField.string({
        context: 'server',
        access: 'secret',
      }),
    },
  },
});