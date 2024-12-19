/// <reference types="vitest/globals" />
import { defineConfig } from 'vitest/config'

export default defineConfig({
  root: './src',
  server: {
    open: true,
    host: '127.0.0.1'
  },
  test: {
    setupFiles: ['./setup.ts'],
    globals: true,
    environment: 'jsdom',
    coverage: {
      enabled: true,
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: '../coverage',
    },
  },
});