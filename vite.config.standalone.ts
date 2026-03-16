import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

/**
 * Vite config for the standalone (prebuilt) dist bundle.
 * Produces a single JS file that can be loaded via <script> tag.
 */
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist-standalone',
    lib: {
      entry: path.resolve(__dirname, 'src/standalone.tsx'),
      name: 'WsdlWeb',
      formats: ['iife'],
      fileName: () => 'wsdl-web.js',
    },
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        assetFileNames: 'wsdl-web.[ext]',
      },
    },
  },
})
