import { defineConfig } from 'astro/config';

// Static site, hosted on Vercel at the custom domain.
export default defineConfig({
  site: 'https://aldipratamaputra.my.id',
  output: 'static',
  trailingSlash: 'never',
  build: { format: 'directory' },
});
