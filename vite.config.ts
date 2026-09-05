/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Meu CFO',
        short_name: 'Meu CFO',
        description: 'Gestão financeira pessoal com IA — posso gastar ou não?',
        theme_color: '#1A1A1A',
        background_color: '#1A1A1A',
        display: 'standalone',
        lang: 'pt-BR',
        icons: [
          { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,ico,webmanifest}'],
      },
    }),
  ],
  server: {
    proxy: {
      // Em dev o backend roda numa porta separada (npm run dev em server/);
      // em produção o próprio servidor serve o build, então o código do
      // front-end nunca aponta para uma URL fixa — só caminhos relativos.
      '/api': 'http://localhost:3000',
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.ts'],
  },
})
