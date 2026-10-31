import { defineConfig } from 'vitest/config';
import { VitePWA } from 'vite-plugin-pwa';
import solid from 'vite-plugin-solid';

export default defineConfig({
  plugins: [
    solid(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['apple-touch-icon.png', 'icon.svg'],
      workbox: { globPatterns: ['**/*.{html,js,css,woff2,png,svg}'] },
      manifest: {
        name: 'Basic Strategy Trainer',
        short_name: 'BS Trainer',
        description: 'Practice blackjack basic strategy, online or offline.',
        display: 'standalone',
        start_url: '/',
        theme_color: '#0a1714',
        background_color: '#0a1714',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
  test: { environment: 'node' },
});
