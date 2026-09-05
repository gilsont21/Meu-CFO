/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
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
