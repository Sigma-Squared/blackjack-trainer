import { defineConfig } from 'vitest/config';
import { VitePWA } from 'vite-plugin-pwa';
import solid from 'vite-plugin-solid';

export default defineConfig({
  plugins: [
    solid(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['apple-touch-icon.png', 'favicon.png'],
      workbox: { globPatterns: ['**/*.{html,js,css,woff2,png,svg}'] },
      manifest: {
        name: 'Blackjack Trainer',
        short_name: 'BJ Trainer',
        description: 'Practice blackjack basic strategy, online or offline.',
        display: 'standalone',
        start_url: '/',
        theme_color: '#10201f',
        background_color: '#10201f',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
  test: { environment: 'node' },
});
