import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import flowbiteReact from 'flowbite-react/plugin/vite';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';

export default defineConfig({
  plugins: [
    react(),
    flowbiteReact(),
  ],
  css: {
    postcss: {
      plugins: [
        tailwindcss(),
        autoprefixer(),
      ],
    },
  },
});