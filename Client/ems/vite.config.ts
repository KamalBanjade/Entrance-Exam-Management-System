import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  optimizeDeps: {
    include: ['lucide-react'], // Ensure Vite pre-bundles lucide-react
  },
  ssr: {
    noExternal: ['lucide-react'], // Prevent externalizing lucide-react in SSR
  },
});