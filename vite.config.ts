import { defineConfig } from 'vitest/config';
import solid from 'vite-plugin-solid';

export default defineConfig({
  // GitHub Pages serves the site from /<repo>/.
  base: '/blackjack-trainer/',
  plugins: [solid()],
  test: { environment: 'node' },
});
