import { defineConfig } from '@vite-pwa/assets-generator/config';

export default defineConfig({
  images: ['public/betguard-icon.svg'],
  preset: {
    transparent: {
      sizes: [64, 192, 512],
      favicons: [[48, 'favicon.ico']],
      padding: 0,
      resizeOptions: { fit: 'contain' },
    },
    maskable: {
      sizes: [512],
      padding: 0,
      resizeOptions: { fit: 'contain' },
    },
    apple: {
      sizes: [180],
      padding: 0,
      resizeOptions: { fit: 'contain' },
    },
  },
});
