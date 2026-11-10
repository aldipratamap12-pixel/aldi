import { defineConfig } from 'astro/config';

// Static site. `site` is set after hosting is chosen (step 7).
export default defineConfig({
  output: 'static',
  trailingSlash: 'never',
  build: { format: 'directory' },
});
